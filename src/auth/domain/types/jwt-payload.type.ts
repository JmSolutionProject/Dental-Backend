import { AuthenticatedUser } from './authenticated-user.type';

export interface JwtPayload extends AuthenticatedUser {
  sub: number;
  role: string;
  name: string;
}
