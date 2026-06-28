import { MessageEntity } from '../entities/message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface MessageRepository {
  findById(id: number): Promise<MessageEntity | undefined>;
}
