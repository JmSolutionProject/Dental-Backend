import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { FindAllPaymentsUseCase } from '../../application/use-cases/find-all-payments.use-case';
import { FindPaymentByIdUseCase } from '../../application/use-cases/find-payment-by-id.use-case';
import { SoftDeletePaymentUseCase } from '../../application/use-cases/soft-delete-payment.use-case';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { CreatePaymentRequestDto } from '../dtos/request/create-payment.request.dto';
import { UpdatePaymentRequestDto } from '../dtos/request/update-payment.request.dto';

@ApiTags('payments')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly findAllPaymentsUseCase: FindAllPaymentsUseCase,
    private readonly findPaymentByIdUseCase: FindPaymentByIdUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly softDeletePaymentUseCase: SoftDeletePaymentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar pagos' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);

    const result = await this.findAllPaymentsUseCase.execute({ page, limit });

    return {
      data: result.data.map((payment) => this.toPaymentResponse(payment)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pago por id' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findById(@Param('id') id: string) {
    const payment = await this.findPaymentByIdUseCase.execute(Number(id));

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    return this.toPaymentResponse(payment);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un pago' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  async create(@Body() payload: CreatePaymentRequestDto) {
    const payment = await this.createPaymentUseCase.execute({
      citaId: payload.citaId,
      usuarioCobradorId: payload.usuarioCobradorId,
      metodoPagoId: payload.metodoPagoId,
      montoPagado: payload.montoPagado,
      numeroOperacion: payload.numeroOperacion,
      observacion: payload.observacion,
      fechaPago: payload.fechaPago,
    });

    return this.toPaymentResponse(payment);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar pago' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdatePaymentRequestDto,
  ) {
    await this.ensurePaymentExists(Number(id));

    const payment = await this.updatePaymentUseCase.execute(Number(id), {
      citaId: payload.citaId,
      usuarioCobradorId: payload.usuarioCobradorId,
      metodoPagoId: payload.metodoPagoId,
      montoPagado: payload.montoPagado,
      numeroOperacion: payload.numeroOperacion,
      observacion: payload.observacion,
      fechaPago: payload.fechaPago,
    });

    return this.toPaymentResponse(payment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar pago' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('id') id: string) {
    await this.ensurePaymentExists(Number(id));

    const payment = await this.softDeletePaymentUseCase.execute(Number(id));

    return this.toPaymentResponse(payment);
  }

  private async ensurePaymentExists(id: number): Promise<void> {
    const payment = await this.findPaymentByIdUseCase.execute(id);

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }
  }

  private toPaymentResponse(payment: PaymentEntity) {
    return {
      id: String(payment.id),
      appointmentId: String(payment.citaId),
      cashierId: String(payment.usuarioCobradorId),
      cashierName: payment.usuarioCobradorName ?? '',
      methodId: String(payment.metodoPagoId),
      methodName: payment.metodoPagoName ?? '',
      amount: payment.montoPagado,
      reference: payment.numeroOperacion,
      notes: payment.observacion ?? '',
      paidAt: payment.fechaPago.toISOString(),
      status: payment.estado ? 'active' : 'inactive',
    };
  }

  private toPositiveNumber(
    value: string | undefined,
    fallback: number,
  ): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }
}
