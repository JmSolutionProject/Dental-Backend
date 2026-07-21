import { Inject, Injectable } from '@nestjs/common';
import {
  PAYMENTS_REPOSITORY,
  type PaymentsRepository,
} from '../../domain/repositories/payments.repository';

@Injectable()
export class FindAllPaymentMethodsUseCase {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  execute() {
    return this.paymentsRepository.findAllMethods();
  }
}
