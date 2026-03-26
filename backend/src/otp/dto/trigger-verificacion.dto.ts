import { IsString, IsNotEmpty } from 'class-validator';

export class TriggerVerificacionDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  /** BAJO | MEDIO | ALTO | CRITICO */
  @IsString()
  @IsNotEmpty()
  nivelRiesgo: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;
}
