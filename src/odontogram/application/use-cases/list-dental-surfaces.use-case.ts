import { Inject, Injectable } from '@nestjs/common';
import { ODONTOGRAM_REPOSITORY } from '../../domain/repositories/odontogram.repository';
import type { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import type { DentalSurface } from '../../domain/entities/dental-piece.entity';

@Injectable()
export class ListDentalSurfacesUseCase {
  constructor(
    @Inject(ODONTOGRAM_REPOSITORY)
    private readonly odontogramRepository: OdontogramRepository,
  ) {}

  execute(): Promise<DentalSurface[]> {
    return this.odontogramRepository.listDentalSurfaces();
  }
}
