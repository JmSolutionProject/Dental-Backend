import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CreateCatalogUseCase } from './application/use-cases/create-catalog.use-case';
import { CATALOG_REPOSITORY } from './domain/repositories/catalog.repository';
import { PrismaCatalogRepository } from './infrastructure/persistence/prisma-catalog.repository';
import { CatalogController } from './presentation/controllers/catalog.controller';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [CatalogController],
  providers: [
    CreateCatalogUseCase,
    JwtAuthGuard,
    {
      provide: CATALOG_REPOSITORY,
      useClass: PrismaCatalogRepository,
    },
  ],
})
export class CatalogModule {}
