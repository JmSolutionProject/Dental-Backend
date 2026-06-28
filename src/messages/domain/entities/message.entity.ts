import { MessageDeliveryStatusEntity } from './message-delivery-status.entity';
import { MessageTemplateEntity } from './message-template.entity';

export class MessageEntity {
  id?: number;
  plantillaId!: number;
  pacienteId!: number;
  citaId?: number;
  estadoEnvioId!: number;
  fechaHoraProgramada!: Date;
  fechaHoraEnvio?: Date;
  errorDetalle?: string;
  plantilla?: MessageTemplateEntity;
  estadoEnvio?: MessageDeliveryStatusEntity;

  constructor(partial: Partial<MessageEntity> = {}) {
    Object.assign(this, partial);
  }
}
