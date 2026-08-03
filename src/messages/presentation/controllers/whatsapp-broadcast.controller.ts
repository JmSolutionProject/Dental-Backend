import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { Roles } from '@auth/presentation/decorators/roles.decorator';
import { CurrentUser } from '@auth/presentation/decorators/current-user.decorator';
import type { JwtPayload } from '@auth/domain/types/jwt-payload.type';
import { WhatsappBroadcastService } from '@messages/application/services/whatsapp-broadcast.service';
import { CreateWhatsappBroadcastCampaignRequestDto } from '../dtos/request/create-whatsapp-broadcast-campaign.request.dto';

@ApiTags('whatsapp-broadcast')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('whatsapp/broadcast/campaigns')
export class WhatsappBroadcastController {
  constructor(
    private readonly whatsappBroadcastService: WhatsappBroadcastService,
  ) {}

  @Post()
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Crear campana masiva de WhatsApp' })
  @ApiCreatedResponse()
  create(
    @Body() payload: CreateWhatsappBroadcastCampaignRequestDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.whatsappBroadcastService.createCampaign({
      nombreCampana: payload.nombreCampana,
      descripcion: payload.descripcion,
      usuarioCreadorId: user?.id ?? user?.sub ?? 0,
      pacienteIds: payload.pacienteIds,
      contenido: payload.contenido,
      mediaKey: payload.mediaKey,
      mediaName: payload.mediaName,
      mediaMimeType: payload.mediaMimeType,
      tipoEnvio: payload.tipoEnvio,
      maxIntentos: payload.maxIntentos,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Obtener estado de campana masiva de WhatsApp' })
  @ApiOkResponse()
  findById(@Param('id') id: string) {
    return this.whatsappBroadcastService.getCampaignStatus(Number(id));
  }

  @Post(':id/start')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Iniciar o reanudar campana masiva de WhatsApp' })
  @ApiOkResponse()
  start(@Param('id') id: string) {
    return this.whatsappBroadcastService.startCampaign(Number(id));
  }

  @Post(':id/pause')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Pausar campana masiva de WhatsApp' })
  @ApiOkResponse()
  pause(@Param('id') id: string) {
    return this.whatsappBroadcastService.pauseCampaign(Number(id));
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Cancelar campana masiva de WhatsApp' })
  @ApiOkResponse()
  cancel(@Param('id') id: string) {
    return this.whatsappBroadcastService.cancelCampaign(Number(id));
  }
}
