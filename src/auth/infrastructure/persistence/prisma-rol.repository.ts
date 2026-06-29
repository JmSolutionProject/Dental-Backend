import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RoleEntity } from '@auth/domain/entities/role.entity';
import { RolRepository } from '@auth/domain/repositories/rol_auth.repository';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PrismaRol implements RolRepository {
  createRolUser(params: Promise<RoleEntity | undefined>) {
    throw new Error('Method not implemented.');
  }
}
