import { Injectable } from '@nestjs/common';
import { WhatsappBroadcastSender } from '@messages/domain/services/whatsapp-broadcast-sender';
import { WhatsappBroadcastSenderType } from '@messages/domain/repositories/whatsapp-broadcast.repository';
import { CustomWhatsappMessageSender } from '@messages/infrastructure/whatsapp/custom-whatsapp-message.sender';

@Injectable()
export class WhatsappBroadcastSenderFactory {
  private readonly senders: Map<WhatsappBroadcastSenderType, WhatsappBroadcastSender>;

  constructor(customSender: CustomWhatsappMessageSender) {
    this.senders = new Map([[customSender.type, customSender]]);
  }

  get(type: WhatsappBroadcastSenderType): WhatsappBroadcastSender {
    const sender = this.senders.get(type);

    if (!sender) {
      throw new Error(`Whatsapp broadcast sender not registered: ${type}`);
    }

    return sender;
  }
}
