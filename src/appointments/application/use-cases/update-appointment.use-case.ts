import { Inject, Injectable } from '@nestjs/common';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
  UpdateAppointmentParams,
} from '../../domain/repositories/appointment.repository';

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  execute(
    id: number,
    payload: UpdateAppointmentParams,
  ): Promise<AppointmentEntity> {
    return this.appointmentRepository.update(id, payload);
  }
}
