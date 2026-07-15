import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
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
    JwtAuthGuard,
    {
      provide: PAYMENTS_REPOSITORY,
      useClass: PrismaPaymentsRepository,
    },
  ],
})
export class PaymentsModule {}
