import { Module } from '@nestjs/common';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { PATIENT_REPOSITORY } from './domain/repositories/patient.repository';
import { PrismaPatientRepository } from './infrastructure/persistence/prisma-patient.repository';
import { PatientsController } from './presentation/controllers/patients.controller';

@Module({
  controllers: [PatientsController],
  providers: [
    CreatePatientUseCase,
    {
      provide: PATIENT_REPOSITORY,
      useClass: PrismaPatientRepository,
    },
  ],
})
export class PatientsModule {}
