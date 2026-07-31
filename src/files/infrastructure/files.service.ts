import { Injectable } from '@nestjs/common';
import { extname, parse } from 'node:path';
import { randomUUID } from 'node:crypto';
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
