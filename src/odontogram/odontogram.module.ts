import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { ListDentalPiecesUseCase } from './application/use-cases/list-dental-pieces.use-case';
import { ListDentalSurfacesUseCase } from './application/use-cases/list-dental-surfaces.use-case';
import { ListToothStatesUseCase } from './application/use-cases/list-tooth-states.use-case';
import { RegisterOdontogramDetailUseCase } from './application/use-cases/register-odontogram-detail.use-case';
import { ODONTOGRAM_REPOSITORY } from './domain/repositories/odontogram.repository';
import { PrismaOdontogramRepository } from './infrastructure/persistence/prisma-odontogram.repository';
import {
  OdontogramController,
  PatientOdontogramsController,
} from './presentation/controllers/odontogram.controller';

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
  controllers: [OdontogramController, PatientOdontogramsController],
  providers: [
    ListDentalPiecesUseCase,
    ListDentalSurfacesUseCase,
    ListToothStatesUseCase,
    RegisterOdontogramDetailUseCase,
    JwtAuthGuard,
    {
      provide: ODONTOGRAM_REPOSITORY,
      useClass: PrismaOdontogramRepository,
    },
  ],
})
export class OdontogramModule {}
