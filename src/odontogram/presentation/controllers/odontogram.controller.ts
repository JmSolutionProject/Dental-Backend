import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ListDentalPiecesUseCase } from '../../application/use-cases/list-dental-pieces.use-case';
import { ListDentalSurfacesUseCase } from '../../application/use-cases/list-dental-surfaces.use-case';
import { ListToothStatesUseCase } from '../../application/use-cases/list-tooth-states.use-case';
import { RegisterOdontogramDetailUseCase } from '../../application/use-cases/register-odontogram-detail.use-case';
import { RegisterOdontogramDetailRequestDto } from '../dtos/request/register-odontogram-detail.request.dto';
import {
  DentalPieceResponseDto,
  DentalSurfaceResponseDto,
  ToothStateResponseDto,
} from '../dtos/response/dental-piece.response.dto';
import { OdontogramDetailResponseDto } from '../dtos/response/odontogram-detail.response.dto';

@ApiTags('Odontogram')
@Controller('odontogram')
export class OdontogramController {
  constructor(
    private readonly listDentalPiecesUseCase: ListDentalPiecesUseCase,
    private readonly listDentalSurfacesUseCase: ListDentalSurfacesUseCase,
    private readonly listToothStatesUseCase: ListToothStatesUseCase,
    private readonly registerOdontogramDetailUseCase: RegisterOdontogramDetailUseCase,
  ) {}

  @Get('teeth')
  @ApiOperation({ summary: 'Lista el catalogo base de piezas dentales.' })
  @ApiOkResponse({ type: DentalPieceResponseDto, isArray: true })
  @ApiBearerAuth()
  listTeeth() {
    return this.listDentalPiecesUseCase.execute();
  }

  @Get('surfaces')
  @ApiOperation({ summary: 'Lista las superficies dentales disponibles.' })
  @ApiOkResponse({ type: DentalSurfaceResponseDto, isArray: true })
  @ApiBearerAuth()
  listSurfaces() {
    return this.listDentalSurfacesUseCase.execute();
  }

  @Get('states')
  @ApiOperation({
    summary: 'Lista los estados clinicos disponibles para una pieza dental.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ToothStateResponseDto, isArray: true })
  listStates() {
    return this.listToothStatesUseCase.execute();
  }

  @Post('details')
  @ApiOperation({
    summary: 'Registra un detalle dentro del odontograma del paciente.',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OdontogramDetailResponseDto })
  registerDetail(@Body() payload: RegisterOdontogramDetailRequestDto) {
    return this.registerOdontogramDetailUseCase.execute(payload);
  }
}
