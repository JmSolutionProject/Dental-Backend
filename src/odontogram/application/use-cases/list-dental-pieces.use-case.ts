import { Inject, Injectable } from '@nestjs/common';
import { ODONTOGRAM_REPOSITORY } from '../../domain/repositories/odontogram.repository';
import type { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import type { DentalPiece } from '../../domain/entities/dental-piece.entity';

@Injectable()
export class ListDentalPiecesUseCase {
  constructor(
    @Inject(ODONTOGRAM_REPOSITORY)
    private readonly odontogramRepository: OdontogramRepository,
  ) {}

  execute(): Promise<DentalPiece[]> {
    return this.odontogramRepository.listDentalPieces();
  }
}
