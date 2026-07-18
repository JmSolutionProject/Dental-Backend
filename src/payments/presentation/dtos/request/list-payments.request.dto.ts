import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListPaymentsRequestDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ example: 'Yape' })
  @IsOptional()
  @IsString()
  search?: string;
}
