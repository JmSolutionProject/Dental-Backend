import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CreateMessageUseCase } from './application/use-cases/create-message.use-case';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma-message.repository';
import { WhatsappService } from './infrastructure/whatsapp/whatsapp.service';
import { MessagesController } from './presentation/controllers/messages.controller';
import { WhatsappController } from './presentation/controllers/whatsapp.controller';

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
  controllers: [MessagesController, WhatsappController],
  providers: [
    CreateMessageUseCase,
    JwtAuthGuard,
    WhatsappService,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
  ],
})
export class MessagesModule {}
