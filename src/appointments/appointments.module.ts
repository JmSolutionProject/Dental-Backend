import { Module } from '@nestjs/common';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { APPOINTMENT_REPOSITORY } from './domain/repositories/appointment.repository';
import { PrismaAppointmentRepository } from './infrastructure/persistence/prisma-appointment.repository';
import { AppointmentsController } from './presentation/controllers/appointments.controller';

@Module({
  controllers: [AppointmentsController],
  providers: [
    CreateAppointmentUseCase,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: PrismaAppointmentRepository,
    },
  ],
})
export class AppointmentsModule {}
