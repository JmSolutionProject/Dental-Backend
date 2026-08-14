import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { FilesModule } from '@/files/files.module';
import { ConfigModule } from '@/config/config.module';
import { CreateMessageUseCase } from './application/use-cases/create-message.use-case';
import { WhatsappBroadcastSenderFactory } from './application/services/whatsapp-broadcast-sender.factory';
import { WhatsappBroadcastService } from './application/services/whatsapp-broadcast.service';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { WHATSAPP_BROADCAST_REPOSITORY } from './domain/repositories/whatsapp-broadcast.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma-message.repository';
import { PrismaWhatsappBroadcastRepository } from './infrastructure/persistence/prisma-whatsapp-broadcast.repository';
import { CustomWhatsappMessageSender } from './infrastructure/whatsapp/custom-whatsapp-message.sender';
import { WhatsappService } from './infrastructure/whatsapp/whatsapp.service';
import { WhatsappBroadcastWorker } from './infrastructure/workers/whatsapp-broadcast.worker';
import { AppointmentReminderWorker } from './infrastructure/workers/appointment-reminder.worker';
import { MessagesController } from './presentation/controllers/messages.controller';
import { WhatsappBroadcastController } from './presentation/controllers/whatsapp-broadcast.controller';
import { WhatsappController } from './presentation/controllers/whatsapp.controller';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    FilesModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [
    MessagesController,
    WhatsappController,
    WhatsappBroadcastController,
  ],
  providers: [
    CreateMessageUseCase,
    WhatsappBroadcastService,
    WhatsappBroadcastSenderFactory,
    JwtAuthGuard,
    WhatsappService,
    CustomWhatsappMessageSender,
    WhatsappBroadcastWorker,
    AppointmentReminderWorker,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
    {
      provide: WHATSAPP_BROADCAST_REPOSITORY,
      useClass: PrismaWhatsappBroadcastRepository,
    },
  ],
})
export class MessagesModule {}
