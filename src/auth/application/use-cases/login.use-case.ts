import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginCommand } from '@auth/application/commands/login.command';
import { AuthMapper } from '@auth/application/mappers/auth.mapper';
import { AuthTokenOutput } from '@auth/application/outputs/auth-token.output';
import { AUTH_REPOSITORY } from '@auth/domain/repositories/auth.repository';
import type { AuthRepository } from '@auth/domain/repositories/auth.repository';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
  ) {}

  async execute(payload: LoginCommand): Promise<AuthTokenOutput> {
    const user = await this.authRepository.findByEmail(
      payload.email.trim().toLowerCase(),
    );

    if (!user || !user.estado) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passwordMatches = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const accessToken = await this.jwtService.signAsync(
      this.authMapper.toJwtPayload(user),
    );

    return this.authMapper.toAuthOutput(user, accessToken);
  }
}
