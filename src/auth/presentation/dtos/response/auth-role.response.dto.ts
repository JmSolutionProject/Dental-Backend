import { ApiProperty } from '@nestjs/swagger';

export class AuthRoleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin' })
  nombreRol!: string;
}
