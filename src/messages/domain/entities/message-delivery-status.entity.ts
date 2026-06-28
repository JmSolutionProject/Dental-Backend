export class MessageDeliveryStatusEntity {
  id?: number;
  nombreEstado!: string;

  constructor(partial: Partial<MessageDeliveryStatusEntity> = {}) {
    Object.assign(this, partial);
  }
}
