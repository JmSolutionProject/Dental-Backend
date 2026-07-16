import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CancelAppointmentUseCase } from './application/use-cases/cancel-appointment.use-case';
import { CheckAvailabilityUseCase } from './application/use-cases/check-availability.use-case';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from './application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from './application/use-cases/find-appointment-by-id.use-case';
import { UpdateAppointmentUseCase } from './application/use-cases/update-appointment.use-case';
import { APPOINTMENT_REPOSITORY } from './domain/repositories/appointment.repository';
import { PrismaAppointmentRepository } from './infrastructure/persistence/prisma-appointment.repository';
import { AppointmentsController } from './presentation/controllers/appointments.controller';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [AppointmentsController],
  providers: [
    CreateAppointmentUseCase,
    FindAllAppointmentsUseCase,
    FindAppointmentByIdUseCase,
    UpdateAppointmentUseCase,
    CancelAppointmentUseCase,
    CheckAvailabilityUseCase,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: PrismaAppointmentRepository,
    },
  ],
})
export class AppointmentsModule {}
