import { Inject, Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  PAYMENTS_REPOSITORY,
  type PaymentsRepository,
} from '../../domain/repositories/payments.repository';

@Injectable()
export class SoftDeletePaymentUseCase {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  execute(id: number): Promise<PaymentEntity> {
    return this.paymentsRepository.softDelete(id);
  }
}
