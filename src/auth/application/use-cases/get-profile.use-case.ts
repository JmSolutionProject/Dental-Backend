import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthMapper } from '@auth/application/mappers/auth.mapper';
import { AuthUserOutput } from '@auth/application/outputs/auth-user.output';
import { AUTH_REPOSITORY } from '@auth/domain/repositories/auth.repository';
import type { AuthRepository } from '@auth/domain/repositories/auth.repository';
import { AuthenticatedUser } from '@auth/domain/types/authenticated-user.type';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly authMapper: AuthMapper,
  ) {}

  async execute(currentUser: AuthenticatedUser): Promise<AuthUserOutput> {
    const user = await this.authRepository.findById(currentUser.id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return this.authMapper.toUserOutput(user);
  }
}
