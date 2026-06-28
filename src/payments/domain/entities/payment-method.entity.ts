export class PaymentMethodEntity {
  id?: number;
  nombreMetodo!: string;
  estado = true;

  constructor(partial: Partial<PaymentMethodEntity> = {}) {
    Object.assign(this, partial);
  }
}
