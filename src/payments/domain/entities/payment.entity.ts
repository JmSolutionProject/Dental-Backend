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

  constructor(partial: Partial<PaymentEntity> = {}) {
    Object.assign(this, partial);
  }
}
