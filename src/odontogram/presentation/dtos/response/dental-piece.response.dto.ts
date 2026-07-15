import { ApiProperty } from '@nestjs/swagger';

export class DentalPieceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: '11' })
  codigoFdi: string;

  @ApiProperty({ example: 'Pieza FDI 11' })
  nombrePieza: string;

  @ApiProperty({ example: 'permanente' })
  tipoPieza: string;

  @ApiProperty({ example: 1 })
  cuadrante: number;

  @ApiProperty({ example: 'superior' })
  arcada: string;

  @ApiProperty({ example: 'derecho' })
  lado: string;

  @ApiProperty({ example: 1 })
  posicion: number;

  @ApiProperty({ example: true })
  estado: boolean;
}

export class DentalSurfaceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Oclusal' })
  nombreSuperficie: string;

  @ApiProperty({ example: 'O' })
  abreviatura: string;
}

export class ToothStateResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Caries' })
  nombreEstado: string;
}
