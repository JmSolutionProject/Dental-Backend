export interface PlanServiceItem {
  servicioId: number;
  cantidad: number;
  descuento: number;
  odontogramaDetalleId?: number;
}

export interface CreatePlanCommand {
  pacienteId: number;
  medicoId: number;
  servicios: PlanServiceItem[];
  observaciones?: string;
}

export interface UpdatePlanCommand {
  estado?: string;
  observaciones?: string;
}

export interface PlanWithServices {
  id: number;
  pacienteId: number;
  medicoId: number;
  estado: string;
  fechaCreacion: string;
  observaciones: string | null;
  paciente: { nombres: string; apellidos: string };
  medico: { nombreCompleto: string };
  servicios: Array<{
    id: number;
    cantidad: number;
    descuento: number;
    ejecutado: boolean;
    odontogramaDetalleId: number | null;
    servicio: { id: number; nombreServicio: string; precioActual: number };
  }>;
}
