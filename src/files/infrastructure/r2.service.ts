import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
};

@Injectable()
export class R2Service {
  private client: S3Client | null = null;

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

  private getClient(config: R2Config): S3Client {
    this.client ??= new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

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
