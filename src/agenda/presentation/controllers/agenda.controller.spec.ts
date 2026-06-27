import { Test, TestingModule } from '@nestjs/testing';
import { CreateAgendaUseCase } from '../../application/use-cases/create-agenda.use-case';
import { AgendaController } from './agenda.controller';

describe('AgendaController', () => {
  let controller: AgendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendaController],
      providers: [
        {
          provide: CreateAgendaUseCase,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AgendaController>(AgendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
