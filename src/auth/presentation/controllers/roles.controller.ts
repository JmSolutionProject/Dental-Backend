import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolCreateUseCase } from '@auth/application/use-cases/rol/rol-create.use-case';
import { RolListUseCase } from '@auth/application/use-cases/rol/rol-list.use-case';
import { CreateRolRequestDto } from '@auth/presentation/dtos/request/create-rol.request.dto';
import { RolResponseDto } from '@auth/presentation/dtos/response/rol.response.dto';
import { RolPresentationMapper } from '@auth/presentation/mappers/rol-presentation.mapper';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolCreateUseCase: RolCreateUseCase,
    private readonly rolListUseCase: RolListUseCase,
    private readonly rolPresentationMapper: RolPresentationMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar roles del sistema' })
  @ApiOkResponse({ type: RolResponseDto, isArray: true })
  async findAll(): Promise<RolResponseDto[]> {
    const output = await this.rolListUseCase.execute();

    return output.map((rol) => this.rolPresentationMapper.toResponse(rol));
  }

  @Post()
  @ApiOperation({ summary: 'Crear un rol del sistema' })
  @ApiCreatedResponse({ type: RolResponseDto })
  async create(@Body() payload: CreateRolRequestDto): Promise<RolResponseDto> {
    const output = await this.rolCreateUseCase.execute(
      this.rolPresentationMapper.toCommand(payload),
    );

    return this.rolPresentationMapper.toResponse(output);
  }
}
