export class RoleEntity {
  id?: number;
  nombreRol!: string;
  estado = true;

  constructor(partial: Partial<RoleEntity> = {}) {
    Object.assign(this, partial);
  }
}
