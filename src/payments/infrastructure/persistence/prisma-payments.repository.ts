import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  CreatePaymentParams,
  FindAllPaymentsParams,
  PaginatedPaymentsResult,
  PaymentSummary,
  PaymentsRepository,
  UpdatePaymentParams,
} from '../../domain/repositories/payments.repository';

type PaymentWithRelations = Prisma.PagoGetPayload<{
  include: {
    metodoPago: true;
    usuarioCobrador: true;
    cita: { include: { paciente: true } };
  };
}>;

@Injectable()
export class PrismaPaymentsRepository implements PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.pago.count();
  }

  async findAll(
    params: FindAllPaymentsParams,
  ): Promise<PaginatedPaymentsResult> {
    const { page, limit, search, patientId } = params;
    const searchWhere = this.buildSearchWhere(search);
    const where: Prisma.PagoWhereInput | undefined =
      patientId !== undefined
        ? {
            ...(searchWhere ?? {}),
            cita: { pacienteId: patientId },
          }
        : searchWhere;

    const [data, total, aggregate] = await this.prisma.$transaction([
      this.prisma.pago.findMany({
        where,
        orderBy: { fechaPago: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { metodoPago: true, usuarioCobrador: true, cita: { include: { paciente: true } } },
      }),
      this.prisma.pago.count({ where }),
      this.prisma.pago.findMany({
        where: { ...(where ?? {}), estado: true },
        select: {
          citaId: true,
          montoPagado: true,
          metodoPago: { select: { nombreMetodo: true } },
        },
      }),
    ]);

    return {
      data: data.map((payment) => this.toEntity(payment)),
      total,
      page,
      limit,
      summary: this.buildSummary(aggregate),
      paidAppointmentIds: [...new Set(aggregate.map((p) => p.citaId))],
    };
  }

  private buildSummary(
    payments: Array<{
      citaId: number;
      montoPagado: { toString(): string } | number;
      metodoPago: { nombreMetodo: string };
    }>,
  ): PaymentSummary {
    const summary: PaymentSummary = {
      totalAmount: 0,
      totalPayments: 0,
      cashAmount: 0,
      cardAmount: 0,
      transferAmount: 0,
      digitalWalletAmount: 0,
      voidedAmount: 0,
    };

    for (const payment of payments) {
      const amount = Number(payment.montoPagado.toString());
      const name = payment.metodoPago.nombreMetodo.toLowerCase();

      summary.totalPayments += 1;
      summary.totalAmount += amount;

      if (name.includes('efectivo') || name.includes('cash')) {
        summary.cashAmount += amount;
      } else if (
        name.includes('tarjeta') ||
        name.includes('card') ||
        name.includes('pos') ||
        name.includes('visa') ||
        name.includes('mastercard')
      ) {
        summary.cardAmount += amount;
      } else if (
        name.includes('transfer') ||
        name.includes('banco') ||
        name.includes('deposito')
      ) {
        summary.transferAmount += amount;
      } else if (
        name.includes('yape') ||
        name.includes('plin') ||
        name.includes('billetera') ||
        name.includes('qr')
      ) {
        summary.digitalWalletAmount += amount;
      } else {
        summary.cashAmount += amount;
      }
    }

    return summary;
  }

  async findById(id: number): Promise<PaymentEntity | null> {
    const payment = await this.prisma.pago.findUnique({
      where: { id },
      include: { metodoPago: true, usuarioCobrador: true, cita: { include: { paciente: true } } },
    });

    return payment ? this.toEntity(payment) : null;
  }

  async findAllMethods() {
    return this.prisma.metodoPago.findMany({
      where: { estado: true },
      orderBy: { nombreMetodo: 'asc' },
      select: { id: true, nombreMetodo: true },
    });
  }

  async create(payment: CreatePaymentParams): Promise<PaymentEntity> {
    const created = await this.prisma.pago.create({
      data: {
        citaId: payment.citaId,
        usuarioCobradorId: payment.usuarioCobradorId,
        metodoPagoId: payment.metodoPagoId,
        montoPagado: payment.montoPagado,
        numeroOperacion: payment.numeroOperacion ?? null,
        observacion: payment.observacion ?? null,
        fechaPago: payment.fechaPago ? new Date(payment.fechaPago) : new Date(),
      },
      include: { metodoPago: true, usuarioCobrador: true, cita: { include: { paciente: true } } },
    });

    return this.toEntity(created);
  }

  async update(
    id: number,
    payment: UpdatePaymentParams,
  ): Promise<PaymentEntity> {
    const updated = await this.prisma.pago.update({
      where: { id },
      data: {
        citaId: payment.citaId,
        usuarioCobradorId: payment.usuarioCobradorId,
        metodoPagoId: payment.metodoPagoId,
        montoPagado: payment.montoPagado,
        numeroOperacion: payment.numeroOperacion,
        observacion: payment.observacion,
        fechaPago: payment.fechaPago ? new Date(payment.fechaPago) : undefined,
      },
      include: { metodoPago: true, usuarioCobrador: true, cita: { include: { paciente: true } } },
    });

    return this.toEntity(updated);
  }

  async softDelete(id: number): Promise<PaymentEntity> {
    const deleted = await this.prisma.pago.update({
      where: { id },
      data: { estado: false },
      include: { metodoPago: true, usuarioCobrador: true, cita: { include: { paciente: true } } },
    });

    return this.toEntity(deleted);
  }

  private toEntity(payment: PaymentWithRelations): PaymentEntity {
    return new PaymentEntity({
      id: payment.id,
      citaId: payment.citaId,
      usuarioCobradorId: payment.usuarioCobradorId,
      metodoPagoId: payment.metodoPagoId,
      montoPagado: Number(payment.montoPagado.toString()),
      numeroOperacion: payment.numeroOperacion,
      observacion: payment.observacion,
      fechaPago: payment.fechaPago,
      estado: payment.estado,
      metodoPagoName: payment.metodoPago.nombreMetodo,
      usuarioCobradorName: payment.usuarioCobrador.nombreCompleto,
      patientId: payment.cita?.pacienteId,
      patientName: payment.cita?.paciente
        ? `${payment.cita.paciente.nombres} ${payment.cita.paciente.apellidos}`.trim()
        : undefined,
      patientPhone: payment.cita?.paciente?.telefonoWhatsapp ?? undefined,
      planServicioId: payment.cita?.planServicioId ?? null,
    });
  }

  private buildSearchWhere(search?: string): Prisma.PagoWhereInput | undefined {
    if (!search) return undefined;

    const numericSearch = Number(search);
    const numericFilters: Prisma.PagoWhereInput[] = Number.isFinite(numericSearch)
      ? [
          { id: numericSearch },
          { citaId: numericSearch },
          { usuarioCobradorId: numericSearch },
          { metodoPagoId: numericSearch },
        ]
      : [];

    return {
      OR: [
        ...numericFilters,
        { numeroOperacion: { contains: search, mode: 'insensitive' } },
        { observacion: { contains: search, mode: 'insensitive' } },
        {
          metodoPago: {
            nombreMetodo: { contains: search, mode: 'insensitive' },
          },
        },
        {
          usuarioCobrador: {
            nombreCompleto: { contains: search, mode: 'insensitive' },
          },
        },
      ],
    };
  }
}
