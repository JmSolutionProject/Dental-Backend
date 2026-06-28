import { Controller } from '@nestjs/common';
import { CreateCatalogUseCase } from '../../application/use-cases/create-catalog.use-case';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly createCatalogUseCase: CreateCatalogUseCase) {}
}
