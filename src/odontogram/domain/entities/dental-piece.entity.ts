export interface DentalPiece {
  id: number;
  codigoFdi: string;
  nombrePieza: string;
  tipoPieza: string;
  cuadrante: number;
  arcada: string;
  lado: string;
  posicion: number;
  estado: boolean;
}

export interface DentalSurface {
  id: number;
  nombreSuperficie: string;
  abreviatura: string;
}

export interface ToothState {
  id: number;
  nombreEstado: string;
}
