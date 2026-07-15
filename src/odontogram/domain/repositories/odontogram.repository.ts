import {
  DentalPiece,
  DentalSurface,
  ToothState,
} from '../entities/dental-piece.entity';
import {
  OdontogramDetail,
  RegisterOdontogramDetailCommand,
} from '../entities/odontogram-detail.entity';

export const ODONTOGRAM_REPOSITORY = Symbol('ODONTOGRAM_REPOSITORY');

export interface OdontogramRepository {
  listDentalPieces(): Promise<DentalPiece[]>;
  listDentalSurfaces(): Promise<DentalSurface[]>;
  listToothStates(): Promise<ToothState[]>;
  existsDentalPiece(id: number): Promise<boolean>;
  existsDentalSurface(id: number): Promise<boolean>;
  existsToothState(id: number): Promise<boolean>;
  saveDetail(
    command: RegisterOdontogramDetailCommand,
  ): Promise<OdontogramDetail>;
}
