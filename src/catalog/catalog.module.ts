import { Module } from '@nestjs/common';
import { CreateCatalogUseCase } from './application/use-cases/create-catalog.use-case';
import { CATALOG_REPOSITORY } from './domain/repositories/catalog.repository';
import { InMemoryCatalogRepository } from './infrastructure/persistence/in-memory-catalog.repository';
import { CatalogController } from './presentation/controllers/catalog.controller';

@Module({
  controllers: [CatalogController],
  providers: [
    CreateCatalogUseCase,
    {
      provide: CATALOG_REPOSITORY,
      useClass: InMemoryCatalogRepository,
    },
  ],
})
export class CatalogModule {}
