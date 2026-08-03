import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWhatsappBroadcastCampaignRequestDto {
  @ApiProperty({ example: 'Campana de limpieza dental' })
  @IsString()
  nombreCampana!: string;

  @ApiPropertyOptional({ example: 'Promocion enviada a pacientes activos' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  pacienteIds!: number[];

  @ApiProperty({ example: 'Hola, tenemos una promocion disponible para ti.' })
  @IsString()
  contenido!: string;

  @ApiPropertyOptional({ example: 'uploads/promo.png' })
  @IsOptional()
  @IsString()
  mediaKey?: string;

  @ApiPropertyOptional({ example: 'promo.png' })
  @IsOptional()
  @IsString()
  mediaName?: string;

  @ApiPropertyOptional({ example: 'image/png' })
  @IsOptional()
  @IsString()
  mediaMimeType?: string;

  @ApiPropertyOptional({ example: 'custom-message', default: 'custom-message' })
  @IsOptional()
  @IsIn(['custom-message'])
  tipoEnvio?: 'custom-message';

  @ApiPropertyOptional({ example: 3, default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  maxIntentos?: number;
}
