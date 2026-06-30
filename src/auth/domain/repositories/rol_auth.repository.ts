import { RoleEntity } from '@auth/domain/entities/role.entity';

export const ROL_REPOSITORY = Symbol('ROL_REPOSITORY');

export interface CreateRolParams {
  nombreRol: string;
  estado?: boolean;
}

export interface RolRepository {
  createRolUser(params: CreateRolParams): Promise<RoleEntity>;

  getRoles(): Promise<RoleEntity[]>;
}
