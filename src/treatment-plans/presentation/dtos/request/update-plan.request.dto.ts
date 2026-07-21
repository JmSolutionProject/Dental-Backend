import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePlanRequestDto {
  @ApiProperty({ required: false, example: 'aprobado' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
