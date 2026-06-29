import { Inject, Injectable } from '@nestjs/common';
import { ODONTOGRAM_REPOSITORY } from '../../domain/repositories/odontogram.repository';
import type { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import type { ToothState } from '../../domain/entities/dental-piece.entity';

@Injectable()
export class ListToothStatesUseCase {
  constructor(
    @Inject(ODONTOGRAM_REPOSITORY)
    private readonly odontogramRepository: OdontogramRepository,
  ) {}

  execute(): Promise<ToothState[]> {
    return this.odontogramRepository.listToothStates();
  }
}
