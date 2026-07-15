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
import { ListDentalPiecesUseCase } from '../../application/use-cases/list-dental-pieces.use-case';
import { ListDentalSurfacesUseCase } from '../../application/use-cases/list-dental-surfaces.use-case';
import { ListToothStatesUseCase } from '../../application/use-cases/list-tooth-states.use-case';
import { RegisterOdontogramDetailUseCase } from '../../application/use-cases/register-odontogram-detail.use-case';
import { CreatePatientOdontogramRequestDto } from '../dtos/request/create-patient-odontogram.request.dto';
import { RegisterOdontogramDetailRequestDto } from '../dtos/request/register-odontogram-detail.request.dto';
import { UpdateOdontogramDetailRequestDto } from '../dtos/request/update-odontogram-detail.request.dto';
import { UpdatePatientOdontogramRequestDto } from '../dtos/request/update-patient-odontogram.request.dto';
import {
  DentalPieceResponseDto,
  DentalSurfaceResponseDto,
  ToothStateResponseDto,
} from '../dtos/response/dental-piece.response.dto';
import { OdontogramDetailResponseDto } from '../dtos/response/odontogram-detail.response.dto';

type PatientOdontogram = {
  patientId: string;
  quadrant: 'adult';
  teeth: Array<{
    fdiNumber: number;
    condition: string;
    notes: string;
  }>;
};

type OdontogramWithDetails = Prisma.OdontogramaGetPayload<{
  include: {
    detalles: {
      include: {
        piezaDental: true;
        estadoPieza: true;
      };
    };
  };
}>;

@ApiTags('Odontogram')
@UseGuards(JwtAuthGuard)
@Controller('odontogram')
export class OdontogramController {
  @Get('teeth')
  @ApiOperation({ summary: 'Lista el catalogo base de piezas dentales.' })
  @ApiOkResponse({ type: DentalPieceResponseDto, isArray: true })
  @ApiBearerAuth()
  listTeeth() {
    return this.listDentalPiecesUseCase.execute();
  }

  @Get('surfaces')
  @ApiOperation({ summary: 'Lista las superficies dentales disponibles.' })
  @ApiOkResponse({ type: DentalSurfaceResponseDto, isArray: true })
  @ApiBearerAuth()
  listSurfaces() {
    return this.listDentalSurfacesUseCase.execute();
  }

