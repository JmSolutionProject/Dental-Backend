import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { RolCreateUseCase } from '@auth/application/use-cases/rol/rol-create.use-case';
import { RolListUseCase } from '@auth/application/use-cases/rol/rol-list.use-case';
import { CreateRolRequestDto } from '@auth/presentation/dtos/request/create-rol.request.dto';
import { UpdateRolRequestDto } from '@auth/presentation/dtos/request/update-rol.request.dto';
import { RolResponseDto } from '@auth/presentation/dtos/response/rol.response.dto';
import { RolPresentationMapper } from '@auth/presentation/mappers/rol-presentation.mapper';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

@ApiTags('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolCreateUseCase: RolCreateUseCase,
    private readonly rolListUseCase: RolListUseCase,
    private readonly rolPresentationMapper: RolPresentationMapper,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar roles del sistema' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findAll(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.role.count(),
    ]);

    return {
      data: data.map((role) => ({
        id: role.id,
        nombreRol: role.nombreRol,
        estado: role.estado,
      })),
      total,
      page,
      limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por id' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: RolResponseDto })
  async findById(@Param('id') id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado.');
    }

    return role;
  }

  @Post()
  @ApiOperation({ summary: 'Crear un rol del sistema' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RolResponseDto })
  async create(@Body() payload: CreateRolRequestDto): Promise<RolResponseDto> {
    const output = await this.rolCreateUseCase.execute(
      this.rolPresentationMapper.toCommand(payload),
    );

    return this.rolPresentationMapper.toResponse(output);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async update(@Param('id') id: string, @Body() payload: UpdateRolRequestDto) {
    await this.ensureRoleExists(id);

    return this.prisma.role.update({
      where: { id: Number(id) },
      data: {
        nombreRol: payload.nombreRol,
        estado: payload.estado,
      },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rol' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async remove(@Param('id') id: string) {
    await this.ensureRoleExists(id);

    return this.prisma.role.update({
      where: { id: Number(id) },
      data: { estado: false },
    });
  }

  private async ensureRoleExists(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado.');
    }
  }

  private toPositiveNumber(
    value: string | undefined,
    fallback: number,
  ): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }
}
