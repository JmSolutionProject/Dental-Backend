import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

class UserRoleDto {
  @ApiProperty() id: number;
  @ApiProperty() nombreRol: string;
}

export class UserResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() nombreCompleto: string;
  @ApiProperty() email: string;
  @ApiProperty() estado: boolean;
  @ApiProperty({ type: [UserRoleDto] }) roles: UserRoleDto[];
  @ApiProperty() fechaRegistro: string;
}
