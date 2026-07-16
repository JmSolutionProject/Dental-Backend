import { Inject, Injectable } from '@nestjs/common';
import {
  FindAllPatientsParams,
  PaginatedPatientsResult,
  PATIENT_REPOSITORY,
  type PatientRepository,
} from '../../domain/repositories/patient.repository';

@Injectable()
export class FindAllPatientsUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: PatientRepository,
  ) {}

  execute(params: FindAllPatientsParams): Promise<PaginatedPatientsResult> {
    return this.patientRepository.findAll(params);
  }
}
