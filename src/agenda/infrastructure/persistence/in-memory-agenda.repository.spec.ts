import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryAgendaRepository } from './in-memory-agenda.repository';

describe('InMemoryAgendaRepository', () => {
  let provider: InMemoryAgendaRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryAgendaRepository],
    }).compile();

    provider = module.get<InMemoryAgendaRepository>(InMemoryAgendaRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
