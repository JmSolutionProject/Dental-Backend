import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { R2Service } from './r2.service';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: R2Service,
          useValue: { uploadObject: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: { adjunto: { create: jest.fn() } },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
