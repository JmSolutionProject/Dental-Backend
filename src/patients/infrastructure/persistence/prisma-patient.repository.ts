import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { PatientEntity } from '../../domain/entities/patient.entity';
import {
  CreatePatientParams,
  FindAllPatientsParams,
  PaginatedPatientsResult,
  PatientRepository,
  UpdatePatientParams,
} from '../../domain/repositories/patient.repository';

@Injectable()
export class PrismaPatientRepository implements PatientRepository {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.paciente.count();
  }

  async findAll(
    params: FindAllPatientsParams,
  ): Promise<PaginatedPatientsResult> {
    const { page, limit, search, sortBy, sortDir } = params;
    const sortFields: Record<string, Prisma.PacienteOrderByWithRelationInput> =
      {
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
        orderBy:
          sortBy && sortFields[sortBy] ? sortFields[sortBy] : sortFields.id,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.paciente.count({ where }),
    ]);

    return {
      data: data.map((patient) => this.toEntity(patient)),
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<PatientEntity | null> {
    const patient = await this.prisma.paciente.findUnique({
      where: { id },
    });

    return patient ? this.toEntity(patient) : null;
  }

  async create(patient: CreatePatientParams): Promise<PatientEntity> {
    const created = await this.prisma.paciente.create({
      data: {
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        fechaNacimiento: patient.fechaNacimiento
          ? new Date(patient.fechaNacimiento)
          : null,
        numeroDocumento: patient.numeroDocumento ?? null,
        telefonoWhatsapp: patient.telefonoWhatsapp ?? null,
        alergiasCriticas: patient.alergiasCriticas ?? null,
        estado: true,
      },
    });

    return this.toEntity(created);
  }

  async update(
    id: number,
    patient: UpdatePatientParams,
  ): Promise<PatientEntity> {
    const updated = await this.prisma.paciente.update({
      where: { id },
      data: {
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        fechaNacimiento:
          patient.fechaNacimiento !== undefined
            ? patient.fechaNacimiento
              ? new Date(patient.fechaNacimiento)
              : null
            : undefined,
        numeroDocumento: patient.numeroDocumento,
        telefonoWhatsapp: patient.telefonoWhatsapp,
        alergiasCriticas: patient.alergiasCriticas,
      },
    });

    return this.toEntity(updated);
  }

  async softDelete(id: number): Promise<PatientEntity> {
    const deleted = await this.prisma.paciente.update({
      where: { id },
      data: { estado: false },
    });

    return this.toEntity(deleted);
  }

  private toEntity(
    patient: Prisma.PacienteGetPayload<Record<string, never>>,
  ): PatientEntity {
    return new PatientEntity({
      id: patient.id,
      nombres: patient.nombres,
      apellidos: patient.apellidos,
      numeroDocumento: patient.numeroDocumento,
      fechaNacimiento: patient.fechaNacimiento,
      telefonoWhatsapp: patient.telefonoWhatsapp,
      alergiasCriticas: patient.alergiasCriticas,
      fechaRegistro: patient.fechaRegistro,
      estado: patient.estado,
    });
  }
}
