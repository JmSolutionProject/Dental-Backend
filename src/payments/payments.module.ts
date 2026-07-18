import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { FindAllPaymentsUseCase } from './application/use-cases/find-all-payments.use-case';
import { FindAllPaymentMethodsUseCase } from './application/use-cases/find-all-payment-methods.use-case';
import { FindPaymentByIdUseCase } from './application/use-cases/find-payment-by-id.use-case';
import { SoftDeletePaymentUseCase } from './application/use-cases/soft-delete-payment.use-case';
import { UpdatePaymentUseCase } from './application/use-cases/update-payment.use-case';
import { PAYMENTS_REPOSITORY } from './domain/repositories/payments.repository';
import { PrismaPaymentsRepository } from './infrastructure/persistence/prisma-payments.repository';
import { PaymentsController } from './presentation/controllers/payments.controller';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [PaymentsController],
  providers: [
    CreatePaymentUseCase,
    FindAllPaymentMethodsUseCase,
    FindAllPaymentsUseCase,
    FindPaymentByIdUseCase,
    UpdatePaymentUseCase,
    SoftDeletePaymentUseCase,
    {
      provide: PAYMENTS_REPOSITORY,
      useClass: PrismaPaymentsRepository,
    },
  ],
})
export class PaymentsModule {}
