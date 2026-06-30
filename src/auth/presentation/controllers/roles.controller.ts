import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolCreateUseCase } from '@auth/application/use-cases/rol/rol-create.use-case';
import { CreateRolRequestDto } from '@auth/presentation/dtos/request/create-rol.request.dto';
import { RolResponseDto } from '@auth/presentation/dtos/response/rol.response.dto';
import { RolPresentationMapper } from '@auth/presentation/mappers/rol-presentation.mapper';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolCreateUseCase: RolCreateUseCase,
    private readonly rolPresentationMapper: RolPresentationMapper,
  ) {}

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
