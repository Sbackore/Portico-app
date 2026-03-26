import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class WebhookTransaccionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  idTransaccion: string;

  @IsNumber()
  monto: number;

  @IsString()
  @IsNotEmpty()
  comercio: string;

  @IsString()
  @IsNotEmpty()
  fechaHora: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  /** 0 = dispositivo confianza, 100 = dispositivo nuevo/desconocido */
  @IsNumber()
  @IsOptional()
  factorDispositivo?: number;
}
