import { Injectable } from '@nestjs/common';
import {
  DentalPiece,
  DentalSurface,
  ToothState,
} from '../../domain/entities/dental-piece.entity';
import {
  Odontogram,
  OdontogramDetail,
  RegisterOdontogramDetailCommand,
} from '../../domain/entities/odontogram-detail.entity';
import { OdontogramRepository } from '../../domain/repositories/odontogram.repository';

const DENTAL_SURFACES: DentalSurface[] = [
  { id: 1, nombreSuperficie: 'Vestibular', abreviatura: 'V' },
  { id: 2, nombreSuperficie: 'Palatina', abreviatura: 'P' },
  { id: 3, nombreSuperficie: 'Lingual', abreviatura: 'L' },
  { id: 4, nombreSuperficie: 'Mesial', abreviatura: 'M' },
  { id: 5, nombreSuperficie: 'Distal', abreviatura: 'D' },
  { id: 6, nombreSuperficie: 'Oclusal', abreviatura: 'O' },
  { id: 7, nombreSuperficie: 'Incisal', abreviatura: 'I' },
];

const TOOTH_STATES: ToothState[] = [
  { id: 1, nombreEstado: 'Sano' },
  { id: 2, nombreEstado: 'Caries' },
  { id: 3, nombreEstado: 'Obturado' },
  { id: 4, nombreEstado: 'Ausente' },
  { id: 5, nombreEstado: 'Endodoncia' },
  { id: 6, nombreEstado: 'Corona' },
];

@Injectable()
export class InMemoryOdontogramRepository implements OdontogramRepository {
  private readonly dentalPieces = this.buildDentalPieces();
  private readonly dentalSurfaces = DENTAL_SURFACES;
  private readonly toothStates = TOOTH_STATES;
  private readonly odontograms: Odontogram[] = [];
  private readonly details: OdontogramDetail[] = [];
  private nextOdontogramId = 1;
  private nextDetailId = 1;

  listDentalPieces(): Promise<DentalPiece[]> {
    return Promise.resolve(this.dentalPieces);
  }

  listDentalSurfaces(): Promise<DentalSurface[]> {
    return Promise.resolve(this.dentalSurfaces);
  }

  listToothStates(): Promise<ToothState[]> {
    return Promise.resolve(this.toothStates);
  }

  existsDentalPiece(id: number): Promise<boolean> {
    return Promise.resolve(this.dentalPieces.some((piece) => piece.id === id));
  }

  existsDentalSurface(id: number): Promise<boolean> {
    return Promise.resolve(this.dentalSurfaces.some((surface) => surface.id === id));
  }

  existsToothState(id: number): Promise<boolean> {
    return Promise.resolve(this.toothStates.some((state) => state.id === id));
  }

  saveDetail(
    command: RegisterOdontogramDetailCommand,
  ): Promise<OdontogramDetail> {
    const odontogramaId = this.resolveOdontogramId(command);
    const detail: OdontogramDetail = {
      id: this.nextDetailId++,
      odontogramaId,
      piezaDentalId: command.piezaDentalId,
      superficieId: command.superficieId,
      estadoPiezaId: command.estadoPiezaId,
      diagnostico: command.diagnostico,
      tratamientoRecomendado: command.tratamientoRecomendado,
      observacion: command.observacion,
    };

    this.details.push(detail);

    return Promise.resolve(detail);
  }

  private resolveOdontogramId(command: RegisterOdontogramDetailCommand): number {
    if (command.odontogramaId) {
      return command.odontogramaId;
    }

    const existing = this.odontograms.find(
      (odontogram) =>
        odontogram.pacienteId === command.pacienteId &&
        odontogram.citaId === command.citaId,
    );

    if (existing) {
      return existing.id;
    }

    const odontogram: Odontogram = {
      id: this.nextOdontogramId++,
      pacienteId: command.pacienteId,
      citaId: command.citaId,
      fechaRegistro: new Date(),
      observacionGeneral: command.observacionGeneral,
    };

    this.odontograms.push(odontogram);

    return odontogram.id;
  }

  private buildDentalPieces(): DentalPiece[] {
    return [...this.buildSeries([1, 2, 3, 4], 8, 'permanente'), ...this.buildSeries([5, 6, 7, 8], 5, 'temporal')];
  }

  private buildSeries(
    quadrants: number[],
    positionsPerQuadrant: number,
    tipoPieza: string,
  ): DentalPiece[] {
    const pieces: DentalPiece[] = [];

    for (const quadrant of quadrants) {
      for (let position = 1; position <= positionsPerQuadrant; position++) {
        pieces.push({
          id: pieces.length + 1 + (tipoPieza === 'temporal' ? 32 : 0),
          codigoFdi: `${quadrant}${position}`,
          nombrePieza: `Pieza FDI ${quadrant}${position}`,
          tipoPieza,
          cuadrante: quadrant,
          arcada: [1, 2, 5, 6].includes(quadrant) ? 'superior' : 'inferior',
          lado: [1, 4, 5, 8].includes(quadrant) ? 'derecho' : 'izquierdo',
          posicion: position,
          estado: true,
        });
      }
    }

    return pieces;
  }
}
