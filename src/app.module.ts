import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MessagesModule } from './messages/messages.module';
import { PaymentsModule } from './payments/payments.module';
import { OdontogramModule } from './odontogram/odontogram.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './shared/infrastructure/persistence/prisma/prisma.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    CatalogModule,
    PaymentsModule,
    MessagesModule,
    OdontogramModule,
    DashboardModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
