import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AppointmentAvailabilityRequestDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  dentistId?: string;

  @ApiPropertyOptional({ example: '2026-07-15T15:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiPropertyOptional({ example: '2026-07-15T16:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  end?: string;
}
