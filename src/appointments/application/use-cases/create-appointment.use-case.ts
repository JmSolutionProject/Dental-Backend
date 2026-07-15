import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '../../domain/repositories/appointment.repository';
import type { AppointmentRepository } from '../../domain/repositories/appointment.repository';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  execute(payload: unknown): Promise<unknown> {
    void payload;

    return this.appointmentRepository.count().then((count) => ({ count }));
  }
}
