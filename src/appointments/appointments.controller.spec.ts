import { Test, TestingModule } from '@nestjs/testing';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { AppointmentsController } from './presentation/controllers/appointments.controller';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: CreateAppointmentUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
