import { ApiProperty } from '@nestjs/swagger';
import { AuthRoleResponseDto } from './auth-role.response.dto';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Dr. Juan Perez' })
  nombreCompleto!: string;

  @ApiProperty({ example: 'doctor@clinic.com' })
  email!: string;

  @ApiProperty({ example: true })
  estado!: boolean;

  @ApiProperty({ example: '2026-06-28T23:00:00.000Z' })
  fechaRegistro!: string;

  @ApiProperty({ type: [AuthRoleResponseDto] })
  roles!: AuthRoleResponseDto[];
}
