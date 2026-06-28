export class AppointmentStatusEntity {
  id?: number;
  nombreEstado!: string;

  constructor(partial: Partial<AppointmentStatusEntity> = {}) {
    Object.assign(this, partial);
  }
}
