import { AppointmentServiceEntity } from './appointment-service.entity';
import { AppointmentStatusEntity } from './appointment-status.entity';

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
  estado?: AppointmentStatusEntity;
  servicios: AppointmentServiceEntity[] = [];

  constructor(partial: Partial<AppointmentEntity> = {}) {
    Object.assign(this, partial);
    this.servicios = partial.servicios ?? [];
  }
}
