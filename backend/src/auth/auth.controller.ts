import {
  Controller, Post, Get, Body, UseGuards, Request, HttpCode
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('enviar-otp-registro')
  @HttpCode(200)
  async enviarOtpRegistro(@Body() dto: { email: string; telefono: string }) {
    return this.authService.enviarOtpRegistro(dto.email, dto.telefono);
  }

  @Post('verificar-otp-registro')
  @HttpCode(200)
  async verificarOtpRegistro(@Body() dto: { otpId: string; codigo: string }) {
    return this.authService.verificarOtpRegistro(dto.otpId, dto.codigo);
  }

  @Post('recover-password-otp')
  @HttpCode(200)
  async recoverPasswordOtp(@Body() dto: { email: string }) {
    return this.authService.enviarOtpRecuperacion(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: { otpId: string; codigo: string; newPassword: string }) {
    return this.authService.resetPassword(dto.otpId, dto.codigo, dto.newPassword);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    return this.authService.getMe(req.user.userId);
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, dto);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    return this.authService.registerLogout(req.user.userId);
  }
}
