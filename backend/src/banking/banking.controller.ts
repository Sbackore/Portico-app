import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BankingService } from './banking.service';
import { WebhookTransaccionDto } from './dto/webhook-transaccion.dto';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

class CrearLinkDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  authCode: string;
}

class SimularTransaccionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  monto: number;

  @IsString()
  @IsNotEmpty()
  comercio: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsNumber()
  @IsOptional()
  factorDispositivo?: number;
}

@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  /**
   * POST /banking/webhook
   * Recibe nuevas transacciones de Antigravity Banking, las persiste
   * y evalúa el score de riesgo. Si supera el umbral, genera una alerta.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  procesarWebhookTransaccion(@Body() dto: WebhookTransaccionDto) {
    return this.bankingService.procesarWebhookTransaccion(dto);
  }

  /**
   * POST /banking/simular
   * Simula una transacción bancaria para pruebas/demo.
   * Genera un ID automático y procesa el webhook internamente.
   */
  @Post('simular')
  @HttpCode(HttpStatus.OK)
  simularTransaccion(@Body() dto: SimularTransaccionDto) {
    return this.bankingService.simularTransaccion(dto);
  }

  /**
   * GET /banking/alertas/:userId
   * Retorna las alertas de transacciones del usuario desde Firestore.
   */
  @Get('alertas/:userId')
  getAlertas(@Param('userId') userId: string) {
    return this.bankingService.getAlertas(userId);
  }

  /**
   * POST /banking/link
   * Crea un Recurrent Link en Antigravity Banking para el usuario.
   */
  @Post('link')
  @HttpCode(HttpStatus.CREATED)
  crearRecurrentLink(@Body() dto: CrearLinkDto) {
    return this.bankingService.crearRecurrentLink(dto.userId, dto.authCode);
  }
}
