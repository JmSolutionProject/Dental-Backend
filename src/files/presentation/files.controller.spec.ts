import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { FilesController } from './files.controller';
import { FilesService } from '../infrastructure/files.service';

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: { upload: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
