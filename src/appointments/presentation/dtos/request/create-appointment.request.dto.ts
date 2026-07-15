import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAppointmentRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  pacienteId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  medicoId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  estadoCitaId!: number;

  @ApiProperty({ example: '2026-07-05T09:00:00.000Z' })
  @IsDateString()
  fechaHoraInicio!: string;

  @ApiProperty({ example: '2026-07-05T10:00:00.000Z' })
  @IsDateString()
  fechaHoraFin!: string;

  @ApiPropertyOptional({ example: 'Dolor molar' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivoPrincipal?: string;

  @ApiPropertyOptional({ example: 'Paciente requiere radiografia' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
