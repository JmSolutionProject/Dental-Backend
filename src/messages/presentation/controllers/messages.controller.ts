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
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { CreateMessageUseCase } from '../../application/use-cases/create-message.use-case';
import { CreateMessageRequestDto } from '../dtos/request/create-message.request.dto';
import { UpdateMessageRequestDto } from '../dtos/request/update-message.request.dto';

@ApiTags('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Listar mensajes' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.mensajeEnvio.findMany({
        orderBy: { fechaHoraProgramada: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          plantilla: true,
          paciente: true,
          cita: true,
          estadoEnvio: true,
        },
      }),
      this.prisma.mensajeEnvio.count(),
    ]);

    return {
      data: data.map((message) => this.toMessageResponse(message)),
      total,
      page,
      limit,
    };
  }

  @Get(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Obtener mensaje por id' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findById(@Param('id') id: string) {
    const message = await this.prisma.mensajeEnvio.findUnique({
      where: { id: Number(id) },
      include: {
        plantilla: true,
        paciente: true,
        cita: true,
        estadoEnvio: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado.');
    }

    return this.toMessageResponse(message);
  }

  @Post()
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Registrar un mensaje' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreateMessageRequestDto) {
    return this.createMessageUseCase.execute(payload);
  }

  @Put(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar mensaje' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateMessageRequestDto,
  ) {
    await this.ensureMessageExists(id);

    await this.prisma.mensajeEnvio.update({
      where: { id: Number(id) },
      data: {
        plantillaId: payload.plantillaId,
        pacienteId: payload.pacienteId,
        citaId: payload.citaId,
        estadoEnvioId: payload.estadoEnvioId,
        fechaHoraProgramada: payload.fechaHoraProgramada
          ? new Date(payload.fechaHoraProgramada)
          : undefined,
        fechaHoraEnvio: payload.fechaHoraEnvio
          ? new Date(payload.fechaHoraEnvio)
          : undefined,
        errorDetalle: payload.errorDetalle,
      },
    });

    return this.findById(id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Eliminar mensaje' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('id') id: string) {
    await this.ensureMessageExists(id);

    return this.prisma.mensajeEnvio.delete({ where: { id: Number(id) } });
  }

  private async ensureMessageExists(id: string): Promise<void> {
    const message = await this.prisma.mensajeEnvio.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado.');
    }
  }

  private toMessageResponse(message: {
    id: number;
    plantillaId: number;
    pacienteId: number;
    citaId: number | null;
    estadoEnvioId: number;
    fechaHoraProgramada: Date;
    fechaHoraEnvio: Date | null;
    errorDetalle: string | null;
    plantilla: {
      nombrePlantilla: string;
      tipoMensaje: string;
      contenido: string;
    };
    paciente: { nombres: string; apellidos: string };
    estadoEnvio: { nombreEstado: string };
  }) {
    return {
      id: String(message.id),
      templateId: String(message.plantillaId),
      templateName: message.plantilla.nombrePlantilla,
      messageType: message.plantilla.tipoMensaje,
      patientId: String(message.pacienteId),
      patientName: `${message.paciente.nombres} ${message.paciente.apellidos}`,
      appointmentId: message.citaId ? String(message.citaId) : null,
      statusId: String(message.estadoEnvioId),
      status: message.estadoEnvio.nombreEstado,
      content: message.plantilla.contenido,
      scheduledAt: message.fechaHoraProgramada.toISOString(),
      sentAt: message.fechaHoraEnvio?.toISOString() ?? null,
      error: message.errorDetalle,
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
