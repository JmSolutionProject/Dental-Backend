export class ServicePriceEntity {
  id?: number;
  servicioId!: number;
  precio!: number;
  fechaInicio!: Date;
  fechaFin?: Date;
  estado = true;

  constructor(partial: Partial<ServicePriceEntity> = {}) {
    Object.assign(this, partial);
  }
}
