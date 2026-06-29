import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RoleEntity } from '@auth/domain/entities/role.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';
import {
  AuthRepository,
  RegisterUserParams,
} from '@auth/domain/repositories/auth.repository';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

type PrismaUserWithRoles = Prisma.UsuarioGetPayload<{
  include: {
    roles: {
      include: {
        rol: true;
      };
    };
  };
}>;

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    return user ? this.toDomainUser(user) : undefined;
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    return user ? this.toDomainUser(user) : undefined;
  }

  async findActiveRolesByNames(roleNames: string[]): Promise<RoleEntity[]> {
    if (roleNames.length === 0) {
      return [];
    }

    const roles = await this.prisma.role.findMany({
      where: {
        nombreRol: {
          in: roleNames,
        },
        estado: true,
      },
    });

    return roles.map(
      (role) =>
        new RoleEntity({
          id: role.id,
          nombreRol: role.nombreRol,
          estado: role.estado,
        }),
    );
  }

  async createUser(params: RegisterUserParams): Promise<UserEntity> {
    const user = await this.prisma.usuario.create({
      data: {
        nombreCompleto: params.nombreCompleto,
        email: params.email,
        passwordHash: params.passwordHash,
        roles: {
          create: params.roleNames.map((roleName) => ({
            rol: {
              connect: {
                nombreRol: roleName,
              },
            },
          })),
        },
      },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    return this.toDomainUser(user);
  }

  private toDomainUser(user: PrismaUserWithRoles): UserEntity {
    return new UserEntity({
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      passwordHash: user.passwordHash,
      estado: user.estado,
      fechaRegistro: user.fechaRegistro,
      roles: user.roles.map(
        (userRole) =>
          new RoleEntity({
            id: userRole.rol.id,
            nombreRol: userRole.rol.nombreRol,
            estado: userRole.rol.estado,
          }),
      ),
    });
  }
}
