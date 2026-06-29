import { Injectable } from '@nestjs/common';
import { RoleEntity } from '@auth/domain/entities/role.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { AuthenticatedUser } from '@auth/domain/types/authenticated-user.type';
import { JwtPayload } from '@auth/domain/types/jwt-payload.type';
import { AuthRoleResponseDto } from '@auth/presentation/dtos/response/auth-role.response.dto';
import { AuthTokenResponseDto } from '@auth/presentation/dtos/response/auth-token.response.dto';
import { AuthUserResponseDto } from '@auth/presentation/dtos/response/auth-user.response.dto';

@Injectable()
export class AuthMapper {
  toRoleResponse(role: RoleEntity): AuthRoleResponseDto {
    return {
      id: role.id ?? 0,
      nombreRol: role.nombreRol,
    };
  }

  toUserResponse(user: UserEntity): AuthUserResponseDto {
    return {
      id: user.id ?? 0,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      estado: user.estado,
      fechaRegistro:
        user.fechaRegistro?.toISOString() ?? new Date().toISOString(),
      roles: user.roles.map((role) => this.toRoleResponse(role)),
    };
  }

  toAuthResponse(user: UserEntity, accessToken: string): AuthTokenResponseDto {
    return {
      accessToken,
      tokenType: 'Bearer',
      user: this.toUserResponse(user),
    };
  }

  toAuthenticatedUser(user: UserEntity): AuthenticatedUser {
    return {
      id: user.id ?? 0,
      email: user.email,
      nombreCompleto: user.nombreCompleto,
      roles: user.roles.map((role) => role.nombreRol),
    };
  }

  toJwtPayload(user: UserEntity): JwtPayload {
    const authenticatedUser = this.toAuthenticatedUser(user);

    return {
      sub: authenticatedUser.id,
      ...authenticatedUser,
    };
  }

  toRoleEntities(roleNames: string[]): RoleEntity[] {
    return roleNames.map((nombreRol) => new RoleEntity({ nombreRol }));
  }
}
