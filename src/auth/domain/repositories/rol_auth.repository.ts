import { RoleEntity } from '@auth/domain/entities/role.entity';

export interface RolRepository {
  createRolUser(params: Promise<RoleEntity | undefined>);
}
