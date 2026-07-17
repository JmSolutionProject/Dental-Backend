import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { environment } from '@config/environment.development';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private connectPromise: Promise<void> | null = null;

  constructor() {
    const connectionString = environment.url;

    if (typeof connectionString !== 'string' || connectionString.length === 0) {
      throw new Error(
        'DATABASE_URL no esta definido. Carga .env.local o configura la variable de entorno antes de iniciar Nest.',
      );
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    this.connectPromise ??= this.$connect();
    await this.connectPromise;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
