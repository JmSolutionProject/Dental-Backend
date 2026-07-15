import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentRequestDto } from './create-appointment.request.dto';

export class UpdateAppointmentRequestDto extends PartialType(
  CreateAppointmentRequestDto,
) {}
