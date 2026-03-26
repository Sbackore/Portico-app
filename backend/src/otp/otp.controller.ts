import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OtpService } from './otp.service';
import { TriggerVerificacionDto } from './dto/trigger-verificacion.dto';
import { VerificarOtpDto } from './dto/verificar-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  /**
   * POST /otp/trigger
   * Solicita un OTP según el nivel de riesgo detectado.
   * CRÍTICO→biometría, ALTO→OTP, MEDIO→PIN
   */
  @Post('trigger')
  @HttpCode(HttpStatus.CREATED)
  triggerVerificacion(@Body() dto: TriggerVerificacionDto) {
    return this.otpService.triggerVerificacion(dto);
  }

  /**
   * POST /otp/verificar
   * Valida el código OTP ingresado por el usuario.
   * Bloquea temporalmente tras superar el máx. de intentos.
   */
  @Post('verificar')
  @HttpCode(HttpStatus.OK)
  verificarOtp(@Body() dto: VerificarOtpDto) {
    return this.otpService.verificarOtp(dto);
  }
}
