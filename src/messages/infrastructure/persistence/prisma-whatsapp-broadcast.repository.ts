import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import {
  CreateWhatsappBroadcastCampaignParams,
  WhatsappBroadcastQueueItem,
  WhatsappBroadcastRepository,
} from '@messages/domain/repositories/whatsapp-broadcast.repository';

const DELIVERY_STATUS = {
  pending: 'Pendiente',
  sending: 'Enviando',
  sent: 'Enviado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
} as const;

@Injectable()
export class PrismaWhatsappBroadcastRepository
  implements WhatsappBroadcastRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createCampaign(
    params: CreateWhatsappBroadcastCampaignParams,
  ): Promise<{ id: number }> {
    const patientIds = [...new Set(params.pacienteIds)];
    const pendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.pending,
    );

    const patients = await this.prisma.paciente.findMany({
      where: { id: { in: patientIds }, estado: true },
      select: {
        id: true,
        telefonoWhatsapp: true,
        nombres: true,
        apellidos: true,
        numeroDocumento: true,
      },
    });

    const foundIds = new Set(patients.map((patient) => patient.id));
    const missingIds = patientIds.filter((id) => !foundIds.has(id));
    const patientsWithoutPhone = patients
      .filter((patient) => !patient.telefonoWhatsapp)
      .map((patient) => patient.id);

    if (missingIds.length > 0) {
      throw new Error(`Pacientes no encontrados: ${missingIds.join(', ')}`);
    }

    if (patientsWithoutPhone.length > 0) {
      throw new Error(
        `Pacientes sin telefono de WhatsApp: ${patientsWithoutPhone.join(', ')}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const campaign = await tx.campanaWhatsapp.create({
        data: {
          nombreCampana: params.nombreCampana,
          descripcion: params.descripcion,
          usuarioCreadorId: params.usuarioCreadorId,
          estadoProceso: 'pending',
          tipoEnvio: params.tipoEnvio,
        },
        select: { id: true },
      });

      await tx.campanaPaciente.createMany({
        data: patients.map((patient) => ({
          campanaId: campaign.id,
          pacienteId: patient.id,
          estadoEnvioId: pendingStatusId,
          telefonoWhatsapp: patient.telefonoWhatsapp,
          contenido: this.renderContent(params.contenido, patient),
          mediaKey: params.mediaKey,
          mediaName: params.mediaName,
          mediaMimeType: params.mediaMimeType,
          maxIntentos: params.maxIntentos,
        })),
      });

      return campaign;
    });
  }

  async startCampaign(id: number): Promise<void> {
    await this.prisma.campanaWhatsapp.update({
      where: { id },
      data: {
        estadoProceso: 'running',
        fechaInicio: new Date(),
        fechaPausa: null,
      },
    });
  }

  async pauseCampaign(id: number): Promise<void> {
    await this.prisma.campanaWhatsapp.update({
      where: { id },
      data: { estadoProceso: 'paused', fechaPausa: new Date() },
    });
  }

  async cancelCampaign(id: number): Promise<void> {
    const cancelledStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.cancelled,
    );
    const pendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.pending,
    );
    const sendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.sending,
    );

    await this.prisma.$transaction([
      this.prisma.campanaWhatsapp.update({
        where: { id },
        data: {
          estadoProceso: 'cancelled',
          fechaCancelacion: new Date(),
        },
      }),
      this.prisma.campanaPaciente.updateMany({
        where: {
          campanaId: id,
          estadoEnvioId: { in: [pendingStatusId, sendingStatusId] },
        },
        data: {
          estadoEnvioId: cancelledStatusId,
          lockedAt: null,
        },
      }),
    ]);
  }

  async findCampaignStatus(id: number): Promise<unknown> {
    const campaign = await this.prisma.campanaWhatsapp.findUnique({
      where: { id },
      include: {
        pacientes: {
          include: {
            paciente: { select: { nombres: true, apellidos: true } },
            estadoEnvio: { select: { nombreEstado: true } },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!campaign) {
      return null;
    }

    const totals = campaign.pacientes.reduce<Record<string, number>>(
      (accumulator, item) => {
        const status = item.estadoEnvio.nombreEstado;
        accumulator[status] = (accumulator[status] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    return {
      id: String(campaign.id),
      name: campaign.nombreCampana,
      description: campaign.descripcion,
      processStatus: campaign.estadoProceso,
      senderType: campaign.tipoEnvio,
      createdAt: campaign.fechaCreacion.toISOString(),
      startedAt: campaign.fechaInicio?.toISOString() ?? null,
      pausedAt: campaign.fechaPausa?.toISOString() ?? null,
      cancelledAt: campaign.fechaCancelacion?.toISOString() ?? null,
      completedAt: campaign.fechaFinalizacion?.toISOString() ?? null,
      totals,
      recipients: campaign.pacientes.map((item) => ({
        id: String(item.id),
        patientId: String(item.pacienteId),
        patientName: `${item.paciente.nombres} ${item.paciente.apellidos}`,
        phone: item.telefonoWhatsapp,
        status: item.estadoEnvio.nombreEstado,
        attempts: item.intentos,
        maxAttempts: item.maxIntentos,
        sentAt: item.fechaEnvio?.toISOString() ?? null,
        error: item.errorDetalle,
        whatsappMessageId: item.whatsappMessageId,
        mediaKey: item.mediaKey,
        mediaName: item.mediaName,
        mediaMimeType: item.mediaMimeType,
      })),
    };
  }

  async claimNextQueueItem(): Promise<WhatsappBroadcastQueueItem | null> {
    const pendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.pending,
    );
    const sendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.sending,
    );
    const staleLockBefore = new Date(Date.now() - 5 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const candidates = await tx.campanaPaciente.findMany({
        where: {
          telefonoWhatsapp: { not: null },
          contenido: { not: null },
          campana: { estadoProceso: 'running', estado: true },
          OR: [
            { estadoEnvioId: pendingStatusId },
            {
              estadoEnvioId: sendingStatusId,
              lockedAt: { lt: staleLockBefore },
            },
          ],
        },
        include: { campana: { select: { tipoEnvio: true } } },
        orderBy: [{ campanaId: 'asc' }, { id: 'asc' }],
        take: 20,
      });

      const item = candidates.find(
        (candidate) => candidate.intentos < candidate.maxIntentos,
      );

      if (!item || !item.telefonoWhatsapp || !item.contenido) {
        return null;
      }

      await tx.campanaPaciente.update({
        where: { id: item.id },
        data: {
          estadoEnvioId: sendingStatusId,
          lockedAt: new Date(),
          intentos: { increment: 1 },
          errorDetalle: null,
        },
      });

      return {
        id: item.id,
        campanaId: item.campanaId,
        telefonoWhatsapp: item.telefonoWhatsapp,
        contenido: item.contenido,
        mediaKey: item.mediaKey ?? undefined,
        mediaName: item.mediaName ?? undefined,
        mediaMimeType: item.mediaMimeType ?? undefined,
        intentos: item.intentos + 1,
        maxIntentos: item.maxIntentos,
        tipoEnvio: item.campana.tipoEnvio as WhatsappBroadcastQueueItem['tipoEnvio'],
      };
    });
  }

  async markQueueItemAsSent(
    id: number,
    whatsappMessageId: string,
  ): Promise<void> {
    const sentStatusId = await this.ensureDeliveryStatus(DELIVERY_STATUS.sent);

    await this.prisma.campanaPaciente.update({
      where: { id },
      data: {
        estadoEnvioId: sentStatusId,
        fechaEnvio: new Date(),
        lockedAt: null,
        errorDetalle: null,
        whatsappMessageId,
      },
    });
  }

  async markQueueItemAsFailed(id: number, error: string): Promise<void> {
    const failedStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.failed,
    );

    await this.prisma.campanaPaciente.update({
      where: { id },
      data: {
        estadoEnvioId: failedStatusId,
        lockedAt: null,
        errorDetalle: error,
      },
    });
  }

  async markQueueItemForRetry(id: number, error: string): Promise<void> {
    const pendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.pending,
    );

    await this.prisma.campanaPaciente.update({
      where: { id },
      data: {
        estadoEnvioId: pendingStatusId,
        lockedAt: null,
        errorDetalle: error,
      },
    });
  }

  async completeFinishedCampaigns(): Promise<void> {
    const pendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.pending,
    );
    const sendingStatusId = await this.ensureDeliveryStatus(
      DELIVERY_STATUS.sending,
    );

    await this.prisma.campanaWhatsapp.updateMany({
      where: {
        estadoProceso: 'running',
        pacientes: {
          none: { estadoEnvioId: { in: [pendingStatusId, sendingStatusId] } },
        },
      },
      data: {
        estadoProceso: 'completed',
        fechaFinalizacion: new Date(),
      },
    });
  }

  private async ensureDeliveryStatus(nombreEstado: string): Promise<number> {
    const status = await this.prisma.estadoEnvioMensaje.upsert({
      where: { nombreEstado },
      update: {},
      create: { nombreEstado },
      select: { id: true },
    });

    return status.id;
  }

  private renderContent(
    content: string,
    patient: {
      nombres: string;
      apellidos: string;
      telefonoWhatsapp: string | null;
      numeroDocumento: string | null;
    },
  ): string {
    const values: Record<string, string> = {
      nombre: patient.nombres?.trim() ?? '',
      apellido: patient.apellidos?.trim() ?? '',
      telefono: patient.telefonoWhatsapp ?? '',
      documento: patient.numeroDocumento ?? '',
      fecha: new Date().toLocaleDateString('es-PE'),
    };

    return content.replace(
      /{{\s*(nombre|apellido|telefono|documento|fecha)\s*}}/gi,
      (_, key: string) => values[key.toLowerCase()] ?? '',
    );
  }
}
