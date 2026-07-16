import { Inject, Injectable } from '@nestjs/common';
import { PatientEntity } from '../../domain/entities/patient.entity';
import {
  PATIENT_REPOSITORY,
  type PatientRepository,
} from '../../domain/repositories/patient.repository';

@Injectable()
export class FindPatientByIdUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: PatientRepository,
  ) {}

  execute(id: number): Promise<PatientEntity | null> {
    return this.patientRepository.findById(id);
  }
}
