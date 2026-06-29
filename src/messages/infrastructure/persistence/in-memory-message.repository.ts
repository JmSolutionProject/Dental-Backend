import { Injectable } from '@nestjs/common';
import { MessageRepository } from '@messages/domain/repositories/message.repository';

@Injectable()
export class InMemoryMessageRepository implements MessageRepository {
  findById(): Promise<undefined> {
    return Promise.resolve(undefined);
  }
}
