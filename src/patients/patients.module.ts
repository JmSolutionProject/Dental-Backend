import { Module } from '@nestjs/common';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { PATIENT_REPOSITORY } from './domain/repositories/patient.repository';
import { InMemoryPatientRepository } from './infrastructure/persistence/in-memory-patient.repository';
import { PatientsController } from './presentation/controllers/patients.controller';

@Module({
  controllers: [PatientsController],
  providers: [
    CreatePatientUseCase,
    {
      provide: PATIENT_REPOSITORY,
      useClass: InMemoryPatientRepository,
    },
  ],
})
export class PatientsModule {}
