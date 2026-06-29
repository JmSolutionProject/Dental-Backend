import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from '../../domain/repositories/payments.repository';

@Injectable()
export class InMemoryPaymentsRepository implements PaymentsRepository {
  count(): Promise<number> {
    return Promise.resolve(0);
  }
}
