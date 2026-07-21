import { PatientEntity } from '../entities/patient.entity';

export const PATIENT_REPOSITORY = Symbol('PATIENT_REPOSITORY');

export interface FindAllPatientsParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedPatientsResult {
  data: PatientEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePatientParams {
  nombres: string;
  apellidos: string;
  numeroDocumento?: string | null;
  fechaNacimiento?: string | null;
  telefonoWhatsapp?: string | null;
  alergiasCriticas?: string | null;
}

export interface UpdatePatientParams {
  nombres?: string;
  apellidos?: string;
  numeroDocumento?: string | null;
  fechaNacimiento?: string | null;
  telefonoWhatsapp?: string | null;
  alergiasCriticas?: string | null;
  estado?: boolean;
}

export interface PatientRepository {
  count(): Promise<number>;
  findAll(params: FindAllPatientsParams): Promise<PaginatedPatientsResult>;
  findById(id: number): Promise<PatientEntity | null>;
  create(patient: CreatePatientParams): Promise<PatientEntity>;
  update(id: number, patient: UpdatePatientParams): Promise<PatientEntity>;
  softDelete(id: number): Promise<PatientEntity>;
}
