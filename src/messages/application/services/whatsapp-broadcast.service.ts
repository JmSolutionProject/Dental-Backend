import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WHATSAPP_BROADCAST_REPOSITORY,
  WhatsappBroadcastSenderType,
} from '@messages/domain/repositories/whatsapp-broadcast.repository';
import type { WhatsappBroadcastRepository } from '@messages/domain/repositories/whatsapp-broadcast.repository';

export type CreateWhatsappBroadcastCampaignCommand = {
  nombreCampana: string;
  descripcion?: string;
  usuarioCreadorId: number;
  pacienteIds: number[];
  contenido: string;
  mediaKey?: string;
  mediaName?: string;
  mediaMimeType?: string;
  tipoEnvio?: WhatsappBroadcastSenderType;
  maxIntentos?: number;
};

@Injectable()
export class WhatsappBroadcastService {
  constructor(
    @Inject(WHATSAPP_BROADCAST_REPOSITORY)
    private readonly repository: WhatsappBroadcastRepository,
  ) {}

  async createCampaign(
    command: CreateWhatsappBroadcastCampaignCommand,
  ): Promise<unknown> {
    try {
      const campaign = await this.repository.createCampaign({
        nombreCampana: command.nombreCampana,
        descripcion: command.descripcion,
        usuarioCreadorId: command.usuarioCreadorId,
        pacienteIds: command.pacienteIds,
        contenido: command.contenido,
        mediaKey: command.mediaKey,
        mediaName: command.mediaName,
        mediaMimeType: command.mediaMimeType,
        tipoEnvio: command.tipoEnvio ?? 'custom-message',
        maxIntentos: command.maxIntentos ?? 3,
      });

      return this.getCampaignStatus(campaign.id);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'No se pudo crear la campana.',
      );
    }
  }

  async startCampaign(id: number): Promise<unknown> {
    await this.repository.startCampaign(id);
    return this.getCampaignStatus(id);
  }

  async pauseCampaign(id: number): Promise<unknown> {
    await this.repository.pauseCampaign(id);
    return this.getCampaignStatus(id);
  }

  async cancelCampaign(id: number): Promise<unknown> {
    await this.repository.cancelCampaign(id);
    return this.getCampaignStatus(id);
  }

  async getCampaignStatus(id: number): Promise<unknown> {
    const campaign = await this.repository.findCampaignStatus(id);

    if (!campaign) {
      throw new NotFoundException('Campana de WhatsApp no encontrada.');
    }

    return campaign;
  }
}
