import { config as loadEnv } from 'dotenv';
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

loadEnv({ path: '.env.local' });
loadEnv();

let cachedServer: ((req: Request, res: Response) => void) | undefined;

const defaultAllowedOrigins = [
  'http://localhost:4200',
  'https://dentalappc.netlify.app',
];

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN?.split(',') ?? defaultAllowedOrigins)
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin: string | undefined): boolean {
  if (typeof origin !== 'string' || origin.length === 0) {
    return false;
  }

  if (getAllowedOrigins().includes(origin)) {
    return true;
  }

  return origin.endsWith('.vercel.app');
}

function applyCorsHeaders(req: Request, res: Response): void {
  const origin = req.headers.origin;

  if (typeof origin === 'string' && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] ?? 'Content-Type, Authorization',
  );
}

function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

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

  return app.getHttpAdapter().getInstance() as (
    req: Request,
    res: Response,
  ) => void;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 13000);
}

export default async function handler(req: Request, res: Response): Promise<void> {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  cachedServer ??= await createServer();
  cachedServer(req, res);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
