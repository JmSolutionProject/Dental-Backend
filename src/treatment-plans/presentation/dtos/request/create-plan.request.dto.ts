import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

class PlanServiceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  servicioId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  descuento: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  odontogramaDetalleId?: number;
}

export class CreatePlanRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pacienteId: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  medicoId: number;

  @ApiProperty({ type: [PlanServiceDto] })
  @IsArray()
  servicios: PlanServiceDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