  @Get('states')
  @ApiOperation({
    summary: 'Lista los estados clinicos disponibles para una pieza dental.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ToothStateResponseDto, isArray: true })
  listStates() {
    return this.listToothStatesUseCase.execute();
  }

  @Get('details')
  @ApiOperation({ summary: 'Listar detalles de odontograma' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async listDetails(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.odontogramaDetalle.findMany({
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          piezaDental: true,
          superficie: true,
          estadoPieza: true,
          odontograma: true,
        },
      }),
      this.prisma.odontogramaDetalle.count(),
    ]);

    return {
      data: data.map((detail) => this.toDetailResponse(detail)),
      total,
      page,
      limit,
    };
  }

  @Get('details/:id')
  @ApiOperation({ summary: 'Obtener detalle de odontograma por id' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findDetailById(@Param('id') id: string) {
    const detail = await this.prisma.odontogramaDetalle.findUnique({
      where: { id: Number(id) },
      include: {
        piezaDental: true,
        superficie: true,
        estadoPieza: true,
        odontograma: true,
      },
    });

    if (!detail) {
      throw new NotFoundException('Detalle de odontograma no encontrado.');
    }

    return this.toDetailResponse(detail);
  }

  @Post('details')
  @ApiOperation({
    summary: 'Registra un detalle dentro del odontograma del paciente.',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OdontogramDetailResponseDto })
  registerDetail(@Body() payload: RegisterOdontogramDetailRequestDto) {
    return this.registerOdontogramDetailUseCase.execute(payload);
  }

  @Put('details/:id')
  @ApiOperation({ summary: 'Actualizar detalle de odontograma' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async updateDetail(
    @Param('id') id: string,
    @Body() payload: UpdateOdontogramDetailRequestDto,
  ) {
    await this.ensureDetailExists(id);

    await this.prisma.odontogramaDetalle.update({
      where: { id: Number(id) },
      data: {
        odontogramaId: payload.odontogramaId,
        piezaDentalId: payload.piezaDentalId,
        superficieId: payload.superficieId,
        estadoPiezaId: payload.estadoPiezaId,
        diagnostico: payload.diagnostico,
        tratamientoRecomendado: payload.tratamientoRecomendado,
        observacion: payload.observacion,
      },
    });

    return this.findDetailById(id);
  }

  @Delete('details/:id')
  @ApiOperation({ summary: 'Eliminar detalle de odontograma' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async removeDetail(@Param('id') id: string) {
    await this.ensureDetailExists(id);

    return this.prisma.odontogramaDetalle.delete({ where: { id: Number(id) } });
  }

  constructor(
    private readonly listDentalPiecesUseCase: ListDentalPiecesUseCase,
    private readonly listDentalSurfacesUseCase: ListDentalSurfacesUseCase,
    private readonly listToothStatesUseCase: ListToothStatesUseCase,
    private readonly registerOdontogramDetailUseCase: RegisterOdontogramDetailUseCase,
    private readonly prisma: PrismaService,
  ) {}

  private async ensureDetailExists(id: string): Promise<void> {
    const detail = await this.prisma.odontogramaDetalle.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!detail) {
      throw new NotFoundException('Detalle de odontograma no encontrado.');
    }
  }

  private toDetailResponse(detail: {
    id: number;
    odontogramaId: number;
    piezaDentalId: number;
    superficieId: number | null;
    estadoPiezaId: number;
    diagnostico: string | null;
    tratamientoRecomendado: string | null;
    observacion: string | null;
    piezaDental: { codigoFdi: string; nombrePieza: string };
    superficie: { nombreSuperficie: string } | null;
    estadoPieza: { nombreEstado: string };
  }) {
    return {
      id: String(detail.id),
      odontogramId: String(detail.odontogramaId),
      dentalPieceId: String(detail.piezaDentalId),
      fdiNumber: Number(detail.piezaDental.codigoFdi),
      dentalPieceName: detail.piezaDental.nombrePieza,
      surfaceId: detail.superficieId ? String(detail.superficieId) : null,
      surfaceName: detail.superficie?.nombreSuperficie ?? null,
      stateId: String(detail.estadoPiezaId),
      stateName: detail.estadoPieza.nombreEstado,
      diagnosis: detail.diagnostico,
      recommendedTreatment: detail.tratamientoRecomendado,
      notes: detail.observacion,
    };
  }

  private toPositiveNumber(value: string | undefined, fallback: number): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }
}

@ApiTags('Odontograms')
@UseGuards(JwtAuthGuard)
@Controller('odontograms')
export class PatientOdontogramsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar odontogramas paginados' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.odontograma.findMany({
        orderBy: { fechaRegistro: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          detalles: {
            include: {
              piezaDental: true,
              estadoPieza: true,
            },
          },
        },
      }),
      this.prisma.odontograma.count(),
    ]);

    return {
      data: data.map((odontogram) =>
        this.toPatientOdontogram(String(odontogram.pacienteId), odontogram),
      ),
      total,
      page,
      limit,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear odontograma de paciente' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  async create(@Body() payload: CreatePatientOdontogramRequestDto) {
    if (!payload.patientId) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    await this.ensurePatientExists(String(payload.patientId));

    const odontogram = await this.prisma.odontograma.create({
      data: {
        pacienteId: payload.patientId,
        citaId: payload.citaId,
        observacionGeneral: payload.notes,
      },
      include: {
        detalles: {
          include: {
            piezaDental: true,
            estadoPieza: true,
          },
        },
      },
    });

    return this.toPatientOdontogram(String(payload.patientId), odontogram);
  }

