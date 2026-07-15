import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListPatientsRequestDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'firstName' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
