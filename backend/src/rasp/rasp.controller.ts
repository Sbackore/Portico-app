import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RaspService } from './rasp.service';
import { AlertaRaspDto } from './dto/alerta-rasp.dto';

@Controller('rasp')
export class RaspController {
  constructor(private readonly raspService: RaspService) {}

  /**
   * POST /rasp/webhook
   * Recibe alertas del SDK Antigravity Shield (RASP).
   * Registra la amenaza y toma acción automática según la severidad.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  procesarAlertaRasp(@Body() dto: AlertaRaspDto) {
    return this.raspService.procesarAlertaRasp(dto);
  }

  /**
   * GET /rasp/estado/:userId
   * Retorna el score de seguridad y amenazas recientes del usuario.
   */
  @Get('estado/:userId')
  getEstado(@Param('userId') userId: string) {
    return this.raspService.getEstado(userId);
  }
}
