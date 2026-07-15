import { PartialType } from '@nestjs/swagger';
import { CreateRolRequestDto } from './create-rol.request.dto';

export class UpdateRolRequestDto extends PartialType(CreateRolRequestDto) {}
