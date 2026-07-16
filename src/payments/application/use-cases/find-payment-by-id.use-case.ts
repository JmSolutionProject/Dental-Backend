import { Inject, Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  PAYMENTS_REPOSITORY,
  type PaymentsRepository,
} from '../../domain/repositories/payments.repository';

@Injectable()
export class FindPaymentByIdUseCase {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  execute(id: number): Promise<PaymentEntity | null> {
    return this.paymentsRepository.findById(id);
  }
}
