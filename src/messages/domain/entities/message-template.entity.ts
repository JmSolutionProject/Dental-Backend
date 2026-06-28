export class MessageTemplateEntity {
  id?: number;
  nombrePlantilla!: string;
  tipoMensaje!: string;
  contenido!: string;
  estado = true;

  constructor(partial: Partial<MessageTemplateEntity> = {}) {
    Object.assign(this, partial);
  }
}
