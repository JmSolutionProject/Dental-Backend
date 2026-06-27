import { Controller } from '@nestjs/common';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
  ) {}
}
