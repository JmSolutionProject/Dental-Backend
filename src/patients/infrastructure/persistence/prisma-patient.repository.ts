import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';

@Injectable()
export class PrismaPatientRepository implements PatientRepository {
  count(): Promise<number> {
    return Promise.resolve(0);
  }
}
