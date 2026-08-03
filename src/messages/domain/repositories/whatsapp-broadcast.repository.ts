export const WHATSAPP_BROADCAST_REPOSITORY = Symbol(
  'WHATSAPP_BROADCAST_REPOSITORY',
);

export type WhatsappBroadcastProcessStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'cancelled'
  | 'completed';

export type WhatsappBroadcastSenderType = 'custom-message';

export type CreateWhatsappBroadcastCampaignParams = {
  nombreCampana: string;
  descripcion?: string;
  usuarioCreadorId: number;
  pacienteIds: number[];
  contenido: string;
  mediaKey?: string;
  mediaName?: string;
  mediaMimeType?: string;
  tipoEnvio: WhatsappBroadcastSenderType;
  maxIntentos: number;
};

export type WhatsappBroadcastQueueItem = {
  id: number;
  campanaId: number;
  telefonoWhatsapp: string;
  contenido: string;
  mediaKey?: string;
  mediaName?: string;
  mediaMimeType?: string;
  intentos: number;
  maxIntentos: number;
  tipoEnvio: WhatsappBroadcastSenderType;
};

export interface WhatsappBroadcastRepository {
  createCampaign(
    params: CreateWhatsappBroadcastCampaignParams,
  ): Promise<{ id: number }>;
  startCampaign(id: number): Promise<void>;
  pauseCampaign(id: number): Promise<void>;
  cancelCampaign(id: number): Promise<void>;
  findCampaignStatus(id: number): Promise<unknown>;
  claimNextQueueItem(): Promise<WhatsappBroadcastQueueItem | null>;
  markQueueItemAsSent(id: number, whatsappMessageId: string): Promise<void>;
  markQueueItemAsFailed(id: number, error: string): Promise<void>;
  markQueueItemForRetry(id: number, error: string): Promise<void>;
  completeFinishedCampaigns(): Promise<void>;
}
