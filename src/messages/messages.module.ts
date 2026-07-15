import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from './application/use-cases/create-message.use-case';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma-message.repository';
import { MessagesController } from './presentation/controllers/messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [
    CreateMessageUseCase,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
  ],
})
export class MessagesModule {}
