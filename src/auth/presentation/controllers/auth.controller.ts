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
import { AuthPresentationMapper } from '@auth/presentation/mappers/auth-presentation.mapper';
import { LoginRequestDto } from '@auth/presentation/dtos/request/login.request.dto';
import { RegisterRequestDto } from '@auth/presentation/dtos/request/register.request.dto';
import { AuthTokenResponseDto } from '@auth/presentation/dtos/response/auth-token.response.dto';
import { AuthUserResponseDto } from '@auth/presentation/dtos/response/auth-user.response.dto';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly authPresentationMapper: AuthPresentationMapper,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario del sistema' })
  @ApiCreatedResponse({ type: AuthTokenResponseDto })
  async register(
    @Body() payload: RegisterRequestDto,
  ): Promise<AuthTokenResponseDto> {
    const output = await this.registerUseCase.execute(
      this.authPresentationMapper.toRegisterCommand(payload),
    );

    return this.authPresentationMapper.toAuthTokenResponse(output);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesion' })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  async login(@Body() payload: LoginRequestDto): Promise<AuthTokenResponseDto> {
    const output = await this.loginUseCase.execute(
      this.authPresentationMapper.toLoginCommand(payload),
    );

    return this.authPresentationMapper.toAuthTokenResponse(output);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  async profile(
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
  ): Promise<AuthUserResponseDto> {
    if (!currentUser) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    const output = await this.getProfileUseCase.execute(currentUser);

    return this.authPresentationMapper.toAuthUserResponse(output);
  }
}
