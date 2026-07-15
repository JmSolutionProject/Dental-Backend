import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '../../domain/repositories/patient.repository';
import type { PatientRepository } from '../../domain/repositories/patient.repository';

@Injectable()
export class CreatePatientUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: PatientRepository,
  ) {}

  execute(payload: unknown): Promise<unknown> {
    void payload;

    return this.patientRepository.count().then((count) => ({ count }));
  }
}
