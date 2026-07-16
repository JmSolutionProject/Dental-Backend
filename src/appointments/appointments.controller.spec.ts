import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CancelAppointmentUseCase } from './application/use-cases/cancel-appointment.use-case';
import { CheckAvailabilityUseCase } from './application/use-cases/check-availability.use-case';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from './application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from './application/use-cases/find-appointment-by-id.use-case';
import { UpdateAppointmentUseCase } from './application/use-cases/update-appointment.use-case';
import { AppointmentsController } from './presentation/controllers/appointments.controller';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AppointmentsController],
      providers: [
        {
          provide: CreateAppointmentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindAllAppointmentsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindAppointmentByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateAppointmentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CancelAppointmentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CheckAvailabilityUseCase,
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
