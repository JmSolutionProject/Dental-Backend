import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  WHATSAPP_BROADCAST_REPOSITORY,
} from '@messages/domain/repositories/whatsapp-broadcast.repository';
import type { WhatsappBroadcastRepository } from '@messages/domain/repositories/whatsapp-broadcast.repository';
import { WhatsappBroadcastSenderFactory } from '@messages/application/services/whatsapp-broadcast-sender.factory';
import { WhatsappService } from '@messages/infrastructure/whatsapp/whatsapp.service';

@Injectable()
export class WhatsappBroadcastWorker {
  private readonly logger = new Logger(WhatsappBroadcastWorker.name);
  private isProcessing = false;

  constructor(
    @Inject(WHATSAPP_BROADCAST_REPOSITORY)
    private readonly repository: WhatsappBroadcastRepository,
    private readonly senderFactory: WhatsappBroadcastSenderFactory,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Interval('WHATSAPP_BROADCAST_QUEUE', 30000)
  async processNext(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    const whatsappStatus = this.whatsappService.getStatus();
    if (whatsappStatus.status !== 'ready') {
      return;
    }

    this.isProcessing = true;

    try {
      const item = await this.repository.claimNextQueueItem();

      if (!item) {
        await this.repository.completeFinishedCampaigns();
        return;
      }

      try {
        const sender = this.senderFactory.get(item.tipoEnvio);
        const result = await sender.send({
          phone: item.telefonoWhatsapp,
          content: item.contenido,
          mediaKey: item.mediaKey,
          mediaName: item.mediaName,
          mediaMimeType: item.mediaMimeType,
        });

        await this.repository.markQueueItemAsSent(item.id, result.messageId);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo enviar el mensaje de WhatsApp.';

        if (item.intentos >= item.maxIntentos) {
          await this.repository.markQueueItemAsFailed(item.id, message);
        } else {
          await this.repository.markQueueItemForRetry(item.id, message);
        }

        this.logger.warn(
          `WhatsApp broadcast item ${item.id} failed: ${message}`,
        );
      }

      await this.repository.completeFinishedCampaigns();
    } finally {
      this.isProcessing = false;
    }
  }
}
