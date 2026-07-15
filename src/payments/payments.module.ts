import { Module } from '@nestjs/common';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { PAYMENTS_REPOSITORY } from './domain/repositories/payments.repository';
import { PrismaPaymentsRepository } from './infrastructure/persistence/prisma-payments.repository';
import { PaymentsController } from './presentation/controllers/payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [
    CreatePaymentUseCase,
    {
      provide: PAYMENTS_REPOSITORY,
      useClass: PrismaPaymentsRepository,
    },
  ],
})
export class PaymentsModule {}
