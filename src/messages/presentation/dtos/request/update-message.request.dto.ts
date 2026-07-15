import { PartialType } from '@nestjs/swagger';
import { CreateMessageRequestDto } from './create-message.request.dto';

export class UpdateMessageRequestDto extends PartialType(
  CreateMessageRequestDto,
) {}
