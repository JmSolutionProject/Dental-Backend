import { Controller } from '@nestjs/common';
import { CreateAgendaUseCase } from '../../application/use-cases/create-agenda.use-case';

@Controller('agendas')
export class AgendaController {
  constructor(private readonly createAgendaUseCase: CreateAgendaUseCase) {}
}
