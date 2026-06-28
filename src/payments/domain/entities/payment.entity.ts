import { PaymentMethodEntity } from './payment-method.entity';

export class PaymentEntity {
  id?: number;
  citaId!: number;
  usuarioCobradorId!: number;
  metodoPagoId!: number;
  montoPagado!: number;
  numeroOperacion?: string;
  observacion?: string;
  fechaPago?: Date;
  estado = true;
  metodoPago?: PaymentMethodEntity;

  constructor(partial: Partial<PaymentEntity> = {}) {
    Object.assign(this, partial);
  }
}
