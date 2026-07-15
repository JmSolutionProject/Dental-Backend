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
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { CreateCatalogUseCase } from '../../application/use-cases/create-catalog.use-case';
import { CreateServiceRequestDto } from '../dtos/request/create-service.request.dto';
import { UpdateServiceRequestDto } from '../dtos/request/update-service.request.dto';

@ApiTags('catalog')
@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly createCatalogUseCase: CreateCatalogUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get('services')
  @ApiOperation({ summary: 'Listar servicios del catalogo' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async listServices(@Query() query: Record<string, string | undefined>) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = Math.min(this.toPositiveNumber(query.limit, 10), 100);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.servicio.findMany({
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          categoria: true,
          precios: { orderBy: { fechaInicio: 'desc' }, take: 1 },
        },
      }),
      this.prisma.servicio.count(),
    ]);

    return {
      data: data.map((service) => this.toServiceResponse(service)),
      total,
      page,
      limit,
    };
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Obtener servicio por id' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async findServiceById(@Param('id') id: string) {
    const service = await this.prisma.servicio.findUnique({
      where: { id: Number(id) },
      include: {
        categoria: true,
        precios: { orderBy: { fechaInicio: 'desc' }, take: 1 },
      },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado.');
    }

    return this.toServiceResponse(service);
  }

  @Post('services')
  @ApiOperation({ summary: 'Crear un servicio dentro del catalogo' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  createService(@Body() payload: CreateServiceRequestDto) {
    return this.createCatalogUseCase.execute(payload);
  }

  @Put('services/:id')
  @ApiOperation({ summary: 'Actualizar servicio del catalogo' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async updateService(
    @Param('id') id: string,
    @Body() payload: UpdateServiceRequestDto,
  ) {
    await this.ensureServiceExists(id);

    const service = await this.prisma.servicio.update({
      where: { id: Number(id) },
      data: {
        categoriaId: payload.categoriaId,
        nombreServicio: payload.nombreServicio,
        descripcion: payload.descripcion,
      },
    });

    if (payload.precio !== undefined) {
      await this.prisma.servicioPrecio.create({
        data: {
          servicioId: service.id,
          precio: payload.precio,
          fechaInicio: payload.fechaInicio
            ? new Date(payload.fechaInicio)
            : new Date(),
        },
      });
    }

    return this.findServiceById(id);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Eliminar servicio del catalogo' })
  @ApiBearerAuth()
  @ApiOkResponse()
  async removeService(@Param('id') id: string) {
    await this.ensureServiceExists(id);

    await this.prisma.servicio.update({
      where: { id: Number(id) },
      data: { estado: false },
    });

    return this.findServiceById(id);
  }

  private async ensureServiceExists(id: string): Promise<void> {
    const service = await this.prisma.servicio.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado.');
    }
  }

  private toServiceResponse(service: {
    id: number;
    categoriaId: number;
    nombreServicio: string;
    descripcion: string | null;
    estado: boolean;
    categoria: { id: number; nombreCategoria: string };
    precios: Array<{ precio: { toString(): string } }>;
  }) {
    return {
      id: String(service.id),
      categoryId: String(service.categoriaId),
      categoryName: service.categoria.nombreCategoria,
      name: service.nombreServicio,
      description: service.descripcion ?? '',
      status: service.estado ? 'active' : 'inactive',
      price: Number(service.precios[0]?.precio?.toString() ?? 0),
    };
  }

  private toPositiveNumber(value: string | undefined, fallback: number): number {
    const number = Number(value ?? fallback);

    return Number.isFinite(number) ? Math.max(number, 1) : fallback;
  }
}
