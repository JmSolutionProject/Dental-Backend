import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePatientOdontogramRequestDto {
  @ApiProperty({ example: 11 })
  @IsInt()
  fdiNumber!: number;

  @ApiProperty({ example: 'caries' })
  @IsString()
  condition!: string;

  @ApiPropertyOptional({ example: 'Caries oclusal' })
  @IsOptional()
  @IsString()
  notes?: string;
}
