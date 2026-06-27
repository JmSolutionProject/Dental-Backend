import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MessagesModule } from './messages/messages.module';
import { AgendaModule } from './agenda/agenda.module';

@Module({
  imports: [PatientsModule, AppointmentsModule, MessagesModule, AgendaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
