import { Controller } from '@nestjs/common';
import { CreateMessageUseCase } from '../../application/use-cases/create-message.use-case';

@Controller('messages')
export class MessagesController {
  constructor(private readonly createMessageUseCase: CreateMessageUseCase) {}
}
