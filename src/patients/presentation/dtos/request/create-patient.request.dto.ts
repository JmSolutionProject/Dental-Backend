import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePatientRequestDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MaxLength(100)
  nombres!: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @MaxLength(100)
  apellidos!: string;

  @ApiPropertyOptional({ example: '76543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroDocumento?: string;

  @ApiPropertyOptional({ example: '1990-05-10' })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({ example: '+51999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefonoWhatsapp?: string;

  @ApiPropertyOptional({ example: 'Alergia a penicilina' })
  @IsOptional()
  @IsString()
  alergiasCriticas?: string;
}
