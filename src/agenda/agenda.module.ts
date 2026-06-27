import { Module } from '@nestjs/common';
import { CreateAgendaUseCase } from './application/use-cases/create-agenda.use-case';
import { AGENDA_REPOSITORY } from './domain/repositories/agenda.repository';
import { InMemoryAgendaRepository } from './infrastructure/persistence/in-memory-agenda.repository';
import { AgendaController } from './presentation/controllers/agenda.controller';

@Module({
  controllers: [AgendaController],
  providers: [
    CreateAgendaUseCase,
    {
      provide: AGENDA_REPOSITORY,
      useClass: InMemoryAgendaRepository,
    },
  ],
})
export class AgendaModule {}
