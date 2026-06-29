import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthMapper } from '@auth/application/mappers/auth.mapper';
import { GetProfileUseCase } from '@auth/application/use-cases/get-profile.use-case';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@auth/application/use-cases/register.use-case';
import { AUTH_REPOSITORY } from '@auth/domain/repositories/auth.repository';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { PrismaAuthRepository } from '@auth/infrastructure/persistence/prisma-auth.repository';
import { AuthController } from '@auth/presentation/controllers/auth.controller';
import { PrismaModule } from '@shared/infrastructure/persistence/prisma/prisma.module';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthMapper,
    RegisterUseCase,
    LoginUseCase,
    GetProfileUseCase,
    JwtAuthGuard,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
  ],
})
export class AuthModule {}
