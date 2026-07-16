import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ODONTOGRAM_REPOSITORY } from '../../domain/repositories/odontogram.repository';
import type { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import type {
  OdontogramDetail,
  RegisterOdontogramDetailCommand,
} from '../../domain/entities/odontogram-detail.entity';

@Injectable()
export class RegisterOdontogramDetailUseCase {
  constructor(
    @Inject(ODONTOGRAM_REPOSITORY)
    private readonly odontogramRepository: OdontogramRepository,
  ) {}

  async execute(
    command: RegisterOdontogramDetailCommand,
  ): Promise<OdontogramDetail> {
    const pieceExists = await this.odontogramRepository.existsDentalPiece(
      command.piezaDentalId,
    );

    if (!pieceExists) {
      throw new BadRequestException('La pieza dental indicada no existe.');
    }

    if (command.superficieId) {
      const surfaceExists = await this.odontogramRepository.existsDentalSurface(
        command.superficieId,
      );

      if (!surfaceExists) {
        throw new BadRequestException(
          'La superficie dental indicada no existe.',
        );
      }
    }

    const toothStateExists = await this.odontogramRepository.existsToothState(
      command.estadoPiezaId,
    );

    if (!toothStateExists) {
      throw new BadRequestException('El estado de pieza indicado no existe.');
    }

    return this.odontogramRepository.saveDetail(command);
  }
}
