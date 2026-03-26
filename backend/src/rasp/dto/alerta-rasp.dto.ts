import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AlertaRaspDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  /** ROOT | EMULADOR | HOOK | ACCESSIBILITY_ABUSE */
  @IsString()
  @IsNotEmpty()
  tipoAmenaza: string;

  /** BAJA | MEDIA | ALTA | CRITICA */
  @IsString()
  @IsNotEmpty()
  severidad: string;

  @IsString()
  @IsOptional()
  dispositivo?: string;

  @IsNumber()
  @IsOptional()
  timestampMs?: number;
}
