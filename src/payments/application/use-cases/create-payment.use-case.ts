import { Inject, Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  CreatePaymentParams,
  PAYMENTS_REPOSITORY,
  type PaymentsRepository,
} from '../../domain/repositories/payments.repository';
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
} from '@appointments/domain/repositories/appointment.repository';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(payload: CreatePaymentParams): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.create(payload);

    await this.appointmentRepository.markAsAttended(payload.citaId);

    return payment;
  }
}
