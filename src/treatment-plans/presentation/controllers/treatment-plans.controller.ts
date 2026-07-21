import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { Roles } from '@auth/presentation/decorators/roles.decorator';
import { ManagePlansUseCase } from '../../application/use-cases/manage-plans.use-case';
import { CreatePlanRequestDto } from '../dtos/request/create-plan.request.dto';
import { UpdatePlanRequestDto } from '../dtos/request/update-plan.request.dto';

@ApiTags('treatment-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('treatment-plans')
export class TreatmentPlansController {
  constructor(private readonly managePlans: ManagePlansUseCase) {}

  @Get()
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar planes de tratamiento' })
  async findAll(@Query('patientId') patientId?: string) {
    if (patientId === 'undefined' || patientId === 'null' || patientId === '') {
      return [];
    }
    const parsedId = patientId ? Number(patientId) : undefined;
    if (parsedId !== undefined && isNaN(parsedId)) {
      return [];
    }
    return this.managePlans.findAll(parsedId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener plan por id' })
  findById(@Param('id') id: string) {
    return this.managePlans.findById(Number(id));
  }

  @Post()
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear plan de tratamiento con servicios' })
  @ApiCreatedResponse()
  create(@Body() payload: CreatePlanRequestDto) {
    return this.managePlans.create({
      pacienteId: payload.pacienteId,
      medicoId: payload.medicoId,
      servicios: payload.servicios.map((s) => ({
        servicioId: s.servicioId,
        cantidad: s.cantidad,
        descuento: s.descuento,
      })),
      observaciones: payload.observaciones,
    });
  }

  @Put(':id')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado u observaciones del plan' })
  update(@Param('id') id: string, @Body() payload: UpdatePlanRequestDto) {
    return this.managePlans.update(Number(id), {
      estado: payload.estado,
      observaciones: payload.observaciones,
    });
  }

  @Delete(':id')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un plan de tratamiento' })
  delete(@Param('id') id: string) {
    return this.managePlans.delete(Number(id));
  }

  @Put('services/:itemId/toggle-execution')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alternar estado de ejecucion de un servicio en el plan',
  })
  toggleServiceExecution(@Param('itemId') itemId: string) {
    return this.managePlans.toggleServiceExecution(Number(itemId));
  }
}
