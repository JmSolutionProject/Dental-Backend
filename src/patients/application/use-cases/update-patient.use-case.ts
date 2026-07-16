import { Inject, Injectable } from '@nestjs/common';
import { PatientEntity } from '../../domain/entities/patient.entity';
import {
  PATIENT_REPOSITORY,
  type PatientRepository,
  UpdatePatientParams,
} from '../../domain/repositories/patient.repository';

@Injectable()
export class UpdatePatientUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: PatientRepository,
  ) {}

  execute(id: number, payload: UpdatePatientParams): Promise<PatientEntity> {
    return this.patientRepository.update(id, payload);
  }
}
