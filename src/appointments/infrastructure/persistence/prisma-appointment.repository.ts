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
      },
    });

    return appointment ? this.toEntity(appointment) : null;
  }

  async create(
    appointment: CreateAppointmentParams,
  ): Promise<AppointmentEntity> {
    const created = await this.prisma.cita.create({
      data: {
        pacienteId: appointment.pacienteId,
        medicoId: appointment.medicoId,
        estadoCitaId: appointment.estadoCitaId,
        fechaHoraInicio: new Date(appointment.fechaHoraInicio),
        fechaHoraFin: new Date(appointment.fechaHoraFin),
        motivoPrincipal: appointment.motivoPrincipal,
        observaciones: appointment.observaciones,
      },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
      },
    });

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
      },
    });

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

  private toEntity(appointment: AppointmentWithRelations): AppointmentEntity {
    return new AppointmentEntity({
      id: appointment.id,
      pacienteId: appointment.pacienteId,
      medicoId: appointment.medicoId,
      estadoCitaId: appointment.estadoCitaId,
      fechaHoraInicio: appointment.fechaHoraInicio,
      fechaHoraFin: appointment.fechaHoraFin,
      motivoPrincipal: appointment.motivoPrincipal ?? undefined,
      observaciones: appointment.observaciones ?? undefined,
      fechaRegistro: appointment.fechaRegistro,
      pacienteName: `${appointment.paciente.nombres} ${appointment.paciente.apellidos}`,
      medicoName: appointment.medico.nombreCompleto,
      estadoNombre: appointment.estadoCita.nombreEstado,
    });
  }
}
