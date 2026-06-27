import { Test, TestingModule } from '@nestjs/testing';
import { CreateAgendaUseCase } from './create-agenda.use-case';
import { AGENDA_REPOSITORY } from '../../domain/repositories/agenda.repository';

describe('CreateAgendaUseCase', () => {
  let provider: CreateAgendaUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAgendaUseCase,
        {
          provide: AGENDA_REPOSITORY,
          useValue: {},
        },
      ],
    }).compile();

    provider = module.get<CreateAgendaUseCase>(CreateAgendaUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
