import { Module } from '@nestjs/common';
import { ListDentalPiecesUseCase } from './application/use-cases/list-dental-pieces.use-case';
import { ListDentalSurfacesUseCase } from './application/use-cases/list-dental-surfaces.use-case';
import { ListToothStatesUseCase } from './application/use-cases/list-tooth-states.use-case';
import { RegisterOdontogramDetailUseCase } from './application/use-cases/register-odontogram-detail.use-case';
import { ODONTOGRAM_REPOSITORY } from './domain/repositories/odontogram.repository';
import { InMemoryOdontogramRepository } from './infrastructure/persistence/in-memory-odontogram.repository';
import { OdontogramController } from './presentation/controllers/odontogram.controller';

@Module({
  controllers: [OdontogramController],
  providers: [
    ListDentalPiecesUseCase,
    ListDentalSurfacesUseCase,
    ListToothStatesUseCase,
    RegisterOdontogramDetailUseCase,
    {
      provide: ODONTOGRAM_REPOSITORY,
      useClass: InMemoryOdontogramRepository,
    },
  ],
})
export class OdontogramModule {}
