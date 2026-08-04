import { IsNotEmpty, IsString } from 'class-validator';

export class RequestWhatsappPairingCodeRequestDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
