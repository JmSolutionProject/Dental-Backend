import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCatalogUseCase } from '../../application/use-cases/create-catalog.use-case';
import { CreateServiceRequestDto } from '../dtos/request/create-service.request.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly createCatalogUseCase: CreateCatalogUseCase) {}

  @Post('services')
  @ApiOperation({ summary: 'Crear un servicio dentro del catalogo' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  createService(@Body() payload: CreateServiceRequestDto) {
    return this.createCatalogUseCase.execute(payload);
  }
}
