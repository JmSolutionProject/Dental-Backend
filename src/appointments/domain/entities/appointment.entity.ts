export class AppointmentEntity {
  id?: number;
  pacienteId!: number;
  medicoId!: number;
  estadoCitaId!: number;
  fechaHoraInicio!: Date;
  fechaHoraFin!: Date;
  motivoPrincipal?: string;
  observaciones?: string;
  fechaRegistro?: Date;
  pacienteName?: string;
  medicoName?: string;
  estadoNombre?: string;

  constructor(partial: Partial<AppointmentEntity> = {}) {
    Object.assign(this, partial);
  }
}
