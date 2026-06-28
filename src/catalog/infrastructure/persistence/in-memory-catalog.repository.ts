import { Injectable } from '@nestjs/common';
import { CatalogRepository } from '../../domain/repositories/catalog.repository';

@Injectable()
export class InMemoryCatalogRepository implements CatalogRepository {}
