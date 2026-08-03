import 'tsconfig-paths/register';
import { config as loadEnv } from 'dotenv';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

loadEnv({ path: '.env.local' });
loadEnv();

let cachedServer: ((req: Request, res: Response) => void) | undefined;

function configureApp(app: INestApplication): void {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') ?? [
    'http://localhost:4200',
    process.env.URL_PRODUCCTION_APP,
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dental Clinic API')
    .setDescription('Documentation for the dental clinic backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);
}

async function createServer(): Promise<(req: Request, res: Response) => void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.init();

  return app.getHttpAdapter().getInstance();
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 13000);
}

export default async function handler(req: Request, res: Response): Promise<void> {
  cachedServer ??= await createServer();
  cachedServer(req, res);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
