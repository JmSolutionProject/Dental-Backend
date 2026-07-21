import { Inject, Injectable } from '@nestjs/common';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
  CreateAppointmentParams,
} from '../../domain/repositories/appointment.repository';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  execute(payload: CreateAppointmentParams): Promise<AppointmentEntity> {
    return this.appointmentRepository.create(payload);
  }

  listStatuses(): Promise<Array<{ id: number; nombreEstado: string }>> {
    return this.appointmentRepository.findAllStatuses();
  }
}
