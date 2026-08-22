export class PaymentEntity {
  id!: number;
  citaId!: number;
  usuarioCobradorId!: number;
  metodoPagoId!: number;
  montoPagado!: number;
  numeroOperacion?: string | null;
  observacion?: string | null;
  fechaPago!: Date;
  estado = true;
  metodoPagoName?: string;
  usuarioCobradorName?: string;
  patientId?: number;
  patientName?: string;
  patientPhone?: string;
  planServicioId?: number | null;

  constructor(partial: Partial<PaymentEntity> = {}) {
    Object.assign(this, partial);
  }
}
