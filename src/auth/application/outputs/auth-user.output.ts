import { AuthRoleOutput } from './auth-role.output';

export class AuthUserOutput {
  id!: number;
  nombreCompleto!: string;
  email!: string;
  estado!: boolean;
  fechaRegistro!: string;
  roles!: AuthRoleOutput[];
}
