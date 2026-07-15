import { AuthUserOutput } from './auth-user.output';

export class AuthTokenOutput {
  accessToken!: string;
  tokenType!: 'Bearer';
  user!: AuthUserOutput;
}
