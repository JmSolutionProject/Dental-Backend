import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMessageUseCase } from '../../application/use-cases/create-message.use-case';
import { CreateMessageRequestDto } from '../dtos/request/create-message.request.dto';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly createMessageUseCase: CreateMessageUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un mensaje' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreateMessageRequestDto) {
    return this.createMessageUseCase.execute(payload);
  }
}
