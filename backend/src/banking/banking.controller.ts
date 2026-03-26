import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BankingService } from './banking.service';
import { WebhookTransaccionDto } from './dto/webhook-transaccion.dto';
import { IsString, IsNotEmpty } from 'class-validator';

class CrearLinkDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  authCode: string;
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
   * POST /banking/link
   * Crea un Recurrent Link en Antigravity Banking para el usuario.
   * El authCode lo provee la app móvil tras completar el flujo OAuth.
   */
  @Post('link')
  @HttpCode(HttpStatus.CREATED)
  crearRecurrentLink(@Body() dto: CrearLinkDto) {
    return this.bankingService.crearRecurrentLink(dto.userId, dto.authCode);
  }
}
