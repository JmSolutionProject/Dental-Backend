export class PatientEntity {
  id?: number;
  nombres!: string;
  apellidos!: string;
  fechaNacimiento?: Date;
  telefonoWhatsapp?: string;
  alergiasCriticas?: string;
  fechaRegistro?: Date;
  estado = true;

  constructor(partial: Partial<PatientEntity> = {}) {
    Object.assign(this, partial);
  }
}
