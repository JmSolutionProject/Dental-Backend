import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type AnyMessageContent,
  type WASocket,
} from 'baileys';
import { FilesService } from '@/files/infrastructure/files.service';

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
  private readonly enabled =
    process.env.WHATSAPP_ENABLED === 'true' && !process.env.VERCEL;
  private socket: WASocket | null = null;
  private reconnecting = false;
  private latestQr: string | null = null;
  private lastError: string | null = null;
  private status: WhatsappConnectionStatus = this.enabled
    ? 'initializing'
    : 'disabled';

  constructor(private readonly filesService: FilesService) {}

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(
        'WhatsApp client disabled. Set WHATSAPP_ENABLED=true outside serverless environments to enable it.',
      );
      return;
    }

    await this.startSocket();
  }

  private async startSocket(): Promise<void> {
    try {
      this.status = 'initializing';
      this.lastError = null;

      const sessionPath =
        process.env.WHATSAPP_BAILEYS_SESSION_PATH ?? '.baileys_auth';
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const { version } = await fetchLatestBaileysVersion();

      this.socket = makeWASocket({
        auth: state,
        version,
        browser: Browsers.ubuntu(process.env.WHATSAPP_CLIENT_ID ?? 'Dental Clinic'),
        markOnlineOnConnect: false,
        syncFullHistory: false,
      });

      this.socket.ev.on('creds.update', saveCreds);
      this.socket.ev.on('connection.update', (update) => {
        if (update.qr) {
          this.latestQr = update.qr;
          this.lastError = null;
          this.status = 'qr';
          this.logger.log('WhatsApp QR received. Scan it from the frontend.');
        }

        if (update.connection === 'open') {
          this.latestQr = null;
          this.lastError = null;
          this.status = 'ready';
          this.logger.log('WhatsApp client is ready.');
          return;
        }

        if (update.connection === 'close') {
          const statusCode = this.getDisconnectStatusCode(
            update.lastDisconnect?.error,
          );
          const reason = this.getErrorMessage(update.lastDisconnect?.error);

          this.latestQr = null;
          this.status =
            statusCode === DisconnectReason.loggedOut
              ? 'auth_failure'
              : 'disconnected';
          this.lastError = reason;
          this.logger.warn(`WhatsApp client disconnected: ${reason}`);

          if (statusCode !== DisconnectReason.loggedOut) {
            void this.scheduleReconnect();
          }
        }
      });
    } catch (error) {
      this.status = 'disconnected';
      this.lastError = this.getErrorMessage(error);
      this.logger.error(
        `Could not initialize WhatsApp client: ${this.lastError}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.socket) {
      await this.socket.end(undefined);
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

  async requestPairingCode(phone: string): Promise<{
    code: string;
    status: WhatsappConnectionStatus;
  }> {
    if (!this.enabled) {
      throw new Error('WhatsApp client is disabled.');
    }

    if (!this.socket) {
      await this.startSocket();
    }

    if (!this.socket) {
      throw new Error('WhatsApp client could not be initialized.');
    }

    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10) {
      throw new Error('WhatsApp phone number must include country code.');
    }

    const code = await this.socket.requestPairingCode(digits);
    this.latestQr = null;
    this.lastError = null;

    return { code, status: this.status };
  }

  async sendMessage(
    phone: string,
    content: string,
    options?: { mediaKey?: string; mediaName?: string; mediaMimeType?: string },
  ): Promise<{ messageId: string }> {
    if (!this.socket || this.status !== 'ready') {
      throw new Error('WhatsApp client is not ready.');
    }

    const chatId = this.toChatId(phone);
    const message = options?.mediaKey
      ? await this.socket.sendMessage(
          chatId,
          await this.buildMediaMessage(content, {
            mediaKey: options.mediaKey,
            mediaName: options.mediaName,
            mediaMimeType: options.mediaMimeType,
          }),
        )
      : await this.socket.sendMessage(chatId, { text: content });

    return { messageId: message?.key.id ?? '' };
  }

  private async buildMediaMessage(
    caption: string,
    options: { mediaKey: string; mediaName?: string; mediaMimeType?: string },
  ): Promise<AnyMessageContent> {
    const file = await this.filesService.getFileBuffer(options.mediaKey);
    const mimetype = options.mediaMimeType ?? file.contentType;
    const fileName = options.mediaName ?? file.filename;

    if (mimetype.startsWith('image/')) {
      return { image: file.buffer, caption, mimetype };
    }

    if (mimetype.startsWith('video/')) {
      return { video: file.buffer, caption, mimetype };
    }

    if (mimetype.startsWith('audio/')) {
      return { audio: file.buffer, mimetype };
    }

    return {
      document: file.buffer,
      caption,
      fileName,
      mimetype,
    };
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.reconnecting) {
      return;
    }

    this.reconnecting = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.startSocket();
    } finally {
      this.reconnecting = false;
    }
  }

  private getDisconnectStatusCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }

    const output = (error as { output?: { statusCode?: number } }).output;

    return output?.statusCode;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const message = (error as { message?: unknown }).message;

      if (typeof message === 'string') {
        return message;
      }
    }

    return 'Unknown WhatsApp connection error.';
  }

  private toChatId(phone: string): string {
    const normalizedPhone = phone.trim();

    if (normalizedPhone.endsWith('@s.whatsapp.net')) {
      return normalizedPhone;
    }

    if (normalizedPhone.endsWith('@c.us')) {
      return normalizedPhone.replace('@c.us', '@s.whatsapp.net');
    }

    const digits = normalizedPhone.replace(/\D/g, '');

    if (!digits) {
      throw new Error('WhatsApp phone number is empty.');
    }

    if (digits.length === 9) {
      return `51${digits}@s.whatsapp.net`;
    }

    return `${digits}@s.whatsapp.net`;
  }
}
