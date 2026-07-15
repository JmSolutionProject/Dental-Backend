import { Inject, Injectable } from '@nestjs/common';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  execute(payload: unknown): Promise<unknown> {
    void payload;

    return this.messageRepository.findById(0);
  }
}
