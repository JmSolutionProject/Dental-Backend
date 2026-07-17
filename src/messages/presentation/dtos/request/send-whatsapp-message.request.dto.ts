import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendWhatsappMessageRequestDto {
  @ApiProperty({ example: 'Hola, le recordamos su cita dental.' })
  @IsString()
  @MinLength(1)
  content!: string;
}
