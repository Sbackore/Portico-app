import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  documento: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$&*])/, { message: 'La contraseña debe incluir al menos una mayúscula y un carácter especial' })
  password: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}
