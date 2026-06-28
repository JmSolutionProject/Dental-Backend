import { Module } from '@nestjs/common';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { PAYMENTS_REPOSITORY } from './domain/repositories/payments.repository';
import { InMemoryPaymentsRepository } from './infrastructure/persistence/in-memory-payments.repository';
import { PaymentsController } from './presentation/controllers/payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [
    CreatePaymentUseCase,
    {
      provide: PAYMENTS_REPOSITORY,
      useClass: InMemoryPaymentsRepository,
    },
  ],
})
export class PaymentsModule {}
