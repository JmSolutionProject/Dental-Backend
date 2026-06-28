import { RoleEntity } from './role.entity';

export class UserEntity {
  id?: number;
  nombreCompleto!: string;
  email!: string;
  passwordHash!: string;
  estado = true;
  fechaRegistro?: Date;
  roles: RoleEntity[] = [];

  constructor(partial: Partial<UserEntity> = {}) {
    Object.assign(this, partial);
    this.roles = partial.roles ?? [];
  }
}
