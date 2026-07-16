import { Inject, Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  PAYMENTS_REPOSITORY,
  type PaymentsRepository,
  UpdatePaymentParams,
} from '../../domain/repositories/payments.repository';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  execute(id: number, payload: UpdatePaymentParams): Promise<PaymentEntity> {
    return this.paymentsRepository.update(id, payload);
  }
}
