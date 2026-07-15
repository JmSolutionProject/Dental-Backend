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
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { AppointmentAvailabilityRequestDto } from '../dtos/request/appointment-availability.request.dto';
import { CreateAppointmentRequestDto } from '../dtos/request/create-appointment.request.dto';
import { UpdateAppointmentRequestDto } from '../dtos/request/update-appointment.request.dto';

type AppointmentWithRelations = Prisma.CitaGetPayload<{
  include: {
    paciente: true;
    medico: true;
    estadoCita: true;
  };
}>;

type AppointmentResponse = {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  scheduledAt: string;
  reason: string;
  status: string;
  cancelReason: string | null;
};

@ApiTags('appointments')
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get('availability')
  @ApiOperation({ summary: 'Validar disponibilidad antes de crear cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async availability(@Query() query: AppointmentAvailabilityRequestDto) {
    if (!query.dentistId || !query.start || !query.end) {
      return { available: false, conflicts: [] };
    }

    const start = new Date(query.start);
    const end = new Date(query.end);
    const conflicts = await this.prisma.cita.findMany({
      where: {
        medicoId: Number(query.dentistId),
        fechaHoraInicio: { lt: end },
        fechaHoraFin: { gt: start },
        estadoCita: {
          nombreEstado: { not: 'cancelled', mode: 'insensitive' },
        },
      },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
      },
    });

    return {
      available: conflicts.length === 0,
      conflicts: conflicts.map((appointment) =>
        this.toAppointmentResponse(appointment),
      ),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar citas' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.cita.findMany({
        orderBy: { fechaHoraInicio: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          paciente: true,
          medico: true,
          estadoCita: true,
        },
      }),
      this.prisma.cita.count(),
    ]);

    return {
      data: data.map((appointment) => this.toAppointmentResponse(appointment)),
      total,
      page,
      limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findById(@Param('id') id: string): Promise<AppointmentResponse> {
    const appointment = await this.prisma.cita.findUnique({
      where: { id: Number(id) },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada.');
    }

    return this.toAppointmentResponse(appointment);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una cita' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreateAppointmentRequestDto) {
    return this.createAppointmentUseCase.execute(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateAppointmentRequestDto,
  ): Promise<AppointmentResponse> {
    await this.ensureAppointmentExists(id);

    const appointment = await this.prisma.cita.update({
      where: { id: Number(id) },
      data: {
        pacienteId: payload.pacienteId,
        medicoId: payload.medicoId,
        estadoCitaId: payload.estadoCitaId,
        fechaHoraInicio: payload.fechaHoraInicio
          ? new Date(payload.fechaHoraInicio)
          : undefined,
        fechaHoraFin: payload.fechaHoraFin
          ? new Date(payload.fechaHoraFin)
          : undefined,
        motivoPrincipal: payload.motivoPrincipal,
        observaciones: payload.observaciones,
      },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
      },
    });

    return this.toAppointmentResponse(appointment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('id') id: string): Promise<AppointmentResponse> {
    await this.ensureAppointmentExists(id);
    const cancelledStatus = await this.resolveAppointmentStatus('cancelled');
    const appointment = await this.prisma.cita.update({
      where: { id: Number(id) },
      data: { estadoCitaId: cancelledStatus.id },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
      },
    });

    return this.toAppointmentResponse(appointment);
  }

  private async ensureAppointmentExists(id: string): Promise<void> {
    const appointment = await this.prisma.cita.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada.');
    }
  }

  private async resolveAppointmentStatus(nombreEstado: string) {
    const existing = await this.prisma.estadoCita.findFirst({
      where: { nombreEstado: { equals: nombreEstado, mode: 'insensitive' } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.estadoCita.create({ data: { nombreEstado } });
  }

  private toPositiveNumber(
    value: string | undefined,
    fallback: number,
  ): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }

  private toAppointmentResponse(
    appointment: AppointmentWithRelations,
  ): AppointmentResponse {
    return {
      id: String(appointment.id),
      patientId: String(appointment.pacienteId),
      patientName: `${appointment.paciente.nombres} ${appointment.paciente.apellidos}`,
      dentistId: String(appointment.medicoId),
      dentistName: appointment.medico.nombreCompleto,
      scheduledAt: appointment.fechaHoraInicio.toISOString(),
      reason: appointment.motivoPrincipal ?? '',
      status: this.toFrontendStatus(appointment.estadoCita.nombreEstado),
      cancelReason:
        this.toFrontendStatus(appointment.estadoCita.nombreEstado) ===
        'cancelled'
          ? appointment.observaciones
          : null,
    };
  }

  private toFrontendStatus(status: string): string {
    const normalized = status.trim().toLowerCase();

    if (['cancelled', 'cancelada', 'cancelado'].includes(normalized)) {
      return 'cancelled';
    }

    if (['completed', 'completada', 'atendida'].includes(normalized)) {
      return 'completed';
    }

    return 'scheduled';
  }
}
