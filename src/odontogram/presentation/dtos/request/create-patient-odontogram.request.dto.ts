import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePatientOdontogramRequestDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  patientId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  citaId?: number;

  @ApiPropertyOptional({ example: 'Initial odontogram' })
  @IsOptional()
  @IsString()
  notes?: string;
}
