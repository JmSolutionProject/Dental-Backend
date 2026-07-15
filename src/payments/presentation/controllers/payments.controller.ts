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
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { CreatePaymentRequestDto } from '../dtos/request/create-payment.request.dto';
import { UpdatePaymentRequestDto } from '../dtos/request/update-payment.request.dto';

@ApiTags('payments')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar pagos' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.pago.findMany({
        orderBy: { fechaPago: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { metodoPago: true, usuarioCobrador: true, cita: true },
      }),
      this.prisma.pago.count(),
    ]);

    return {
      data: data.map((payment) => this.toPaymentResponse(payment)),
      total,
      page,
      limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pago por id' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findById(@Param('id') id: string) {
    const payment = await this.prisma.pago.findUnique({
      where: { id: Number(id) },
      include: { metodoPago: true, usuarioCobrador: true, cita: true },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    return this.toPaymentResponse(payment);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un pago' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreatePaymentRequestDto) {
    return this.createPaymentUseCase.execute(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar pago' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdatePaymentRequestDto,
  ) {
    await this.ensurePaymentExists(id);

    await this.prisma.pago.update({
      where: { id: Number(id) },
      data: {
        citaId: payload.citaId,
        usuarioCobradorId: payload.usuarioCobradorId,
        metodoPagoId: payload.metodoPagoId,
        montoPagado: payload.montoPagado,
        numeroOperacion: payload.numeroOperacion,
        observacion: payload.observacion,
        fechaPago: payload.fechaPago ? new Date(payload.fechaPago) : undefined,
      },
    });

    return this.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar pago' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('id') id: string) {
    await this.ensurePaymentExists(id);

    await this.prisma.pago.update({
      where: { id: Number(id) },
      data: { estado: false },
    });

    return this.findById(id);
  }

  private async ensurePaymentExists(id: string): Promise<void> {
    const payment = await this.prisma.pago.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }
  }

  private toPaymentResponse(payment: {
    id: number;
    citaId: number;
    usuarioCobradorId: number;
    metodoPagoId: number;
    montoPagado: { toString(): string };
    numeroOperacion: string | null;
    observacion: string | null;
    fechaPago: Date;
    estado: boolean;
    metodoPago: { nombreMetodo: string };
    usuarioCobrador: { nombreCompleto: string };
  }) {
    return {
      id: String(payment.id),
      appointmentId: String(payment.citaId),
      cashierId: String(payment.usuarioCobradorId),
      cashierName: payment.usuarioCobrador.nombreCompleto,
      methodId: String(payment.metodoPagoId),
      methodName: payment.metodoPago.nombreMetodo,
      amount: Number(payment.montoPagado.toString()),
      reference: payment.numeroOperacion,
      notes: payment.observacion ?? '',
      paidAt: payment.fechaPago.toISOString(),
      status: payment.estado ? 'active' : 'inactive',
    };
  }

  private toPositiveNumber(value: string | undefined, fallback: number): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }
}
