import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

type WhatsappConnectionStatus =
  | 'disabled'
  | 'initializing'
  | 'qr'
  | 'ready'
  | 'disconnected'
  | 'auth_failure';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly enabled = process.env.WHATSAPP_ENABLED !== 'false';
  private client: Client | null = null;
  private latestQr: string | null = null;
  private lastError: string | null = null;
  private status: WhatsappConnectionStatus = this.enabled
    ? 'initializing'
    : 'disabled';

  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.warn(
        'WhatsApp client disabled. Set WHATSAPP_ENABLED=true to enable it.',
      );
      return;
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: process.env.WHATSAPP_CLIENT_ID ?? 'dental-clinic',
        dataPath: process.env.WHATSAPP_SESSION_PATH ?? '.wwebjs_auth',
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.WHATSAPP_CHROME_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.client.on('qr', (qr: string) => {
      this.latestQr = qr;
      this.lastError = null;
      this.status = 'qr';
      this.logger.log('Scan the WhatsApp QR code printed below.');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      this.latestQr = null;
      this.lastError = null;
      this.status = 'ready';
      this.logger.log('WhatsApp client is ready.');
    });

    this.client.on('auth_failure', (message: string) => {
      this.status = 'auth_failure';
      this.lastError = message;
      this.logger.error(`WhatsApp authentication failed: ${message}`);
    });

    this.client.on('disconnected', (reason: string) => {
      this.status = 'disconnected';
      this.lastError = reason;
      this.logger.warn(`WhatsApp client disconnected: ${reason}`);
    });

    void this.client.initialize().catch((error: Error) => {
      this.status = 'disconnected';
      this.lastError = error.message;
      this.logger.error(
        `Could not initialize WhatsApp client: ${error.message}`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
    }
  }

  getStatus(): {
    status: WhatsappConnectionStatus;
    hasQr: boolean;
    error: string | null;
  } {
    return {
      status: this.status,
      hasQr: Boolean(this.latestQr),
      error: this.lastError,
    };
  }

  getLatestQr(): {
    qr: string | null;
    status: WhatsappConnectionStatus;
    error: string | null;
  } {
    return { qr: this.latestQr, status: this.status, error: this.lastError };
  }

  async sendMessage(
    phone: string,
    content: string,
  ): Promise<{ messageId: string }> {
    if (!this.client || this.status !== 'ready') {
      throw new Error('WhatsApp client is not ready.');
    }

    const chatId = this.toChatId(phone);
    const message = await this.client.sendMessage(chatId, content);

    return { messageId: message.id._serialized };
  }

  private toChatId(phone: string): string {
    const normalizedPhone = phone.trim();

    if (normalizedPhone.endsWith('@c.us')) {
      return normalizedPhone;
    }

    const digits = normalizedPhone.replace(/\D/g, '');

    if (!digits) {
      throw new Error('WhatsApp phone number is empty.');
    }

    return `${digits}@c.us`;
  }
}
