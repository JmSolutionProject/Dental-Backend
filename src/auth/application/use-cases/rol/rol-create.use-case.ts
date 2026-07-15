import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateRolCommand } from '@auth/application/commands/create-rol.command';
import { RolOutput } from '@auth/application/outputs/rol.output';
import {
  ROL_REPOSITORY,
  type RolRepository,
} from '@auth/domain/repositories/rol_auth.repository';

@Injectable()
export class RolCreateUseCase {
  constructor(
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepository,
  ) {}

  async execute(payload: CreateRolCommand): Promise<RolOutput> {
    try {
      const rol = await this.rolRepository.createRolUser({
        nombreRol: payload.nombreRol.trim(),
        estado: payload.estado,
      });

      return {
        id: rol.id ?? 0,
        nombreRol: rol.nombreRol,
        estado: rol.estado,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El rol ya existe.');
      }

      throw error;
    }
  }
}
