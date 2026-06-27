import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from './application/use-cases/create-message.use-case';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { InMemoryMessageRepository } from './infrastructure/persistence/in-memory-message.repository';
import { MessagesController } from './presentation/controllers/messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [
    CreateMessageUseCase,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: InMemoryMessageRepository,
    },
  ],
})
export class MessagesModule {}
