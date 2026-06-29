import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetProfileUseCase } from '@auth/application/use-cases/get-profile.use-case';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@auth/application/use-cases/register.use-case';
import { AuthenticatedUser } from '@auth/domain/types/authenticated-user.type';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginRequestDto } from '@auth/presentation/dtos/request/login.request.dto';
import { RegisterRequestDto } from '@auth/presentation/dtos/request/register.request.dto';
import { AuthTokenResponseDto } from '@auth/presentation/dtos/response/auth-token.response.dto';
import { AuthUserResponseDto } from '@auth/presentation/dtos/response/auth-user.response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario del sistema' })
  @ApiCreatedResponse({ type: AuthTokenResponseDto })
  register(@Body() payload: RegisterRequestDto): Promise<AuthTokenResponseDto> {
    return this.registerUseCase.execute(payload);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesion' })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  login(@Body() payload: LoginRequestDto): Promise<AuthTokenResponseDto> {
    return this.loginUseCase.execute(payload);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  profile(
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
  ): Promise<AuthUserResponseDto> {
    if (!currentUser) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    return this.getProfileUseCase.execute(currentUser);
  }
}
