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
import { CreatePatientUseCase } from '../../application/use-cases/create-patient.use-case';
import { FindAllPatientsUseCase } from '../../application/use-cases/find-all-patients.use-case';
import { FindPatientByIdUseCase } from '../../application/use-cases/find-patient-by-id.use-case';
import { SoftDeletePatientUseCase } from '../../application/use-cases/soft-delete-patient.use-case';
import { UpdatePatientUseCase } from '../../application/use-cases/update-patient.use-case';
import { PatientEntity } from '../../domain/entities/patient.entity';
import { CreatePatientRequestDto } from '../dtos/request/create-patient.request.dto';
import { ListPatientsRequestDto } from '../dtos/request/list-patients.request.dto';
import { UpdatePatientRequestDto } from '../dtos/request/update-patient.request.dto';

type PatientResponse = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone: string;
  email: string;
  birthDate: string | null;
  status: 'active' | 'inactive';
  medicalHistory: {
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
  notes: string;
};

interface ReniecApiResponse {
  nombres?: string;
  nombre?: string;
  apellidoPaterno?: string;
  paterno?: string;
  apellidoMaterno?: string;
  materno?: string;
  apellidos?: string;
}

@ApiTags('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly findAllPatientsUseCase: FindAllPatientsUseCase,
    private readonly findPatientByIdUseCase: FindPatientByIdUseCase,
    private readonly updatePatientUseCase: UpdatePatientUseCase,
    private readonly softDeletePatientUseCase: SoftDeletePatientUseCase,
  ) {}

  @Get('reniec/:dni')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiOperation({ summary: 'Consultar datos de RENIEC por DNI' })
  @ApiBearerAuth()
  async lookupReniec(@Param('dni') dni: string) {
    const cleanDni = dni?.trim();
    if (!cleanDni || !/^\d{8}$/.test(cleanDni)) {
      return {
        success: false,
        message: 'El DNI debe tener 8 digitos numericos.',
      };
    }

    const apis = [
      `https://api.apis.net.pe/v1/dni?numero=${cleanDni}`,
      `https://apiperu.dev/api/dni/${cleanDni}`,
      `https://dniruc.apisperu.com/api/v1/dni/${cleanDni}`,
      `https://api.apis.net.pe/v2/reniec/dni?numero=${cleanDni}`,
    ];

    for (const url of apis) {
      try {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const json = (await response.json()) as {
            data?: ReniecApiResponse;
          } & ReniecApiResponse;
          const resData = json.data ?? json;
          const nombres = (resData.nombres ?? resData.nombre ?? '').trim();
          const apellidoPaterno = (
            resData.apellidoPaterno ??
            resData.paterno ??
            ''
          ).trim();
          const apellidoMaterno = (
            resData.apellidoMaterno ??
            resData.materno ??
            ''
          ).trim();
          const apellidos = (
            resData.apellidos ?? `${apellidoPaterno} ${apellidoMaterno}`
          ).trim();

          if (nombres || apellidos) {
            return {
              success: true,
              data: {
                nombres,
                apellidoPaterno,
                apellidoMaterno,
                apellidos,
              },
            };
          }
        }
      } catch {
        // Try next endpoint
      }
    }

    return {
      success: false,
      message: 'No se encontro informacion para este numero de DNI.',
    };
  }

  @Get()
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiOperation({ summary: 'Listar pacientes paginados' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: ListPatientsRequestDto) {
    const requestedPage = Number(query.page ?? 1);
    const requestedLimit = Number(query.limit ?? 10);
    const page = Number.isFinite(requestedPage)
      ? Math.max(requestedPage, 1)
      : 1;
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 10;

    const result = await this.findAllPatientsUseCase.execute({
      page,
      limit,
      search: query.search?.trim(),
      sortBy: query.sortBy ?? 'id',
      sortDir: query.sortDir ?? 'asc',
    });

    return {
      data: result.data.map((patient) => this.toPatientResponse(patient)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiOperation({ summary: 'Ver detalle de paciente' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findById(@Param('id') id: string): Promise<PatientResponse> {
    const patient = await this.findPatientByIdUseCase.execute(Number(id));

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    return this.toPatientResponse(patient);
  }

  @Post()
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Crear un paciente' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  async create(
    @Body() payload: CreatePatientRequestDto,
  ): Promise<PatientResponse> {
    const patient = await this.createPatientUseCase.execute({
      nombres: payload.nombres,
      apellidos: payload.apellidos,
      fechaNacimiento: payload.fechaNacimiento,
      numeroDocumento: payload.numeroDocumento,
      telefonoWhatsapp: payload.telefonoWhatsapp,
      alergiasCriticas: payload.alergiasCriticas,
    });

    return this.toPatientResponse(patient);
  }

  @Put(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar datos del paciente' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdatePatientRequestDto,
  ): Promise<PatientResponse> {
    await this.ensurePatientExists(Number(id));

    const patient = await this.updatePatientUseCase.execute(Number(id), {
      nombres: payload.nombres,
      apellidos: payload.apellidos,
      fechaNacimiento: payload.fechaNacimiento,
      numeroDocumento: payload.numeroDocumento,
      telefonoWhatsapp: payload.telefonoWhatsapp,
      alergiasCriticas: payload.alergiasCriticas,
      estado: payload.estado,
    });

    return this.toPatientResponse(patient);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Eliminar paciente' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('id') id: string): Promise<PatientResponse> {
    await this.ensurePatientExists(Number(id));

    const patient = await this.softDeletePatientUseCase.execute(Number(id));

    return this.toPatientResponse(patient);
  }

  private async ensurePatientExists(id: number): Promise<void> {
    const patient = await this.findPatientByIdUseCase.execute(id);

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }
  }

  private toPatientResponse(patient: PatientEntity): PatientResponse {
    return {
      id: String(patient.id),
      firstName: patient.nombres,
      lastName: patient.apellidos,
      documentNumber: patient.numeroDocumento ?? '',
      phone: patient.telefonoWhatsapp ?? '',
      email: '',
      birthDate: patient.fechaNacimiento?.toISOString().slice(0, 10) ?? null,
      status: patient.estado ? 'active' : 'inactive',
      medicalHistory: {
        allergies: patient.alergiasCriticas ? [patient.alergiasCriticas] : [],
        conditions: [],
        medications: [],
      },
      notes: '',
    };
  }
}
