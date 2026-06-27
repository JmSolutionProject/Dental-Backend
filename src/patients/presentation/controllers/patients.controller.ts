import { Controller } from '@nestjs/common';
import { CreatePatientUseCase } from '../../application/use-cases/create-patient.use-case';

@Controller('patients')
export class PatientsController {
  constructor(private readonly createPatientUseCase: CreatePatientUseCase) {}
}
