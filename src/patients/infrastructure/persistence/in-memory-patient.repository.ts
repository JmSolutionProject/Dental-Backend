import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';

@Injectable()
export class InMemoryPatientRepository implements PatientRepository {
  count(): Promise<number> {
    return Promise.resolve(0);
  }
}
