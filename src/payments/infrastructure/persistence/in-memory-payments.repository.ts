import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from '../../domain/repositories/payments.repository';

@Injectable()
export class InMemoryPaymentsRepository implements PaymentsRepository {}
