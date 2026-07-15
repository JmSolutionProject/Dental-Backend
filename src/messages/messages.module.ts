import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CreateMessageUseCase } from './application/use-cases/create-message.use-case';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma-message.repository';
import { MessagesController } from './presentation/controllers/messages.controller';

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
  controllers: [MessagesController],
  providers: [
    CreateMessageUseCase,
    JwtAuthGuard,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
  ],
})
export class MessagesModule {}
