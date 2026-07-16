import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RegisterOdontogramDetailRequestDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pacienteId: number;

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

  @ApiProperty({
    example: 1,
    description: 'Identificador interno de la pieza dental.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  piezaDentalId: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  superficieId?: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estadoPiezaId: number;

  @ApiPropertyOptional({ example: 'Caries oclusal en pieza 16.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  diagnostico?: string;

  @ApiPropertyOptional({ example: 'Evaluar restauracion con resina.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tratamientoRecomendado?: string;

  @ApiPropertyOptional({ example: 'Paciente refiere sensibilidad al frio.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  observacion?: string;

  @ApiPropertyOptional({ example: 'Odontograma inicial del paciente.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  observacionGeneral?: string;
}
