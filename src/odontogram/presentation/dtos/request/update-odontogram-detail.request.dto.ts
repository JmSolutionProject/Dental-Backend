import { PartialType } from '@nestjs/swagger';
import { RegisterOdontogramDetailRequestDto } from './register-odontogram-detail.request.dto';

export class UpdateOdontogramDetailRequestDto extends PartialType(
  RegisterOdontogramDetailRequestDto,
) {}
