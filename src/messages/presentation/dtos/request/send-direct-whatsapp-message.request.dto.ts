import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SendDirectWhatsappMessageRequestDto {
  @ApiProperty({ example: '+51999999999' })
  @IsString()
  @MinLength(1)
  phone!: string;

  @ApiProperty({ example: 'Hola, este es un mensaje de prueba.' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiProperty({ example: 'uploads/promo.png', required: false })
  @IsOptional()
  @IsString()
  mediaKey?: string;

  @ApiProperty({ example: 'promo.png', required: false })
  @IsOptional()
  @IsString()
  mediaName?: string;

  @ApiProperty({ example: 'image/png', required: false })
  @IsOptional()
  @IsString()
  mediaMimeType?: string;
}
