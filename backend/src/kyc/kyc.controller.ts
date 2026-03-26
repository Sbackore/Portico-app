import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { KycService } from './kyc.service';
import { RegistrarConsentimientoDto } from './dto/registrar-consentimiento.dto';
import { WebhookKycDto } from './dto/webhook-kyc.dto';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  /**
   * POST /kyc/consentimiento
   * Registra el consentimiento biométrico del usuario antes del proceso IDV.
   * Debe llamarse SIEMPRE antes de invocar el SDK de Antigravity IDV.
   */
  @Post('consentimiento')
  @HttpCode(HttpStatus.CREATED)
  registrarConsentimiento(
    @Body() dto: RegistrarConsentimientoDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'desconocida';
    return this.kycService.registrarConsentimiento(dto, ip);
  }

  /**
   * POST /kyc/webhook
   * Webhook que recibe el resultado del proceso IDV desde Antigravity.
   * Antigravity llamará a este endpoint con el estado: APROBADO | RECHAZADO | REVISION
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  procesarWebhookKyc(@Body() dto: WebhookKycDto) {
    return this.kycService.procesarWebhookKyc(dto);
  }
}
