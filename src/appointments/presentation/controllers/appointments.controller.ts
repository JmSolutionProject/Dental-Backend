import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { AppointmentAvailabilityRequestDto } from '../dtos/request/appointment-availability.request.dto';
import { CreateAppointmentRequestDto } from '../dtos/request/create-appointment.request.dto';

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
  async list(): Promise<AppointmentResponse[]> {
    const appointments = await this.prisma.cita.findMany({
      orderBy: { fechaHoraInicio: 'asc' },
      include: {
        paciente: true,
        medico: true,
        estadoCita: true,
      },
    });

    return appointments.map((appointment) =>
      this.toAppointmentResponse(appointment),
    );
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
      cancelReason: this.toFrontendStatus(appointment.estadoCita.nombreEstado) === 'cancelled'
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
