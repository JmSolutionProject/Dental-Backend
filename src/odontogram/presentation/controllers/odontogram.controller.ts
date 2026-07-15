import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
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
import { RegisterOdontogramDetailRequestDto } from '../dtos/request/register-odontogram-detail.request.dto';
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
  constructor(
    private readonly listDentalPiecesUseCase: ListDentalPiecesUseCase,
    private readonly listDentalSurfacesUseCase: ListDentalSurfacesUseCase,
    private readonly listToothStatesUseCase: ListToothStatesUseCase,
    private readonly registerOdontogramDetailUseCase: RegisterOdontogramDetailUseCase,
  ) {}

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

  @Post('details')
  @ApiOperation({
    summary: 'Registra un detalle dentro del odontograma del paciente.',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OdontogramDetailResponseDto })
  registerDetail(@Body() payload: RegisterOdontogramDetailRequestDto) {
    return this.registerOdontogramDetailUseCase.execute(payload);
  }
}

@ApiTags('Odontograms')
@UseGuards(JwtAuthGuard)
@Controller('odontograms')
export class PatientOdontogramsController {
  constructor(private readonly prisma: PrismaService) {}

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
}
