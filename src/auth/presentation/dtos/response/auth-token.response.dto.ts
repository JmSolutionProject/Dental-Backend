import { ApiProperty } from '@nestjs/swagger';
import { AuthUserResponseDto } from './auth-user.response.dto';

export class AuthTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}
