import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { CreateAppointmentRequestDto } from '../dtos/request/create-appointment.request.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una cita' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreateAppointmentRequestDto) {
    return this.createAppointmentUseCase.execute(payload);
  }
}
