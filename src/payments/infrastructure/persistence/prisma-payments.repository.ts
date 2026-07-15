import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from '../../domain/repositories/payments.repository';

@Injectable()
export class PrismaPaymentsRepository implements PaymentsRepository {
  count(): Promise<number> {
    return Promise.resolve(0);
  }
}
