import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { WhatsappService } from '../../infrastructure/whatsapp/whatsapp.service';
import { SendWhatsappMessageRequestDto } from '../dtos/request/send-whatsapp-message.request.dto';

@ApiTags('whatsapp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de WhatsApp Web' })
  @ApiOkResponse()
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get('qr')
  @ApiOperation({ summary: 'Obtener QR actual de WhatsApp Web' })
  @ApiOkResponse()
  getQr() {
    return this.whatsappService.getLatestQr();
  }

  @Post('patients/:patientId/send')
  @ApiOperation({
    summary: 'Enviar WhatsApp al telefono guardado del paciente',
  })
  @ApiOkResponse()
  async sendToPatient(
    @Param('patientId') patientId: string,
    @Body() payload: SendWhatsappMessageRequestDto,
  ) {
    const patient = await this.prisma.paciente.findUnique({
      where: { id: Number(patientId) },
      select: { id: true, telefonoWhatsapp: true },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    if (!patient.telefonoWhatsapp) {
      throw new BadRequestException(
        'El paciente no tiene telefono de WhatsApp registrado.',
      );
    }

    try {
      return await this.whatsappService.sendMessage(
        patient.telefonoWhatsapp,
        payload.content,
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'No se pudo enviar el mensaje de WhatsApp.',
      );
    }
  }
}
