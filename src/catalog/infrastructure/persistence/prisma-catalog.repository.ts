import { Injectable } from '@nestjs/common';
import { CatalogRepository } from '../../domain/repositories/catalog.repository';

@Injectable()
export class PrismaCatalogRepository implements CatalogRepository {
  count(): Promise<number> {
    return Promise.resolve(0);
  }
}
