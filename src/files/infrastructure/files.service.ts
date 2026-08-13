import { Injectable } from '@nestjs/common';
import { extname, parse } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import 'multer';
import { R2Service } from './r2.service';

@Injectable()
export class FilesService {
  constructor(private readonly r2Service: R2Service) {}

  async upload(file: Express.Multer.File): Promise<{
    key: string;
    url?: string;
    originalName: string;
    mimeType: string;
    size: number;
  }> {
    const key = this.buildObjectKey(file.originalname);
    const uploaded = await this.r2Service.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    return {
      ...uploaded,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
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

  private buildObjectKey(originalName: string): string {
    const { name } = parse(originalName);
    const safeName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return `uploads/${randomUUID()}-${safeName || 'file'}${extname(originalName).toLowerCase()}`;
  }
}
