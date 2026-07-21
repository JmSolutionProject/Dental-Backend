import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsNotEmpty()
  @IsString()
  nombreCompleto: string;

  @ApiProperty({ example: 'juan@clinica.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: [2], description: 'IDs de roles a asignar' })
  @IsArray()
  roleIds: number[];

  @ApiProperty({
    example: 35.0,
    description: 'Porcentaje de comisión por tratamiento',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  porcentajeComision?: number;
}
