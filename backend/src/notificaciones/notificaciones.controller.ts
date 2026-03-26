import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { EnviarNotificacionDto } from './dto/enviar-notificacion.dto';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * POST /notificaciones/enviar
   * Envía una alerta accionable al dispositivo del usuario.
   * Selecciona canales según la urgencia (INFORMATIVA→Push, INMEDIATA→todos).
   */
  @Post('enviar')
  @HttpCode(HttpStatus.OK)
  enviarNotificacion(@Body() dto: EnviarNotificacionDto) {
    return this.notificacionesService.enviarNotificacion(dto);
  }

  /**
   * PUT /notificaciones/config/:userId
   * Actualiza las preferencias de notificaciones del usuario.
   */
  @Put('config/:userId')
  @HttpCode(HttpStatus.OK)
  actualizarConfiguracion(
    @Param('userId') userId: string,
    @Body() config: Record<string, unknown>,
  ) {
    return this.notificacionesService.actualizarConfiguracion(userId, config);
  }
}
