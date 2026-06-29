export interface Odontogram {
  id: number;
  pacienteId: number;
  citaId?: number;
  fechaRegistro: Date;
  observacionGeneral?: string;
}

export interface OdontogramDetail {
  id: number;
  odontogramaId: number;
  piezaDentalId: number;
  superficieId?: number;
  estadoPiezaId: number;
  diagnostico?: string;
  tratamientoRecomendado?: string;
  observacion?: string;
}

export interface RegisterOdontogramDetailCommand {
  pacienteId: number;
  citaId?: number;
  odontogramaId?: number;
  piezaDentalId: number;
  superficieId?: number;
  estadoPiezaId: number;
  diagnostico?: string;
  tratamientoRecomendado?: string;
  observacion?: string;
  observacionGeneral?: string;
}
