import { Injectable } from '@nestjs/common';
import { MessageRepository } from '@messages/domain/repositories/message.repository';

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  findById(): Promise<undefined> {
    return Promise.resolve(undefined);
  }
}
