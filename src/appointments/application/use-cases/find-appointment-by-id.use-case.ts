import { Inject, Injectable } from '@nestjs/common';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
} from '../../domain/repositories/appointment.repository';

@Injectable()
export class FindAppointmentByIdUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  execute(id: number): Promise<AppointmentEntity | null> {
    return this.appointmentRepository.findById(id);
  }
}
