import { Inject, Injectable } from '@nestjs/common';
import { PAYMENTS_REPOSITORY } from '../../domain/repositories/payments.repository';
import type { PaymentsRepository } from '../../domain/repositories/payments.repository';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepository,
  ) {}
}
