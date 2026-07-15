import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  count(): Promise<number> {
    return Promise.resolve(0);
  }
}
