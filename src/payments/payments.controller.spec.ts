import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { FindAllPaymentMethodsUseCase } from './application/use-cases/find-all-payment-methods.use-case';
import { FindAllPaymentsUseCase } from './application/use-cases/find-all-payments.use-case';
import { FindPaymentByIdUseCase } from './application/use-cases/find-payment-by-id.use-case';
import { SoftDeletePaymentUseCase } from './application/use-cases/soft-delete-payment.use-case';
import { UpdatePaymentUseCase } from './application/use-cases/update-payment.use-case';
import { PaymentEntity } from './domain/entities/payment.entity';
import { PaymentsController } from './presentation/controllers/payments.controller';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let findAllPaymentMethodsUseCase: { execute: jest.Mock };
  let findAllPaymentsUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    findAllPaymentMethodsUseCase = { execute: jest.fn() };
    findAllPaymentsUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [PaymentsController],
      providers: [
        {
          provide: CreatePaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindAllPaymentMethodsUseCase,
          useValue: findAllPaymentMethodsUseCase,
        },
        {
          provide: FindAllPaymentsUseCase,
          useValue: findAllPaymentsUseCase,
        },
        {
          provide: FindPaymentByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdatePaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SoftDeletePaymentUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('lists payments with pagination metadata', async () => {
    const paidAt = new Date('2026-07-18T10:00:00.000Z');

    findAllPaymentsUseCase.execute.mockResolvedValue({
      data: [
        new PaymentEntity({
          id: 15,
          citaId: 8,
          usuarioCobradorId: 3,
          usuarioCobradorName: 'Maria Ramos',
          metodoPagoId: 2,
          metodoPagoName: 'Yape',
          montoPagado: 120,
          numeroOperacion: 'OP-001',
          observacion: 'Pago parcial',
          fechaPago: paidAt,
          estado: true,
        }),
      ],
      total: 25,
      page: 2,
      limit: 10,
    });

    const result = await controller.list({
      page: '2',
      limit: '10',
      search: ' Yape ',
    });

    expect(findAllPaymentsUseCase.execute).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      search: 'Yape',
    });
    expect(result).toEqual({
      data: [
        {
          id: '15',
          appointmentId: '8',
          cashierId: '3',
          cashierName: 'Maria Ramos',
          methodId: '2',
          methodName: 'Yape',
          amount: 120,
          reference: 'OP-001',
          notes: 'Pago parcial',
          paidAt: paidAt.toISOString(),
          status: 'active',
        },
      ],
      total: 25,
      page: 2,
      limit: 10,
    });
  });

  it('lists active payment methods', async () => {
    findAllPaymentMethodsUseCase.execute.mockResolvedValue([
      { id: 2, nombreMetodo: 'Efectivo' },
      { id: 3, nombreMetodo: 'Yape' },
    ]);

    await expect(controller.listMethods()).resolves.toEqual({
      data: [
        { id: '2', name: 'Efectivo' },
        { id: '3', name: 'Yape' },
      ],
    });
    expect(findAllPaymentMethodsUseCase.execute).toHaveBeenCalledWith();
  });
});
