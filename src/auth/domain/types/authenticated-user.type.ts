export interface AuthenticatedUser {
  id: number;
  email: string;
  nombreCompleto: string;
  roles: string[];
}
