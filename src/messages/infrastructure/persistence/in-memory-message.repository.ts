import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../domain/repositories/message.repository';

@Injectable()
export class InMemoryMessageRepository implements MessageRepository {}
