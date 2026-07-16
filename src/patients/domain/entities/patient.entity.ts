export class PatientEntity {
  id!: number;
  nombres!: string;
  apellidos!: string;
  numeroDocumento?: string | null;
  fechaNacimiento?: Date | null;
  telefonoWhatsapp?: string | null;
  alergiasCriticas?: string | null;
  fechaRegistro?: Date;
  estado = true;

  constructor(partial: Partial<PatientEntity> = {}) {
    Object.assign(this, partial);
  }
}
