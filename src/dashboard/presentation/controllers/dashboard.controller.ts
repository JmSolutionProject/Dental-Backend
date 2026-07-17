import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { Roles } from '@auth/presentation/decorators/roles.decorator';
import { CurrentUser } from '@auth/presentation/decorators/current-user.decorator';
import { AuthenticatedUser } from '@auth/domain/types/authenticated-user.type';
import { GetDashboardKpisUseCase } from '../../application/use-cases/get-dashboard-kpis.use-case';
import { DashboardKpisResponseDto } from '../dtos/response/dashboard-kpis.response.dto';
import { UnauthorizedException } from '@nestjs/common';

@ApiTags('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardKpisUseCase: GetDashboardKpisUseCase,
  ) {}

  @Get('kpis')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener KPIs del dashboard según el rol del usuario' })
  @ApiOkResponse({ type: DashboardKpisResponseDto })
  async getKpis(
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<DashboardKpisResponseDto> {
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    return this.getDashboardKpisUseCase.execute({
      userId: user.id,
      userRoles: user.roles,
    });
  }
}
