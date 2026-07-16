import { Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
  AvailabilityResult,
  CheckAvailabilityParams,
} from '../../domain/repositories/appointment.repository';

@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  execute(params: CheckAvailabilityParams): Promise<AvailabilityResult> {
    return this.appointmentRepository.checkAvailability(params);
  }
}
