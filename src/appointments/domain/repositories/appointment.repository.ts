import { AppointmentEntity } from '../entities/appointment.entity';

export const APPOINTMENT_REPOSITORY = Symbol('APPOINTMENT_REPOSITORY');

export interface FindAllAppointmentsParams {
  page: number;
  limit: number;
}

export interface PaginatedAppointmentsResult {
  data: AppointmentEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAppointmentService {
  servicioId: number;
  cantidad: number;
  descuento?: number;
}

export interface CreateAppointmentParams {
  pacienteId: number;
  medicoId: number;
  estadoCitaId: number;
  planServicioId?: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  motivoPrincipal?: string;
  observaciones?: string;
  servicios?: CreateAppointmentService[];
}

export interface UpdateAppointmentParams {
  pacienteId?: number;
  medicoId?: number;
  estadoCitaId?: number;
  planServicioId?: number;
  fechaHoraInicio?: string;
  fechaHoraFin?: string;
  motivoPrincipal?: string;
  observaciones?: string;
}

export interface CheckAvailabilityParams {
  medicoId: number;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
}

export interface AvailabilityResult {
  available: boolean;
  conflicts: AppointmentEntity[];
}

export interface AppointmentRepository {
  count(): Promise<number>;
  findAll(
    params: FindAllAppointmentsParams,
  ): Promise<PaginatedAppointmentsResult>;
  findById(id: number): Promise<AppointmentEntity | null>;
  create(appointment: CreateAppointmentParams): Promise<AppointmentEntity>;
  update(
    id: number,
    appointment: UpdateAppointmentParams,
  ): Promise<AppointmentEntity>;
  cancel(id: number): Promise<AppointmentEntity>;
  checkAvailability(
    params: CheckAvailabilityParams,
  ): Promise<AvailabilityResult>;
  findStatusByName(
    name: string,
  ): Promise<{ id: number; nombreEstado: string } | null>;
  createStatus(name: string): Promise<{ id: number; nombreEstado: string }>;
  findAllStatuses(): Promise<Array<{ id: number; nombreEstado: string }>>;
}
