import { Inject, Injectable } from '@nestjs/common';
import {
  FindAllPaymentsParams,
  PaginatedPaymentsResult,
  PAYMENTS_REPOSITORY,
  type PaymentsRepository,
} from '../../domain/repositories/payments.repository';

@Injectable()
export class FindAllPaymentsUseCase {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  execute(params: FindAllPaymentsParams): Promise<PaginatedPaymentsResult> {
    return this.paymentsRepository.findAll(params);
  }
}
