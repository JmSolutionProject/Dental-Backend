import { AuthenticatedUser } from './authenticated-user.type';

export interface JwtPayload extends AuthenticatedUser {
  sub: number;
  /** Primary role used by the frontend for guards and UI decisions. */
  role: string;
  /** Clinic identifier for multi-tenant headers. Optional until the DB model adds it. */
  clinicId: string;
  /** Display name alias kept for frontend compatibility. */
  name: string;
}
