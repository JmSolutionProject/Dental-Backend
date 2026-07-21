import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePatientRequestDto } from './create-patient.request.dto';

export class UpdatePatientRequestDto extends PartialType(
  CreatePatientRequestDto,
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
