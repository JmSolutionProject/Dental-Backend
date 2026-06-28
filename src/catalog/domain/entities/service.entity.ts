import { ServiceCategoryEntity } from './service-category.entity';
import { ServicePriceEntity } from './service-price.entity';

export class ServiceEntity {
  id?: number;
  categoriaId!: number;
  nombreServicio!: string;
  descripcion?: string;
  estado = true;
  categoria?: ServiceCategoryEntity;
  precios: ServicePriceEntity[] = [];

  constructor(partial: Partial<ServiceEntity> = {}) {
    Object.assign(this, partial);
    this.precios = partial.precios ?? [];
  }
}
