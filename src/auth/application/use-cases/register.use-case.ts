import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterCommand } from '@auth/application/commands/register.command';
import { AuthMapper } from '@auth/application/mappers/auth.mapper';
import { AuthTokenOutput } from '@auth/application/outputs/auth-token.output';
import { AUTH_REPOSITORY } from '@auth/domain/repositories/auth.repository';
import type { AuthRepository } from '@auth/domain/repositories/auth.repository';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
  ) {}

  async execute(payload: RegisterCommand): Promise<AuthTokenOutput> {
    const email = payload.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('El correo ya se encuentra registrado.');
    }

    const requestedRoleNames = payload.roles ?? [];
    const roles =
      await this.authRepository.findActiveRolesByNames(requestedRoleNames);

    if (roles.length !== requestedRoleNames.length) {
      throw new BadRequestException(
        'Uno o mas roles no existen o estan inactivos.',
      );
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.authRepository.createUser({
      nombreCompleto: payload.nombreCompleto.trim(),
      email,
      passwordHash,
      roleNames: roles.map((role) => role.nombreRol),
    });

    const accessToken = await this.jwtService.signAsync(
      this.authMapper.toJwtPayload(user),
    );

    return this.authMapper.toAuthOutput(user, accessToken);
  }
}
