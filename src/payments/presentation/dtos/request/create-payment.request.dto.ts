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

export class CreatePaymentRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  citaId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  usuarioCobradorId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  metodoPagoId!: number;

  @ApiProperty({ example: 120.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montoPagado!: number;

  @ApiPropertyOptional({ example: 'YAPE-00012345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroOperacion?: string;

  @ApiPropertyOptional({ example: 'Pago parcial de la cita' })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({ example: '2026-07-03T20:15:00.000Z' })
  @IsOptional()
  @IsDateString()
  fechaPago?: string;
}
