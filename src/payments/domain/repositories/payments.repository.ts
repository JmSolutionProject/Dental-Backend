import { PaymentEntity } from '../entities/payment.entity';

export const PAYMENTS_REPOSITORY = Symbol('PAYMENTS_REPOSITORY');

export interface FindAllPaymentsParams {
  page: number;
  limit: number;
}

export interface PaginatedPaymentsResult {
  data: PaymentEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePaymentParams {
  citaId: number;
  usuarioCobradorId: number;
  metodoPagoId: number;
  montoPagado: number;
  numeroOperacion?: string | null;
  observacion?: string | null;
  fechaPago?: string | null;
}

export interface UpdatePaymentParams {
  citaId?: number;
  usuarioCobradorId?: number;
  metodoPagoId?: number;
  montoPagado?: number;
  numeroOperacion?: string | null;
  observacion?: string | null;
  fechaPago?: string | null;
}

export interface PaymentsRepository {
  count(): Promise<number>;
  findAll(params: FindAllPaymentsParams): Promise<PaginatedPaymentsResult>;
  findById(id: number): Promise<PaymentEntity | null>;
  create(payment: CreatePaymentParams): Promise<PaymentEntity>;
  update(id: number, payment: UpdatePaymentParams): Promise<PaymentEntity>;
  softDelete(id: number): Promise<PaymentEntity>;
}
