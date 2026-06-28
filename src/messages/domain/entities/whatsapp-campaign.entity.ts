export class WhatsAppCampaignEntity {
  id?: number;
  nombreCampana!: string;
  descripcion?: string;
  usuarioCreadorId!: number;
  fechaCreacion?: Date;
  estado = true;

  constructor(partial: Partial<WhatsAppCampaignEntity> = {}) {
    Object.assign(this, partial);
  }
}