  @Get(':patientId')
  @ApiOperation({ summary: 'Obtener odontograma completo del paciente' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<PatientOdontogram> {
    await this.ensurePatientExists(patientId);

    const odontogram = await this.findLatestPatientOdontogram(patientId);

    if (!odontogram) {
      return {
        patientId,
        quadrant: 'adult',
        teeth: [],
      };
    }

    return this.toPatientOdontogram(patientId, odontogram);
  }

  @Put(':patientId')
  @ApiOperation({ summary: 'Actualizar una pieza dental del paciente' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async updateTooth(
    @Param('patientId') patientId: string,
    @Body() payload: UpdatePatientOdontogramRequestDto,
  ): Promise<PatientOdontogram> {
    await this.ensurePatientExists(patientId);

    const piece = await this.prisma.piezaDental.findUnique({
      where: { codigoFdi: String(payload.fdiNumber) },
    });

    if (!piece) {
      throw new NotFoundException('Pieza dental no encontrada.');
    }

    const state = await this.resolveToothState(payload.condition);
    const odontogram = await this.resolvePatientOdontogram(patientId);
    const existingDetail = await this.prisma.odontogramaDetalle.findFirst({
      where: {
        odontogramaId: odontogram.id,
        piezaDentalId: piece.id,
      },
    });

    if (existingDetail) {
      await this.prisma.odontogramaDetalle.update({
        where: { id: existingDetail.id },
        data: {
          estadoPiezaId: state.id,
          observacion: payload.notes,
          diagnostico: payload.condition,
        },
      });
    } else {
      await this.prisma.odontogramaDetalle.create({
        data: {
          odontogramaId: odontogram.id,
          piezaDentalId: piece.id,
          estadoPiezaId: state.id,
          observacion: payload.notes,
          diagnostico: payload.condition,
        },
      });
    }

    const updated = await this.findLatestPatientOdontogram(patientId);

    return this.toPatientOdontogram(patientId, updated!);
  }

  @Delete(':patientId')
  @ApiOperation({ summary: 'Eliminar odontogramas de un paciente' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('patientId') patientId: string) {
    await this.ensurePatientExists(patientId);
    const odontograms = await this.prisma.odontograma.findMany({
      where: { pacienteId: Number(patientId) },
      select: { id: true },
    });
    const ids = odontograms.map((odontogram) => odontogram.id);

    await this.prisma.odontogramaDetalle.deleteMany({
      where: { odontogramaId: { in: ids } },
    });
    await this.prisma.odontograma.deleteMany({
      where: { id: { in: ids } },
    });

    return { patientId, deleted: ids.length };
  }

  private async ensurePatientExists(patientId: string): Promise<void> {
    const patient = await this.prisma.paciente.findUnique({
      where: { id: Number(patientId) },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }
  }

  private findLatestPatientOdontogram(
    patientId: string,
  ): Promise<OdontogramWithDetails | null> {
    return this.prisma.odontograma.findFirst({
      where: { pacienteId: Number(patientId) },
      orderBy: { fechaRegistro: 'desc' },
      include: {
        detalles: {
          include: {
            piezaDental: true,
            estadoPieza: true,
          },
        },
      },
    });
  }

  private async resolvePatientOdontogram(patientId: string) {
    const existing = await this.prisma.odontograma.findFirst({
      where: { pacienteId: Number(patientId) },
      orderBy: { fechaRegistro: 'desc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.odontograma.create({
      data: { pacienteId: Number(patientId) },
    });
  }

  private async resolveToothState(condition: string) {
    const existing = await this.prisma.estadoPiezaDental.findFirst({
      where: { nombreEstado: { equals: condition, mode: 'insensitive' } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.estadoPiezaDental.create({
      data: { nombreEstado: condition },
    });
  }

  private toPatientOdontogram(
    patientId: string,
    odontogram: OdontogramWithDetails,
  ): PatientOdontogram {
    return {
      patientId,
      quadrant: 'adult',
      teeth: odontogram.detalles.map((detail) => ({
        fdiNumber: Number(detail.piezaDental.codigoFdi),
        condition: detail.diagnostico ?? detail.estadoPieza.nombreEstado,
        notes: detail.observacion ?? '',
      })),
    };
  }

  private toPositiveNumber(value: string | undefined, fallback: number): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }
}
