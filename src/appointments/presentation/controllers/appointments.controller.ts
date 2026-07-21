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
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { Roles } from '@auth/presentation/decorators/roles.decorator';
import { CancelAppointmentUseCase } from '../../application/use-cases/cancel-appointment.use-case';
import { CheckAvailabilityUseCase } from '../../application/use-cases/check-availability.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from '../../application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from '../../application/use-cases/find-appointment-by-id.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/update-appointment.use-case';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import { AppointmentAvailabilityRequestDto } from '../dtos/request/appointment-availability.request.dto';
import { CreateAppointmentRequestDto } from '../dtos/request/create-appointment.request.dto';
import { UpdateAppointmentRequestDto } from '../dtos/request/update-appointment.request.dto';

type AppointmentServiceResponse = {
  id: number;
  cantidad: number;
  descuento: number;
  servicio: { id: number; nombreServicio: string; precio: number };
};

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
  planServicioId?: string;
  servicios: AppointmentServiceResponse[];
};

@ApiTags('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly findAllAppointmentsUseCase: FindAllAppointmentsUseCase,
    private readonly findAppointmentByIdUseCase: FindAppointmentByIdUseCase,
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
  ) {}

  @Get('availability')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiOperation({ summary: 'Validar disponibilidad antes de crear cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async availability(@Query() query: AppointmentAvailabilityRequestDto) {
    if (!query.dentistId || !query.start || !query.end) {
      return { available: false, conflicts: [] };
    }

    const result = await this.checkAvailabilityUseCase.execute({
      medicoId: Number(query.dentistId),
      fechaHoraInicio: new Date(query.start),
      fechaHoraFin: new Date(query.end),
    });

    return {
      available: result.available,
      conflicts: result.conflicts.map((appointment) =>
        this.toAppointmentResponse(appointment),
      ),
    };
  }

  @Get('statuses')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiOperation({ summary: 'Listar estados de cita disponibles' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async listStatuses() {
    const statuses = await this.createAppointmentUseCase
      .listStatuses();
    return statuses.map((s) => ({ id: s.id, nombre: s.nombreEstado }));
  }

  @Get()
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiOperation({ summary: 'Listar citas' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);

    const result = await this.findAllAppointmentsUseCase.execute({
      page,
      limit,
    });

    return {
      data: result.data.map((appointment) =>
        this.toAppointmentResponse(appointment),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiOperation({ summary: 'Ver detalle de cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findById(@Param('id') id: string): Promise<AppointmentResponse> {
    const appointment = await this.findAppointmentByIdUseCase.execute(
      Number(id),
    );

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada.');
    }

    return this.toAppointmentResponse(appointment);
  }

  @Post()
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Crear una cita' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  async create(
    @Body() payload: CreateAppointmentRequestDto,
  ): Promise<AppointmentResponse> {
    const appointment = await this.createAppointmentUseCase.execute({
      pacienteId: payload.pacienteId,
      medicoId: payload.medicoId,
      estadoCitaId: payload.estadoCitaId,
      planServicioId: payload.planServicioId,
      fechaHoraInicio: payload.fechaHoraInicio,
      fechaHoraFin: payload.fechaHoraFin,
      motivoPrincipal: payload.motivoPrincipal,
      observaciones: payload.observaciones,
      servicios: payload.servicios,
    });

    return this.toAppointmentResponse(appointment);
  }

  @Put(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateAppointmentRequestDto,
  ): Promise<AppointmentResponse> {
    await this.ensureAppointmentExists(Number(id));

    const appointment = await this.updateAppointmentUseCase.execute(
      Number(id),
      {
        pacienteId: payload.pacienteId,
        medicoId: payload.medicoId,
        estadoCitaId: payload.estadoCitaId,
        planServicioId: payload.planServicioId,
        fechaHoraInicio: payload.fechaHoraInicio,
        fechaHoraFin: payload.fechaHoraFin,
        motivoPrincipal: payload.motivoPrincipal,
        observaciones: payload.observaciones,
      },
    );

    return this.toAppointmentResponse(appointment);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Cancelar cita' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('id') id: string): Promise<AppointmentResponse> {
    await this.ensureAppointmentExists(Number(id));

    const appointment = await this.cancelAppointmentUseCase.execute(Number(id));

    return this.toAppointmentResponse(appointment);
  }

  private async ensureAppointmentExists(id: number): Promise<void> {
    const appointment = await this.findAppointmentByIdUseCase.execute(id);

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada.');
    }
  }

  private toAppointmentResponse(
    appointment: AppointmentEntity,
  ): AppointmentResponse {
    const status = this.toFrontendStatus(appointment.estadoNombre ?? '');

    return {
      id: String(appointment.id),
      patientId: String(appointment.pacienteId),
      patientName: appointment.pacienteName ?? '',
      dentistId: String(appointment.medicoId),
      dentistName: appointment.medicoName ?? '',
      scheduledAt: appointment.fechaHoraInicio.toISOString(),
      reason: appointment.motivoPrincipal ?? '',
      status,
      cancelReason:
        status === 'cancelled' ? (appointment.observaciones ?? null) : null,
      planServicioId: appointment.planServicioId
        ? String(appointment.planServicioId)
        : undefined,
      servicios: appointment.servicios ?? [],
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

  private toPositiveNumber(
    value: string | undefined,
    fallback: number,
  ): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }
}
