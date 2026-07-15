import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRolRequestDto {
  @ApiProperty({ example: 'admin', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombreRol!: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
