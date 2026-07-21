import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import {
  AppointmentRepository,
  AvailabilityResult,
  CheckAvailabilityParams,
  CreateAppointmentParams,
  FindAllAppointmentsParams,
  PaginatedAppointmentsResult,
  UpdateAppointmentParams,
} from '../../domain/repositories/appointment.repository';

type AppointmentWithRelations = Prisma.CitaGetPayload<{
  include: {
    paciente: true;
    medico: true;
    estadoCita: true;
    servicios: {
      include: {
        servicio: {
          include: { precios: { orderBy: { fechaInicio: 'desc' }, take: 1 } };
        };
      };
    };
  };
}>;

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.cita.count();
  }

  async findAll(
    params: FindAllAppointmentsParams,
  ): Promise<PaginatedAppointmentsResult> {
    const { page, limit } = params;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.cita.findMany({
        orderBy: { fechaHoraInicio: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          paciente: true,
          medico: true,
          estadoCita: true,
          servicios: {
            include: {
              servicio: {
                include: { precios: { orderBy: { fechaInicio: 'desc' }, take: 1 } },
              },
            },
          },
        },
      }),
      this.prisma.cita.count(),
    ]);

    return {
      data: data.map((appointment) => this.toEntity(appointment)),
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<AppointmentEntity | null> {
    const appointment = await this.prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
        servicios: {
          include: {
            servicio: {
              include: { precios: { orderBy: { fechaInicio: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });

    return appointment ? this.toEntity(appointment) : null;
  }

  async create(
    appointment: CreateAppointmentParams,
  ): Promise<AppointmentEntity> {
    const created = await this.prisma.$transaction(async (tx) => {
      const cita = await tx.cita.create({
        data: {
          pacienteId: appointment.pacienteId,
          medicoId: appointment.medicoId,
          estadoCitaId: appointment.estadoCitaId,
          planServicioId: appointment.planServicioId ?? null,
          fechaHoraInicio: new Date(appointment.fechaHoraInicio),
          fechaHoraFin: new Date(appointment.fechaHoraFin),
          motivoPrincipal: appointment.motivoPrincipal,
          observaciones: appointment.observaciones,
          servicios: appointment.servicios?.length
            ? {
                create: appointment.servicios.map((s) => ({
                  servicioId: s.servicioId,
                  cantidad: s.cantidad,
                  descuento: s.descuento ?? 0,
                })),
              }
            : undefined,
        },
        include: {
          paciente: true,
          medico: true,
          estadoCita: true,
          servicios: {
            include: {
              servicio: {
                include: { precios: { orderBy: { fechaInicio: 'desc' }, take: 1 } },
              },
            },
          },
        },
      });

      return cita;
    });

    await this.syncPlanServicioStatus(
      created.planServicioId,
      created.estadoCitaId,
    );

    return this.toEntity(created);
  }

  async update(
    id: number,
    appointment: UpdateAppointmentParams,
  ): Promise<AppointmentEntity> {
    const updated = await this.prisma.cita.update({
      where: { id },
      data: {
        pacienteId: appointment.pacienteId,
        medicoId: appointment.medicoId,
        estadoCitaId: appointment.estadoCitaId,
        planServicioId: appointment.planServicioId,
        fechaHoraInicio: appointment.fechaHoraInicio
          ? new Date(appointment.fechaHoraInicio)
          : undefined,
        fechaHoraFin: appointment.fechaHoraFin
          ? new Date(appointment.fechaHoraFin)
          : undefined,
        motivoPrincipal: appointment.motivoPrincipal,
        observaciones: appointment.observaciones,
      },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
        servicios: {
          include: {
            servicio: {
              include: { precios: { orderBy: { fechaInicio: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });

    await this.syncPlanServicioStatus(
      updated.planServicioId,
      updated.estadoCitaId,
    );

    return this.toEntity(updated);
  }

  async cancel(id: number): Promise<AppointmentEntity> {
    const cancelledStatus = await this.resolveStatus('cancelled');

    const cancelled = await this.prisma.cita.update({
      where: { id },
      data: { estadoCitaId: cancelledStatus.id },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
        servicios: {
          include: {
            servicio: {
              include: { precios: { orderBy: { fechaInicio: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });

    return this.toEntity(cancelled);
  }

  async checkAvailability(
    params: CheckAvailabilityParams,
  ): Promise<AvailabilityResult> {
    const conflicts = await this.prisma.cita.findMany({
      where: {
        medicoId: params.medicoId,
        fechaHoraInicio: { lt: params.fechaHoraFin },
        fechaHoraFin: { gt: params.fechaHoraInicio },
        estadoCita: {
          nombreEstado: { not: 'cancelled', mode: 'insensitive' },
        },
      },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
        servicios: {
          include: {
            servicio: {
              include: { precios: { orderBy: { fechaInicio: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });

    return {
      available: conflicts.length === 0,
      conflicts: conflicts.map((appointment) => this.toEntity(appointment)),
    };
  }

  async findStatusByName(
    name: string,
  ): Promise<{ id: number; nombreEstado: string } | null> {
    return this.prisma.estadoCita.findFirst({
      where: { nombreEstado: { equals: name, mode: 'insensitive' } },
    });
  }

  async findAllStatuses(): Promise<
    Array<{ id: number; nombreEstado: string }>
  > {
    return this.prisma.estadoCita.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async createStatus(
    name: string,
  ): Promise<{ id: number; nombreEstado: string }> {
    return this.prisma.estadoCita.create({ data: { nombreEstado: name } });
  }

  private async resolveStatus(
    name: string,
  ): Promise<{ id: number; nombreEstado: string }> {
    const existing = await this.findStatusByName(name);
    return existing ?? (await this.createStatus(name));
  }

  private async syncPlanServicioStatus(
    planServicioId: number | null,
    estadoCitaId: number,
  ) {
    if (!planServicioId) return;

    const status = await this.prisma.estadoCita.findUnique({
      where: { id: estadoCitaId },
    });
    const isFinalized = status?.nombreEstado === 'Finalizada';

    await this.prisma.planTratamientoServicio.update({
      where: { id: planServicioId },
      data: { ejecutado: isFinalized },
    });

    const planServicio = await this.prisma.planTratamientoServicio.findUnique({
      where: { id: planServicioId },
    });
    if (planServicio?.odontogramaDetalleId) {
      const targetCondition = isFinalized ? 'restoration' : 'caries';
      const state =
        (await this.prisma.estadoPiezaDental.findFirst({
          where: {
            nombreEstado: { equals: targetCondition, mode: 'insensitive' },
          },
        })) ??
        (await this.prisma.estadoPiezaDental.create({
          data: { nombreEstado: targetCondition },
        }));

      await this.prisma.odontogramaDetalle.update({
        where: { id: planServicio.odontogramaDetalleId },
        data: {
          estadoPiezaId: state.id,
          diagnostico: isFinalized ? 'Tratado' : 'Caries',
        },
      });
    }
  }

  private toEntity(appointment: AppointmentWithRelations): AppointmentEntity {
    const servicios =
      appointment.servicios?.map((s) => ({
        id: s.id,
        cantidad: s.cantidad,
        descuento: Number(s.descuento),
        servicio: {
          id: s.servicio.id,
          nombreServicio: s.servicio.nombreServicio,
          precio: Number(s.servicio.precios[0]?.precio ?? 0),
        },
      })) ?? [];

    return new AppointmentEntity({
      id: appointment.id,
      pacienteId: appointment.pacienteId,
      medicoId: appointment.medicoId,
      estadoCitaId: appointment.estadoCitaId,
      planServicioId: appointment.planServicioId ?? undefined,
      fechaHoraInicio: appointment.fechaHoraInicio,
      fechaHoraFin: appointment.fechaHoraFin,
      motivoPrincipal: appointment.motivoPrincipal ?? undefined,
      observaciones: appointment.observaciones ?? undefined,
      fechaRegistro: appointment.fechaRegistro,
      pacienteName: `${appointment.paciente.nombres} ${appointment.paciente.apellidos}`,
      medicoName: appointment.medico.nombreCompleto,
      estadoNombre: appointment.estadoCita.nombreEstado,
      servicios,
    });
  }
}
