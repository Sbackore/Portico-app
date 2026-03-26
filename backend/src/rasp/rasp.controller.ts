import {
  Controller,
  Post,
  Body,
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
   * En amenazas CRÍTICAS (ROOT, HOOK) bloquea las sesiones del usuario por 2h.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  procesarAlertaRasp(@Body() dto: AlertaRaspDto) {
    return this.raspService.procesarAlertaRasp(dto);
  }
}
