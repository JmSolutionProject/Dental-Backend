import { Test, TestingModule } from '@nestjs/testing';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { PatientsController } from './presentation/controllers/patients.controller';

describe('PatientsController', () => {
  let controller: PatientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: CreatePatientUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
