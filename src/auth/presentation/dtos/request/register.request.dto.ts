import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'Dr. Juan Perez' })
  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @ApiProperty({ example: 'doctor@clinic.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123*', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    example: ['admin', 'medico'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  roles?: string[];
}
