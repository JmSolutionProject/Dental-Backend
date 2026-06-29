import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthMapper } from '@auth/application/mappers/auth.mapper';
import { AUTH_REPOSITORY } from '@auth/domain/repositories/auth.repository';
import type { AuthRepository } from '@auth/domain/repositories/auth.repository';
import { LoginRequestDto } from '@auth/presentation/dtos/request/login.request.dto';
import { AuthTokenResponseDto } from '@auth/presentation/dtos/response/auth-token.response.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
  ) {}

  async execute(payload: LoginRequestDto): Promise<AuthTokenResponseDto> {
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

    return this.authMapper.toAuthResponse(user, accessToken);
  }
}
