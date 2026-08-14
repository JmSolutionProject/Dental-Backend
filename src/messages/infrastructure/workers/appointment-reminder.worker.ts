import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { ConfiguracionService } from '@/config/configuracion.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

const REMINDER_INTERVAL_MS = 15 * 60 * 1000; // cada 15 minutos
const MAX_MESSAGES_PER_RUN = 10;
const MIN_DELAY_MS = 40_000;
const MAX_DELAY_MS = 55_000;
const SEND_START_HOUR = 8;
const SEND_END_HOUR = 21;

const EXCLUDED_STATES = [
  'Cancelada',
  'cancelled',
  'No asistio',
  'Finalizada',
  'Atendida',
];

@Injectable()
export class AppointmentReminderWorker {
  private readonly logger = new Logger(AppointmentReminderWorker.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configuracionService: ConfiguracionService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Interval('APPOINTMENT_REMINDER', REMINDER_INTERVAL_MS)
  async processReminders(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    if (this.whatsappService.getStatus().status !== 'ready') {
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    if (hour < SEND_START_HOUR || hour >= SEND_END_HOUR) {
      return;
    }

    const config = await this.configuracionService.getRecordatorio();
    if (!config.enabled) {
      return;
    }

    this.isProcessing = true;

    try {
      const start = now;
      const end = new Date(now.getTime() + config.horasAntes * 3600_000);

      const citas = await this.prisma.cita.findMany({
        where: {
          recordatorioEnviado: false,
          fechaHoraInicio: { gt: start, lte: end },
          estadoCita: { nombreEstado: { notIn: EXCLUDED_STATES } },
          paciente: {
            telefonoWhatsapp: { not: null },
            aceptaRecordatorios: true,
          },
        },
        orderBy: { fechaHoraInicio: 'asc' },
        take: MAX_MESSAGES_PER_RUN,
        include: {
          paciente: true,
          medico: true,
        },
      });

      if (citas.length === 0) {
        return;
      }

      this.logger.log(`Enviando ${citas.length} recordatorio(s) de cita.`);

      for (const cita of citas) {
        try {
          const phone = cita.paciente.telefonoWhatsapp;
          if (!phone) {
            continue;
          }

          const content = this.renderTemplate(config.plantilla, cita);

          await this.whatsappService.sendMessage(phone, content);

          await this.prisma.cita.update({
            where: { id: cita.id },
            data: { recordatorioEnviado: true },
          });

          this.logger.log(
            `Recordatorio enviado a ${cita.paciente.nombres} (cita #${cita.id}).`,
          );
        } catch (error) {
          this.logger.warn(
            `No se pudo enviar recordatorio de la cita #${cita.id}: ${
              error instanceof Error ? error.message : 'error desconocido'
            }`,
          );
        }

        await this.sleep(
          MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS),
        );
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private renderTemplate(
    plantilla: string,
    cita: {
      paciente: { nombres: string; apellidos: string };
      medico: { nombreCompleto: string };
      fechaHoraInicio: Date;
    },
  ): string {
    const fecha = cita.fechaHoraInicio.toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const hora = cita.fechaHoraInicio.toLocaleTimeString('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
    });
    const nombre = `${cita.paciente.nombres} ${cita.paciente.apellidos}`.trim();
    const doctor = cita.medico.nombreCompleto;

    return plantilla
      .replaceAll('{{nombre}}', nombre)
      .replaceAll('{{fecha}}', fecha)
      .replaceAll('{{hora}}', hora)
      .replaceAll('{{doctor}}', doctor);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
