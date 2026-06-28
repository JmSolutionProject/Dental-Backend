export class AppointmentServiceEntity {
  id?: number;
  citaId!: number;
  servicioId!: number;
  cantidad = 1;
  descuento = 0;

  constructor(partial: Partial<AppointmentServiceEntity> = {}) {
    Object.assign(this, partial);
  }
}
