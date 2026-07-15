import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  categoriaId!: number;

  @ApiProperty({ example: 'Limpieza dental' })
  @IsString()
  @MaxLength(150)
  nombreServicio!: string;

  @ApiPropertyOptional({ example: 'Incluye profilaxis y fluorizacion' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 85 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio!: number;

  @ApiPropertyOptional({ example: '2026-07-04' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;
}
