import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { extname, parse } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import 'multer';
import sharp from 'sharp';
import { R2Service } from './r2.service';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

const IMAGE_MIME_PATTERN = /^image\/(avif|bmp|gif|jpe?g|png|webp|svg\+xml)$/i;
const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 80;

type UploadOptions = {
  patientId?: number;
  description?: string;
  servicioId?: number;
};

type AttachmentResponse = {
  id: string;
  patientId: string;
  servicioId: string | null;
  servicioName: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  description: string | null;
  createdAt: string;
  r2Key: string;
  url: string;
};

@Injectable()
export class FilesService {
  constructor(
    private readonly r2Service: R2Service,
    private readonly prisma: PrismaService,
  ) {}

  async upload(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<AttachmentResponse | { key: string; url?: string }> {
    const isImage = IMAGE_MIME_PATTERN.test(file.mimetype);

    let body = file.buffer;
    let contentType = file.mimetype;
    let ext = extname(file.originalname).toLowerCase();

    if (isImage && options.patientId) {
      try {
        body = await sharp(file.buffer)
          .rotate()
          .resize({
            width: MAX_IMAGE_DIMENSION,
            height: MAX_IMAGE_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
        contentType = 'image/webp';
        ext = '.webp';
      } catch {
        // Keep the original buffer when the image cannot be processed.
      }
    }

    const key = this.buildObjectKey(file.originalname, options.patientId, ext);

    const uploaded = await this.r2Service.uploadObject({
      key,
      body,
      contentType,
    });

    if (!options.patientId) {
      return {
        key,
        url: uploaded.url,
      };
    }

    await this.ensurePatientExists(options.patientId);
    if (options.servicioId) {
      await this.ensureServicioExists(options.servicioId);
    }

    const adjunto = await this.prisma.adjunto.create({
      data: {
        pacienteId: options.patientId,
        servicioId: options.servicioId ?? null,
        descripcion: options.description?.trim() || null,
        r2Key: key,
        fileName: isImage
          ? `${parse(file.originalname).name || 'imagen'}.webp`
          : file.originalname,
        mimeType: contentType,
        size: body.length,
      },
      include: { servicio: true },
    });

    return this.toAttachmentResponse(adjunto);
  }

  async listByPatient(patientId: number): Promise<AttachmentResponse[]> {
    await this.ensurePatientExists(patientId);

    const adjuntos = await this.prisma.adjunto.findMany({
      where: { pacienteId: patientId },
      orderBy: { fechaRegistro: 'desc' },
      include: { servicio: true },
    });

    return adjuntos.map((adjunto) => this.toAttachmentResponse(adjunto));
  }

  async deleteAdjunto(id: number): Promise<{ id: string; deleted: boolean }> {
    const adjunto = await this.prisma.adjunto.findUnique({ where: { id } });

    if (!adjunto) {
      throw new NotFoundException('Adjunto no encontrado.');
    }

    await this.r2Service.deleteObject(adjunto.r2Key);
    await this.prisma.adjunto.delete({ where: { id } });

    return { id: String(id), deleted: true };
  }

  async getImage(key: string): Promise<{
    body: Readable;
    contentType: string;
    contentLength?: number;
  }> {
    return this.r2Service.getObject(key);
  }

  async getFileBuffer(key: string): Promise<{
    buffer: Buffer;
    contentType: string;
    filename: string;
  }> {
    const file = await this.r2Service.getObject(key);
    const chunks: Buffer[] = [];

    for await (const chunk of file.body) {
      chunks.push(
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array),
      );
    }

    return {
      buffer: Buffer.concat(chunks),
      contentType: file.contentType,
      filename: key.split('/').pop() ?? 'file',
    };
  }

  async listImages(): Promise<
    Array<{
      key: string;
      size?: number;
      lastModified?: Date;
      url?: string;
    }>
  > {
    const objects = await this.r2Service.listObjects('uploads/');

    return objects.filter((object) =>
      /\.(avif|gif|jpe?g|png|webp)$/i.test(object.key),
    );
  }

  private toAttachmentResponse(adjunto: {
    id: number;
    pacienteId: number;
    servicioId: number | null;
    descripcion: string | null;
    r2Key: string;
    fileName: string;
    mimeType: string;
    size: number;
    fechaRegistro: Date;
    servicio: { nombreServicio: string } | null;
  }): AttachmentResponse {
    return {
      id: String(adjunto.id),
      patientId: String(adjunto.pacienteId),
      servicioId: adjunto.servicioId ? String(adjunto.servicioId) : null,
      servicioName: adjunto.servicio?.nombreServicio ?? null,
      fileName: adjunto.fileName,
      mimeType: adjunto.mimeType,
      size: adjunto.size,
      description: adjunto.descripcion,
      createdAt: adjunto.fechaRegistro.toISOString(),
      r2Key: adjunto.r2Key,
      url: `/api/files/image?key=${encodeURIComponent(adjunto.r2Key)}`,
    };
  }

  private buildObjectKey(
    originalName: string,
    patientId?: number,
    extOverride?: string,
  ): string {
    const { name } = parse(originalName);
    const safeName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    const ext = extOverride ?? extname(originalName).toLowerCase();
    const prefix = patientId ? `pacientes/${patientId}` : 'uploads';

    return `${prefix}/${randomUUID()}-${safeName || 'file'}${ext}`;
  }

  private async ensurePatientExists(patientId: number): Promise<void> {
    const patient = await this.prisma.paciente.findUnique({
      where: { id: patientId },
      select: { id: true },
    });

    if (!patient) {
      throw new BadRequestException('Paciente no encontrado.');
    }
  }

  private async ensureServicioExists(servicioId: number): Promise<void> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
      select: { id: true },
    });

    if (!servicio) {
      throw new BadRequestException('Servicio no encontrado.');
    }
  }
}
