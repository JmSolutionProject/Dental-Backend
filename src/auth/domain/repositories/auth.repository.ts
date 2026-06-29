import { RoleEntity } from '@auth/domain/entities/role.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface RegisterUserParams {
  nombreCompleto: string;
  email: string;
  passwordHash: string;
  roleNames: string[];
}

export interface AuthRepository {
  findByEmail(email: string): Promise<UserEntity | undefined>;
  findById(id: number): Promise<UserEntity | undefined>;
  findActiveRolesByNames(roleNames: string[]): Promise<RoleEntity[]>;
  createUser(params: RegisterUserParams): Promise<UserEntity>;
}
