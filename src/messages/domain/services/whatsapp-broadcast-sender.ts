import { WhatsappBroadcastSenderType } from '../repositories/whatsapp-broadcast.repository';

export type WhatsappBroadcastSendParams = {
  phone: string;
  content: string;
  mediaKey?: string;
  mediaName?: string;
  mediaMimeType?: string;
};

export interface WhatsappBroadcastSender {
  readonly type: WhatsappBroadcastSenderType;
  send(params: WhatsappBroadcastSendParams): Promise<{ messageId: string }>;
}
