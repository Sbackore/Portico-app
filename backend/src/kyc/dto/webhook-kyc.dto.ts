import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class WebhookKycDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  /** APROBADO | RECHAZADO | REVISION */
  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;

  @IsNumber()
  @IsOptional()
  intentos?: number;
}
