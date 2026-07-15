import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OdontogramDetailResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  odontogramaId: number;

  @ApiProperty()
  piezaDentalId: number;

  @ApiPropertyOptional()
  superficieId?: number;

  @ApiProperty()
  estadoPiezaId: number;

  @ApiPropertyOptional()
  diagnostico?: string;

  @ApiPropertyOptional()
  tratamientoRecomendado?: string;

  @ApiPropertyOptional()
  observacion?: string;
}
