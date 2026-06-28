export class CampaignPatientEntity {
  id?: number;
  campanaId!: number;
  pacienteId!: number;
  estadoEnvioId!: number;
  fechaEnvio?: Date;

  constructor(partial: Partial<CampaignPatientEntity> = {}) {
    Object.assign(this, partial);
  }
}
