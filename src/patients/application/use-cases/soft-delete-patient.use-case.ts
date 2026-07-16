import { Inject, Injectable } from '@nestjs/common';
import { PatientEntity } from '../../domain/entities/patient.entity';
import {
  PATIENT_REPOSITORY,
  type PatientRepository,
} from '../../domain/repositories/patient.repository';

@Injectable()
export class SoftDeletePatientUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: PatientRepository,
  ) {}

  execute(id: number): Promise<PatientEntity> {
    return this.patientRepository.softDelete(id);
  }
}
