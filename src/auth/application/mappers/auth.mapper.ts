import { Injectable } from '@nestjs/common';
import { AuthRoleOutput } from '@auth/application/outputs/auth-role.output';
import { AuthTokenOutput } from '@auth/application/outputs/auth-token.output';
import { AuthUserOutput } from '@auth/application/outputs/auth-user.output';
import { RoleEntity } from '@auth/domain/entities/role.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { AuthenticatedUser } from '@auth/domain/types/authenticated-user.type';
import { JwtPayload } from '@auth/domain/types/jwt-payload.type';

@Injectable()
export class AuthMapper {
  toRoleOutput(role: RoleEntity): AuthRoleOutput {
    return {
      id: role.id ?? 0,
      nombreRol: role.nombreRol,
    };
  }

  toUserOutput(user: UserEntity): AuthUserOutput {
    return {
      id: user.id ?? 0,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      estado: user.estado,
      fechaRegistro:
        user.fechaRegistro?.toISOString() ?? new Date().toISOString(),
      roles: user.roles.map((role) => this.toRoleOutput(role)),
    };
  }

  toAuthOutput(user: UserEntity, accessToken: string): AuthTokenOutput {
    return {
      accessToken,
      tokenType: 'Bearer',
      user: this.toUserOutput(user),
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
