import { IsString, IsNotEmpty } from 'class-validator';

export class VerificarOtpDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  otpId: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;
}
