import { Injectable } from '@nestjs/common';
import {
  WhatsappBroadcastSendParams,
  WhatsappBroadcastSender,
} from '@messages/domain/services/whatsapp-broadcast-sender';
import { WhatsappService } from './whatsapp.service';

@Injectable()
export class CustomWhatsappMessageSender implements WhatsappBroadcastSender {
  readonly type = 'custom-message' as const;

  constructor(private readonly whatsappService: WhatsappService) {}

  send(params: WhatsappBroadcastSendParams): Promise<{ messageId: string }> {
    return this.whatsappService.sendMessage(params.phone, params.content, {
      mediaKey: params.mediaKey,
      mediaName: params.mediaName,
      mediaMimeType: params.mediaMimeType,
    });
  }
}
