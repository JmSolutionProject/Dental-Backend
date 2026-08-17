import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { Roles } from '@auth/presentation/decorators/roles.decorator';
import {
  ConfiguracionService,
  RecordatorioConfig,
} from './configuracion.service';
import { UpdateRecordatorioRequestDto } from './dtos/update-recordatorio.request.dto';

@ApiTags('config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('config')
export class ConfigController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get('recordatorio')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Obtener configuracion de recordatorios de citas' })
  @ApiOkResponse()
  getRecordatorio(): Promise<RecordatorioConfig> {
    return this.configuracionService.getRecordatorio();
  }

  @Put('recordatorio')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar configuracion de recordatorios de citas' })
  @ApiOkResponse()
  updateRecordatorio(
    @Body() payload: UpdateRecordatorioRequestDto,
  ): Promise<RecordatorioConfig> {
    return this.configuracionService.updateRecordatorio({
      enabled: payload.enabled,
      horasAntes: payload.horasAntes,
      plantilla: payload.plantilla,
    });
  }
}
