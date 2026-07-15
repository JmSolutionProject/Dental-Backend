import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePatientUseCase } from '../../application/use-cases/create-patient.use-case';
import { CreatePatientRequestDto } from '../dtos/request/create-patient.request.dto';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly createPatientUseCase: CreatePatientUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Crear un paciente' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreatePatientRequestDto) {
    return this.createPatientUseCase.execute(payload);
  }
}
