import { Module } from '@nestjs/common';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { APPOINTMENT_REPOSITORY } from './domain/repositories/appointment.repository';
import { InMemoryAppointmentRepository } from './infrastructure/persistence/in-memory-appointment.repository';
import { AppointmentsController } from './presentation/controllers/appointments.controller';

@Module({
  controllers: [AppointmentsController],
  providers: [
    CreateAppointmentUseCase,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: InMemoryAppointmentRepository,
    },
  ],
})
export class AppointmentsModule {}
