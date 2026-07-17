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

  async findAll(): Promise<UserWithRoles[]> {
    const users = await this.prisma.usuario.findMany({
      orderBy: { id: 'asc' },
      include: { roles: { include: { rol: true } } },
    });

    return users.map((u) => ({
      id: u.id,
      nombreCompleto: u.nombreCompleto,
      email: u.email,
      estado: u.estado,
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
      if (!role) throw new BadRequestException(`Rol con ID ${roleId} no existe.`);
    }

    const passwordHash = await bcrypt.hash(cmd.password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        nombreCompleto: cmd.nombreCompleto,
        email: cmd.email,
        passwordHash,
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
      roles: user.roles.map((ur) => ({ id: ur.rol.id, nombreRol: ur.rol.nombreRol })),
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

    if (cmd.nombreCompleto !== undefined) data.nombreCompleto = cmd.nombreCompleto;
    if (cmd.email !== undefined) data.email = cmd.email;
    if (cmd.password !== undefined) {
      data.passwordHash = await bcrypt.hash(cmd.password, 10);
    }
    if (cmd.estado !== undefined) data.estado = cmd.estado;

    if (cmd.roleIds !== undefined) {
      await this.prisma.usuarioRol.deleteMany({ where: { usuarioId: id } });

      for (const roleId of cmd.roleIds) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) throw new BadRequestException(`Rol con ID ${roleId} no existe.`);
      }

      await this.prisma.usuarioRol.createMany({
        data: cmd.roleIds.map((roleId) => ({ usuarioId: id, rolId: roleId })),
      });
    }

    await this.prisma.usuario.update({ where: { id }, data });

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
}
