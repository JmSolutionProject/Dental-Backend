import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMessageRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  plantillaId!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  pacienteId!: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  citaId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  estadoEnvioId!: number;

  @ApiProperty({ example: '2026-07-06T09:30:00.000Z' })
  @IsDateString()
  fechaHoraProgramada!: string;

  @ApiPropertyOptional({ example: '2026-07-06T09:35:00.000Z' })
  @IsOptional()
  @IsDateString()
  fechaHoraEnvio?: string;

  @ApiPropertyOptional({ example: 'Error de proveedor externo' })
  @IsOptional()
  @IsString()
  errorDetalle?: string;
}
