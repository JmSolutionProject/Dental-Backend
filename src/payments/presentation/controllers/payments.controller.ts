import { Controller } from '@nestjs/common';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly createPaymentUseCase: CreatePaymentUseCase) {}
}
