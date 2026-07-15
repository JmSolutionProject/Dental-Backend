import { ApiProperty } from '@nestjs/swagger';

export class RolResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin' })
  nombreRol!: string;

  @ApiProperty({ example: true })
  estado!: boolean;
}
