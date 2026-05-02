import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @Matches(/(?=.*[A-Z])/, { message: 'La nueva contraseña debe contener al menos una letra mayúscula' })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: 'La nueva contraseña debe contener al menos un carácter especial' })
  newPassword: string;
}
