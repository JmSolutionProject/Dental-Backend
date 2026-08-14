import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import {
  UserWithRoles,
  CreateUserCommand,
  UpdateUserCommand,
} from '../../domain/types/user.types';

@Injectable()
export class ManageUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(roleName?: string): Promise<UserWithRoles[]> {
    const where: Record<string, unknown> = { estado: true };
    if (roleName) {
      where.roles = { some: { rol: { nombreRol: roleName, estado: true } } };
    }
    const users = await this.prisma.usuario.findMany({
      where,
      orderBy: { id: 'asc' },
      include: { roles: { include: { rol: true } } },
    });

    return users.map((u) => ({
      id: u.id,
      nombreCompleto: u.nombreCompleto,
      email: u.email,
      estado: u.estado,
      porcentajeComision: Number(u.porcentajeComision ?? 0),
      roles: u.roles
        .filter((ur) => ur.rol.estado)
        .map((ur) => ({ id: ur.rol.id, nombreRol: ur.rol.nombreRol })),
      fechaRegistro: u.fechaRegistro.toISOString(),
    }));
  }

  async findById(id: number): Promise<UserWithRoles> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: { roles: { include: { rol: true } } },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    return {
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      estado: user.estado,
      porcentajeComision: Number(user.porcentajeComision ?? 0),
      roles: user.roles
        .filter((ur) => ur.rol.estado)
        .map((ur) => ({ id: ur.rol.id, nombreRol: ur.rol.nombreRol })),
      fechaRegistro: user.fechaRegistro.toISOString(),
    };
  }

  async create(cmd: CreateUserCommand): Promise<UserWithRoles> {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: cmd.email },
    });
    if (existing) throw new ConflictException('El email ya está registrado.');

    for (const roleId of cmd.roleIds) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (!role)
        throw new BadRequestException(`Rol con ID ${roleId} no existe.`);
    }

    const passwordHash = await bcrypt.hash(cmd.password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        nombreCompleto: cmd.nombreCompleto,
        email: cmd.email,
        passwordHash,
        porcentajeComision: cmd.porcentajeComision ?? 0,
        estado: true,
        roles: { create: cmd.roleIds.map((roleId) => ({ rolId: roleId })) },
      },
      include: { roles: { include: { rol: true } } },
    });

    return {
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      estado: user.estado,
      porcentajeComision: Number(user.porcentajeComision ?? 0),
      roles: user.roles.map((ur) => ({
        id: ur.rol.id,
        nombreRol: ur.rol.nombreRol,
      })),
      fechaRegistro: user.fechaRegistro.toISOString(),
    };
  }

  async update(id: number, cmd: UpdateUserCommand): Promise<UserWithRoles> {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    if (cmd.email && cmd.email !== user.email) {
      const existing = await this.prisma.usuario.findUnique({
        where: { email: cmd.email },
      });
      if (existing) throw new ConflictException('El email ya está en uso.');
    }

    const data: Record<string, unknown> = {};

    if (cmd.nombreCompleto !== undefined)
      data.nombreCompleto = cmd.nombreCompleto;
    if (cmd.email !== undefined) data.email = cmd.email;
    if (cmd.password !== undefined && cmd.password !== '') {
      data.passwordHash = await bcrypt.hash(cmd.password, 10);
    }
    if (cmd.estado !== undefined) data.estado = cmd.estado;
    if (cmd.porcentajeComision !== undefined)
      data.porcentajeComision = cmd.porcentajeComision;

    if (cmd.roleIds !== undefined) {
      await this.prisma.usuarioRol.deleteMany({ where: { usuarioId: id } });

      for (const roleId of cmd.roleIds) {
        const role = await this.prisma.role.findUnique({
          where: { id: roleId },
        });
        if (!role)
          throw new BadRequestException(`Rol con ID ${roleId} no existe.`);
      }

      await this.prisma.usuarioRol.createMany({
        data: cmd.roleIds.map((roleId) => ({ usuarioId: id, rolId: roleId })),
      });
    }

    await this.prisma.usuario.update({ where: { id }, data });

    return this.findById(id);
  }

  async changePassword(id: number, password: string): Promise<UserWithRoles> {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    await this.prisma.usuario.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, 10) },
    });

    return this.findById(id);
  }

  async remove(id: number): Promise<UserWithRoles> {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    await this.prisma.usuario.update({
      where: { id },
      data: { estado: false },
    });

    return this.findById(id);
  }

  async deletePermanent(id: number): Promise<{ id: number; deleted: boolean }> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: { roles: { include: { rol: true } } },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const isAdmin = user.roles.some(
      (ur) => ur.rol.estado && ur.rol.nombreRol.toUpperCase() === 'ADMIN',
    );
    if (isAdmin) {
      const adminCount = await this.prisma.usuario.count({
        where: {
          estado: true,
          roles: { some: { rol: { nombreRol: 'ADMIN', estado: true } } },
        },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          'No se puede eliminar el último administrador.',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.pago.deleteMany({ where: { usuarioCobradorId: id } });
      await tx.pago.deleteMany({ where: { cita: { medicoId: id } } });
      await tx.citaServicio.deleteMany({ where: { cita: { medicoId: id } } });
      await tx.planTratamientoServicio.deleteMany({
        where: { plan: { medicoId: id } },
      });
      await tx.planTratamiento.deleteMany({ where: { medicoId: id } });
      await tx.campanaPaciente.deleteMany({
        where: { campana: { usuarioCreadorId: id } },
      });
      await tx.campanaWhatsapp.deleteMany({ where: { usuarioCreadorId: id } });
      await tx.cita.deleteMany({ where: { medicoId: id } });
      await tx.usuarioRol.deleteMany({ where: { usuarioId: id } });
      await tx.usuario.delete({ where: { id } });
    });

    return { id, deleted: true };
  }
}
