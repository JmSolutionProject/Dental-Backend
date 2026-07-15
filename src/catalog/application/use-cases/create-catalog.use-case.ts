import { Inject, Injectable } from '@nestjs/common';
import { CATALOG_REPOSITORY } from '../../domain/repositories/catalog.repository';
import type { CatalogRepository } from '../../domain/repositories/catalog.repository';

@Injectable()
export class CreateCatalogUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepository: CatalogRepository,
  ) {}

  execute(payload: unknown): Promise<unknown> {
    void payload;

    return this.catalogRepository.count().then((count) => ({ count }));
  }
}
