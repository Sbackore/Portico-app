import { IsString, IsNotEmpty } from 'class-validator';

export class RegistrarConsentimientoDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsNotEmpty()
  proposito: string;

  @IsString()
  @IsNotEmpty()
  dispositivo: string;
}
