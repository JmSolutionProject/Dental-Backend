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
import { CreatePatientUseCase } from '../../application/use-cases/create-patient.use-case';
import { CreatePatientRequestDto } from '../dtos/request/create-patient.request.dto';
import { ListPatientsRequestDto } from '../dtos/request/list-patients.request.dto';

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

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar pacientes paginados' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async list(@Query() query: ListPatientsRequestDto) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'id';
    const sortDir = query.sortDir ?? 'asc';
    const sortFields: Record<string, Prisma.PacienteOrderByWithRelationInput> = {
      firstName: { nombres: sortDir },
      lastName: { apellidos: sortDir },
      birthDate: { fechaNacimiento: sortDir },
      status: { estado: sortDir },
      id: { id: sortDir },
    };
    const where: Prisma.PacienteWhereInput = search
      ? {
          OR: [
            { nombres: { contains: search, mode: 'insensitive' } },
            { apellidos: { contains: search, mode: 'insensitive' } },
            { telefonoWhatsapp: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.paciente.findMany({
        where,
        orderBy: sortFields[sortBy] ?? sortFields.id,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.paciente.count({ where }),
    ]);

    return {
      data: data.map((patient) => this.toPatientResponse(patient)),
      total,
      page,
      limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de paciente' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findById(@Param('id') id: string): Promise<PatientResponse> {
    const patient = await this.prisma.paciente.findUnique({
      where: { id: Number(id) },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    return this.toPatientResponse(patient);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un paciente' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreatePatientRequestDto) {
    return this.createPatientUseCase.execute(payload);
  }

  private toPatientResponse(patient: {
    id: number;
    nombres: string;
    apellidos: string;
    fechaNacimiento: Date | null;
    telefonoWhatsapp: string | null;
    alergiasCriticas: string | null;
    estado: boolean;
  }): PatientResponse {
    return {
      id: String(patient.id),
      firstName: patient.nombres,
      lastName: patient.apellidos,
      documentNumber: '',
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
