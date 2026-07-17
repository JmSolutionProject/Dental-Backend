import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthMapper } from '@auth/application/mappers/auth.mapper';
import { GetProfileUseCase } from '@auth/application/use-cases/get-profile.use-case';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@auth/application/use-cases/register.use-case';
import { RolCreateUseCase } from '@auth/application/use-cases/rol/rol-create.use-case';
import { RolListUseCase } from '@auth/application/use-cases/rol/rol-list.use-case';
import { AUTH_REPOSITORY } from '@auth/domain/repositories/auth.repository';
import { ROL_REPOSITORY } from '@auth/domain/repositories/rol_auth.repository';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { PrismaAuthRepository } from '@auth/infrastructure/persistence/prisma-auth.repository';
import { PrismaRol } from '@auth/infrastructure/persistence/prisma-rol.repository';
import { AuthController } from '@auth/presentation/controllers/auth.controller';
import { RolesController } from '@auth/presentation/controllers/roles.controller';
import { AuthPresentationMapper } from '@auth/presentation/mappers/auth-presentation.mapper';
import { RolPresentationMapper } from '@auth/presentation/mappers/rol-presentation.mapper';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController, RolesController],
  providers: [
    AuthMapper,
    AuthPresentationMapper,
    RolPresentationMapper,
    RegisterUseCase,
    LoginUseCase,
    GetProfileUseCase,
    RolCreateUseCase,
    RolListUseCase,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
    {
      provide: ROL_REPOSITORY,
      useClass: PrismaRol,
    },
  ],
})
export class AuthModule {}
