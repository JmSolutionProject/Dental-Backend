import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@shared/infrastructure/persistence/prisma/prisma.module';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CreateCatalogUseCase } from './application/use-cases/create-catalog.use-case';
import { CatalogController } from './presentation/controllers/catalog.controller';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [CatalogController],
  providers: [CreateCatalogUseCase, JwtAuthGuard, PrismaService],
})
export class CatalogModule {}
