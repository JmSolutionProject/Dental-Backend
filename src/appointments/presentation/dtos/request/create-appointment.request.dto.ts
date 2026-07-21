import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AppointmentServiceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  servicioId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  cantidad!: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  descuento?: number;
}

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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  planServicioId?: number;

  @ApiPropertyOptional({ type: [AppointmentServiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentServiceDto)
  servicios?: AppointmentServiceDto[];
}
