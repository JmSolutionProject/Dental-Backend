export interface UserWithRoles {
  id: number;
  nombreCompleto: string;
  email: string;
  estado: boolean;
  roles: Array<{ id: number; nombreRol: string }>;
  fechaRegistro: string;
}

export interface CreateUserCommand {
  nombreCompleto: string;
  email: string;
  password: string;
  roleIds: number[];
}

export interface UpdateUserCommand {
  nombreCompleto?: string;
  email?: string;
  password?: string;
  roleIds?: number[];
  estado?: boolean;
}
