import { Injectable } from '@nestjs/common';
import { LoginCommand } from '@auth/application/commands/login.command';
import { RegisterCommand } from '@auth/application/commands/register.command';
import { AuthTokenOutput } from '@auth/application/outputs/auth-token.output';
import { AuthUserOutput } from '@auth/application/outputs/auth-user.output';
import { LoginRequestDto } from '@auth/presentation/dtos/request/login.request.dto';
import { RegisterRequestDto } from '@auth/presentation/dtos/request/register.request.dto';
import { AuthTokenResponseDto } from '@auth/presentation/dtos/response/auth-token.response.dto';
import { AuthUserResponseDto } from '@auth/presentation/dtos/response/auth-user.response.dto';

@Injectable()
export class AuthPresentationMapper {
  toLoginCommand(payload: LoginRequestDto): LoginCommand {
    return {
      email: payload.email,
      password: payload.password,
    };
  }

  toRegisterCommand(payload: RegisterRequestDto): RegisterCommand {
    return {
      nombreCompleto: payload.nombreCompleto,
      email: payload.email,
      password: payload.password,
      roles: payload.roles,
    };
  }

  toAuthTokenResponse(output: AuthTokenOutput): AuthTokenResponseDto {
    return {
      accessToken: output.accessToken,
      tokenType: output.tokenType,
      user: this.toAuthUserResponse(output.user),
    };
  }

  toAuthUserResponse(output: AuthUserOutput): AuthUserResponseDto {
    return {
      id: output.id,
      nombreCompleto: output.nombreCompleto,
      email: output.email,
      estado: output.estado,
      fechaRegistro: output.fechaRegistro,
      roles: output.roles.map((role) => ({
        id: role.id,
        nombreRol: role.nombreRol,
      })),
    };
  }
}
