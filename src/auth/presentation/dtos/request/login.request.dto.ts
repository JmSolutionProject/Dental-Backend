import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'doctor@clinic.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123*' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password!: string;
}
