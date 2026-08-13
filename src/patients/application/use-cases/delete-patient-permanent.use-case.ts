import { Inject, Injectable } from '@nestjs/common';
import {
  PATIENT_REPOSITORY,
  type PatientRepository,
} from '../../domain/repositories/patient.repository';

@Injectable()
export class DeletePatientPermanentUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: PatientRepository,
  ) {}

  execute(id: number): Promise<void> {
    return this.patientRepository.deletePermanent(id);
  }
}
