import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber } from 'class-validator';

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

  @IsNumber()
  monto: number;


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
