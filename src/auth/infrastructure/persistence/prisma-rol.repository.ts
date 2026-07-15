import { Injectable } from '@nestjs/common';
import { RoleEntity } from '@auth/domain/entities/role.entity';
import {
  CreateRolParams,
  RolRepository,
} from '@auth/domain/repositories/rol_auth.repository';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PrismaRol implements RolRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRolUser(params: CreateRolParams): Promise<RoleEntity> {
    const role = await this.prisma.role.create({
      data: {
        nombreRol: params.nombreRol,
        estado: params.estado ?? true,
      },
    });

    return new RoleEntity({
      id: role.id,
      nombreRol: role.nombreRol,
      estado: role.estado,
    });
  }
  getRoles(): Promise<RoleEntity[]> {
    return this.prisma.role.findMany().then((roles) =>
      roles.map(
        (role) =>
          new RoleEntity({
            id: role.id,
            nombreRol: role.nombreRol,
            estado: role.estado,
          }),
      ),
    );
  }
}
