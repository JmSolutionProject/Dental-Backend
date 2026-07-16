import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { FindAllPatientsUseCase } from './application/use-cases/find-all-patients.use-case';
import { FindPatientByIdUseCase } from './application/use-cases/find-patient-by-id.use-case';
import { SoftDeletePatientUseCase } from './application/use-cases/soft-delete-patient.use-case';
import { UpdatePatientUseCase } from './application/use-cases/update-patient.use-case';
import { PatientsController } from './presentation/controllers/patients.controller';

describe('PatientsController', () => {
  let controller: PatientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [PatientsController],
      providers: [
        {
          provide: CreatePatientUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindAllPatientsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindPatientByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdatePatientUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SoftDeletePatientUseCase,
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
