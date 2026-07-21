import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import {
  CreatePlanCommand,
  UpdatePlanCommand,
  PlanWithServices,
} from '../../domain/types/plan.types';

interface PlanPrismaResult {
  id: number;
  pacienteId: number;
  medicoId: number;
  estado: string;
  fechaCreacion: Date;
  observaciones: string | null;
  paciente: { nombres: string; apellidos: string };
  medico: { nombreCompleto: string };
  servicios: Array<{
    id: number;
    cantidad: number;
    descuento: Prisma.Decimal;
    ejecutado: boolean;
    odontogramaDetalleId: number | null;
    servicio: {
      id: number;
      nombreServicio: string;
      precios: Array<{ precio: Prisma.Decimal }>;
    };
  }>;
}

@Injectable()
export class ManagePlansUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(patientId?: number): Promise<PlanWithServices[]> {
    const where = patientId ? { pacienteId: patientId } : {};
    const plans = await this.prisma.planTratamiento.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: { select: { nombres: true, apellidos: true } },
        medico: { select: { nombreCompleto: true } },
        servicios: {
          include: {
            servicio: {
              include: {
                precios: {
                  where: { estado: true },
                  orderBy: { fechaInicio: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return plans.map((p) => this.toPlanResponse(p));
  }

  async findById(id: number): Promise<PlanWithServices> {
    const plan = await this.prisma.planTratamiento.findUnique({
      where: { id },
      include: {
        paciente: { select: { nombres: true, apellidos: true } },
        medico: { select: { nombreCompleto: true } },
        servicios: {
          include: {
            servicio: {
              include: {
                precios: {
                  where: { estado: true },
                  orderBy: { fechaInicio: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!plan) throw new NotFoundException('Plan no encontrado.');
    return this.toPlanResponse(plan);
  }

  async create(cmd: CreatePlanCommand): Promise<PlanWithServices> {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: cmd.pacienteId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado.');

    const medico = await this.prisma.usuario.findUnique({
      where: { id: cmd.medicoId },
    });
    if (!medico) throw new NotFoundException('Médico no encontrado.');

    const plan = await this.prisma.planTratamiento.create({
      data: {
        pacienteId: cmd.pacienteId,
        medicoId: cmd.medicoId,
        observaciones: cmd.observaciones ?? null,
        servicios: {
          create: cmd.servicios.map((s) => ({
            servicioId: s.servicioId,
            cantidad: s.cantidad,
            descuento: s.descuento,
            odontogramaDetalleId: s.odontogramaDetalleId ?? null,
          })),
        },
      },
      include: {
        paciente: { select: { nombres: true, apellidos: true } },
        medico: { select: { nombreCompleto: true } },
        servicios: {
          include: {
            servicio: {
              include: {
                precios: {
                  where: { estado: true },
                  orderBy: { fechaInicio: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return this.toPlanResponse(plan);
  }

  async update(id: number, cmd: UpdatePlanCommand): Promise<PlanWithServices> {
    const exists = await this.prisma.planTratamiento.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('Plan no encontrado.');

    const data: Record<string, unknown> = {};
    if (cmd.estado) data.estado = cmd.estado;
    if (cmd.observaciones !== undefined) data.observaciones = cmd.observaciones;

    await this.prisma.planTratamiento.update({ where: { id }, data });
    return this.findById(id);
  }

  private toPlanResponse(p: PlanPrismaResult): PlanWithServices {
    return {
      id: p.id,
      pacienteId: p.pacienteId,
      medicoId: p.medicoId,
      estado: p.estado,
      fechaCreacion: p.fechaCreacion.toISOString(),
      observaciones: p.observaciones,
      paciente: p.paciente,
      medico: p.medico,
      servicios: p.servicios.map((s) => ({
        id: s.id,
        cantidad: s.cantidad,
        descuento: Number(s.descuento),
        ejecutado: s.ejecutado,
        odontogramaDetalleId: s.odontogramaDetalleId,
        servicio: {
          id: s.servicio.id,
          nombreServicio: s.servicio.nombreServicio,
          precioActual: Number(s.servicio.precios[0]?.precio ?? 0),
        },
      })),
    };
  }

  async toggleServiceExecution(
    itemId: number,
  ): Promise<{ success: boolean; ejecutado: boolean }> {
    const item = await this.prisma.planTratamientoServicio.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Servicio del plan no encontrado.');

    const updated = await this.prisma.planTratamientoServicio.update({
      where: { id: itemId },
      data: { ejecutado: !item.ejecutado },
    });

    return { success: true, ejecutado: updated.ejecutado };
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const exists = await this.prisma.planTratamiento.findUnique({
      where: { id },
      include: { servicios: true },
    });
    if (!exists) throw new NotFoundException('Plan no encontrado.');

    const serviceIds = exists.servicios.map((s) => s.id);

    await this.prisma.$transaction([
      this.prisma.cita.updateMany({
        where: { planServicioId: { in: serviceIds } },
        data: { planServicioId: null },
      }),
      this.prisma.planTratamientoServicio.deleteMany({ where: { planId: id } }),
      this.prisma.planTratamiento.delete({ where: { id } }),
    ]);

    return { success: true };
  }
}
