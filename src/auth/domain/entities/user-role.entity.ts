export class UserRoleEntity {
  id?: number;
  usuarioId!: number;
  rolId!: number;

  constructor(partial: Partial<UserRoleEntity> = {}) {
    Object.assign(this, partial);
  }
}
