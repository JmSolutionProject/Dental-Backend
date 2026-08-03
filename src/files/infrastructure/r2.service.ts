import {
  GetObjectCommand,
  type GetObjectCommandOutput,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  PutObjectCommand,
  type PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'node:stream';

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
};

type R2Client = {
  send(command: PutObjectCommand): Promise<PutObjectCommandOutput>;
  send(command: GetObjectCommand): Promise<GetObjectCommandOutput>;
  send(command: ListObjectsV2Command): Promise<ListObjectsV2CommandOutput>;
};

@Injectable()
export class R2Service {
  private client: R2Client | null = null;

  async uploadObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<{ key: string; url?: string }> {
    const config = this.getConfig();

    await this.getClient(config).send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );

    return {
      key: params.key,
      url: config.publicUrl
        ? `${config.publicUrl.replace(/\/$/, '')}/${params.key}`
        : undefined,
    };
  }

  async getObject(key: string): Promise<{
    body: Readable;
    contentType: string;
    contentLength?: number;
  }> {
    const config = this.getConfig();

    try {
      const object = await this.getClient(config).send(
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: key,
        }),
      );

      if (!object.Body) {
        throw new NotFoundException('File not found.');
      }

      return {
        body: object.Body as Readable,
        contentType: object.ContentType ?? 'application/octet-stream',
        contentLength: object.ContentLength,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'NoSuchKey') {
        throw new NotFoundException('File not found.');
      }

      throw error;
    }
  }

  async listObjects(prefix?: string): Promise<
    Array<{
      key: string;
      size?: number;
      lastModified?: Date;
      url?: string;
    }>
  > {
    const config = this.getConfig();
    const objects: Array<{
      key: string;
      size?: number;
      lastModified?: Date;
      url?: string;
    }> = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.getClient(config).send(
        new ListObjectsV2Command({
          Bucket: config.bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      for (const object of response.Contents ?? []) {
        if (!object.Key) {
          continue;
        }

        objects.push({
          key: object.Key,
          size: object.Size,
          lastModified: object.LastModified,
          url: config.publicUrl
            ? `${config.publicUrl.replace(/\/$/, '')}/${object.Key}`
            : undefined,
        });
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  private getClient(config: R2Config): R2Client {
    this.client ??= new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }) as R2Client;

    return this.client;
  }

  private getConfig(): R2Config {
    const requiredConfig = {
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    };
    const missingConfig = Object.entries(requiredConfig)
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missingConfig.length > 0) {
      throw new InternalServerErrorException(
        `Cloudflare R2 is not configured. Missing: ${missingConfig.join(', ')}.`,
      );
    }

    const {
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME,
    } = requiredConfig as Record<keyof typeof requiredConfig, string>;

    return {
      accountId: R2_ACCOUNT_ID,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      bucketName: R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
    };
  }
}
