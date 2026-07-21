import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class CreateCatalogUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(payload: {
    nombreServicio: string;
    categoriaId: number;
    precio?: number;
    descripcion?: string;
  }) {
    const category = await this.prisma.categoriaServicio.findUnique({
      where: { id: payload.categoriaId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    const service = await this.prisma.servicio.create({
      data: {
        categoriaId: payload.categoriaId,
        nombreServicio: payload.nombreServicio,
        descripcion: payload.descripcion ?? null,
      },
    });

    if (payload.precio !== undefined) {
      await this.prisma.servicioPrecio.create({
        data: {
          servicioId: service.id,
          precio: payload.precio,
          fechaInicio: new Date(),
        },
      });
    }

    return this.prisma.servicio.findUnique({
      where: { id: service.id },
      include: {
        categoria: true,
        precios: { orderBy: { fechaInicio: 'desc' }, take: 1 },
      },
    });
  }
}
