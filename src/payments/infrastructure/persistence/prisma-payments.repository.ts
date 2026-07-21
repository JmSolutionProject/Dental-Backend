import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  CreatePaymentParams,
  FindAllPaymentsParams,
  PaginatedPaymentsResult,
  PaymentsRepository,
  UpdatePaymentParams,
} from '../../domain/repositories/payments.repository';

type PaymentWithRelations = Prisma.PagoGetPayload<{
  include: {
    metodoPago: true;
    usuarioCobrador: true;
    cita: true;
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
    const { page, limit, search } = params;
    const where = this.buildSearchWhere(search);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pago.findMany({
        where,
        orderBy: { fechaPago: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { metodoPago: true, usuarioCobrador: true, cita: true },
      }),
      this.prisma.pago.count({ where }),
    ]);

    return {
      data: data.map((payment) => this.toEntity(payment)),
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<PaymentEntity | null> {
    const payment = await this.prisma.pago.findUnique({
      where: { id },
      include: { metodoPago: true, usuarioCobrador: true, cita: true },
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
      include: { metodoPago: true, usuarioCobrador: true, cita: true },
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
      include: { metodoPago: true, usuarioCobrador: true, cita: true },
    });

    return this.toEntity(updated);
  }

  async softDelete(id: number): Promise<PaymentEntity> {
    const deleted = await this.prisma.pago.update({
      where: { id },
      data: { estado: false },
      include: { metodoPago: true, usuarioCobrador: true, cita: true },
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
