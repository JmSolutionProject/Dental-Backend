import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RegisterOdontogramDetailRequestDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pacienteId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patientId?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  citaId?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  odontogramaId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Identificador interno de la pieza dental.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  piezaDentalId?: number;

  @ApiPropertyOptional({ example: 22 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fdiNumber?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  superficieId?: number;

  @ApiPropertyOptional({ example: 'vestibular' })
  @IsOptional()
  @IsString()
  surface?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estadoPiezaId?: number;

  @ApiPropertyOptional({ example: 'caries' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ example: 'Caries oclusal en pieza 16.' })
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @ApiPropertyOptional({ example: 'Evaluar restauracion con resina.' })
  @IsOptional()
  @IsString()
  tratamientoRecomendado?: string;

  @ApiPropertyOptional({ example: 'Paciente refiere sensibilidad al frio.' })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({ example: 'Caries visible' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Odontograma inicial del paciente.' })
  @IsOptional()
  @IsString()
  observacionGeneral?: string;
}
