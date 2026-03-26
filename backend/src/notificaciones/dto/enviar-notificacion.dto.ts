import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class EnviarNotificacionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  alertaId: string;

  @IsString()
  @IsNotEmpty()
  nivelUrgencia: string;

  @IsString()
  @IsNotEmpty()
  monto: string;

  @IsString()
  @IsNotEmpty()
  comercio: string;

  @IsString()
  @IsNotEmpty()
  colorIndicador: string;

  @IsBoolean()
  @IsOptional()
  forzarTodosCanales?: boolean;
}
