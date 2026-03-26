import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirestoreService } from '../shared/firestore/firestore.service';
import { RegistrarConsentimientoDto } from './dto/registrar-consentimiento.dto';
import { WebhookKycDto } from './dto/webhook-kyc.dto';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registra el consentimiento biométrico antes de invocar el SDK de IDV.
   * Colección Firestore: consentimiento_biometrico
   */
  async registrarConsentimiento(
    dto: RegistrarConsentimientoDto,
    ip: string,
  ): Promise<{ success: boolean }> {
    const db = this.firestoreService.getDb();
    const ref = db.collection('consentimiento_biometrico').doc(dto.uid);

    await ref.set({
      versionConsentimientoAceptado: dto.version,
      fechaAceptacionConsentimiento: FieldValue.serverTimestamp(),
      ipAceptacionConsentimiento: ip,
      modeloDispositivoConsentimiento: dto.dispositivo,
      propositoBiometria: dto.proposito,
      versionPoliticaRetencionDatos: '2.1.0',
    });

    this.logger.log(`Consentimiento biométrico registrado para UID: ${dto.uid}`);
    return { success: true };
  }

  /**
   * Procesa el resultado del webhook de Antigravity IDV.
   * Actualiza la colección proceso_kyc con el estado final.
   * Si hay 3+ rechazos: activa revisión manual y bloqueo temporal de 24h.
   */
  async procesarWebhookKyc(dto: WebhookKycDto): Promise<{ received: boolean }> {
    const db = this.firestoreService.getDb();
    const maxReintentos = parseInt(
      this.configService.get<string>('IDV_MAX_REINTENTOS', '3'),
      10,
    );

    const kycRef = db.collection('proceso_kyc').doc(dto.userId);
    const snap = await kycRef.get();
    const intentos =
      (snap.data()?.intentosReconocimientoFacial || 0) + 1;

    const update: Record<string, unknown> = {
      estadoProcesoBiometrico: dto.estado,
      intentosReconocimientoFacial: intentos,
      fechaUltimoIntentoBiometrico: FieldValue.serverTimestamp(),
    };

    if (dto.motivoRechazo) {
      update.motivoRechazo = dto.motivoRechazo;
    }

    // Activar revisión manual y bloqueo temporal tras demasiados rechazos
    if (dto.estado === 'RECHAZADO' && intentos >= maxReintentos) {
      update.estadoRevisionManual = 'PENDIENTE';
      const bloqueoHasta = new Date(Date.now() + 24 * 60 * 60 * 1000);
      update.bloqueoTemporalHasta = bloqueoHasta;
      this.logger.warn(
        `Usuario ${dto.userId} bloqueado por ${maxReintentos} intentos fallidos. Bloqueo hasta: ${bloqueoHasta.toISOString()}`,
      );
    }

    await kycRef.set(update, { merge: true });
    this.logger.log(
      `Webhook KYC procesado para ${dto.userId}: estado=${dto.estado}, intentos=${intentos}`,
    );

    return { received: true };
  }
}
