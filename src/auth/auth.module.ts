import { Module } from '@nestjs/common';
import { CreateAuthUseCase } from './application/use-cases/create-auth.use-case';
import { AUTH_REPOSITORY } from './domain/repositories/auth.repository';
import { InMemoryAuthRepository } from './infrastructure/persistence/in-memory-auth.repository';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    CreateAuthUseCase,
    {
      provide: AUTH_REPOSITORY,
      useClass: InMemoryAuthRepository,
    },
  ],
})
export class AuthModule {}
