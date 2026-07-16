import { Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
  FindAllAppointmentsParams,
  PaginatedAppointmentsResult,
} from '../../domain/repositories/appointment.repository';

@Injectable()
export class FindAllAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  execute(
    params: FindAllAppointmentsParams,
  ): Promise<PaginatedAppointmentsResult> {
    return this.appointmentRepository.findAll(params);
  }
}
