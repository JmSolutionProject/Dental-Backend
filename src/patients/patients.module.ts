import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { PATIENT_REPOSITORY } from './domain/repositories/patient.repository';
import { PrismaPatientRepository } from './infrastructure/persistence/prisma-patient.repository';
import { PatientsController } from './presentation/controllers/patients.controller';

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
  controllers: [PatientsController],
  providers: [
    CreatePatientUseCase,
    JwtAuthGuard,
    {
      provide: PATIENT_REPOSITORY,
      useClass: PrismaPatientRepository,
    },
  ],
})
export class PatientsModule {}
