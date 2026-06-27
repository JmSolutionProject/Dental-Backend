import { Inject, Injectable } from '@nestjs/common';
import { AGENDA_REPOSITORY } from '../../domain/repositories/agenda.repository';
import type { AgendaRepository } from '../../domain/repositories/agenda.repository';

@Injectable()
export class CreateAgendaUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}
}
