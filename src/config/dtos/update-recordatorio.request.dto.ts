import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRecordatorioRequestDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  horasAntes?: number;

  @ApiPropertyOptional({ example: 'Hola {{nombre}}, tu cita es el {{fecha}}...' })
  @IsOptional()
  @IsString()
  plantilla?: string;
}
