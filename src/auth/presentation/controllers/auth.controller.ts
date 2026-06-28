import { Controller } from '@nestjs/common';
import { CreateAuthUseCase } from '../../application/use-cases/create-auth.use-case';

@Controller('auth')
export class AuthController {
  constructor(private readonly createAuthUseCase: CreateAuthUseCase) {}
}
