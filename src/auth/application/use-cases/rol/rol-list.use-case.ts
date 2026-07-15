import { Inject, Injectable } from '@nestjs/common';
import { RolOutput } from '@auth/application/outputs/rol.output';
import {
  ROL_REPOSITORY,
  type RolRepository,
} from '@auth/domain/repositories/rol_auth.repository';

@Injectable()
export class RolListUseCase {
  constructor(
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepository,
  ) {}

  async execute(): Promise<RolOutput[]> {
    const roles = await this.rolRepository.getRoles();

    return roles.map((rol) => ({
      id: rol.id ?? 0,
      nombreRol: rol.nombreRol,
      estado: rol.estado,
    }));
  }
}
