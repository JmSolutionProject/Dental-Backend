export class ServiceCategoryEntity {
  id?: number;
  nombreCategoria!: string;
  estado = true;

  constructor(partial: Partial<ServiceCategoryEntity> = {}) {
    Object.assign(this, partial);
  }
}
