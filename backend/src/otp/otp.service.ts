import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FirestoreService } from '../shared/firestore/firestore.service';
import { TriggerVerificacionDto } from './dto/trigger-verificacion.dto';
import { VerificarOtpDto } from './dto/verificar-otp.dto';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Determina el tipo de verificación según el nivel de riesgo
   * y envía el OTP al canal de respaldo del usuario via Antigravity Auth.
   *
   * CRÍTICO  → BIOMETRIA
   * ALTO     → OTP (SMS o correo)
   * MEDIO    → PIN
   */
  async triggerVerificacion(
    dto: TriggerVerificacionDto,
  ): Promise<{ otpId: string; canal: string; mensaje: string }> {
    const db = this.firestoreService.getDb();
    const endpoint = this.configService.get<string>('AG_AUTH_ENDPOINT');
    const apiKey = this.configService.get<string>('AG_AUTH_API_KEY') || 'REEMPLAZAR';
    const expiresInSeconds = parseInt(
      this.configService.get<string>('OTP_EXPIRY_SECONDS', '300'),
      10,
    );

    // Determinar tipo de verificación por nivel de riesgo
    const tipoVerificacion =
      dto.nivelRiesgo === 'CRITICO'
        ? 'BIOMETRIA'
        : dto.nivelRiesgo === 'ALTO'
          ? 'OTP'
          : 'PIN';

    // Obtener canal de respaldo configurado por el usuario
    const authDoc = await db.collection('autenticacion').doc(dto.uid).get();
    const canal = authDoc.data()?.metodoInicioSesionRespaldo || 'OTP_SMS';

    // Llamar a Antigravity Auth para generar y enviar el OTP
    let otpId = `otp-simulado-${Date.now()}`;
    if (apiKey.includes('REEMPLAZAR')) {
      this.logger.warn('[Simulación] API Key no configurada. Simulando envío OTP hacia el canal.');
    } else {
      const agResponse = await axios.post(
        `${endpoint}/otp/send`,
        { userId: dto.uid, canal, expiresInSeconds },
        { headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' } },
      );
      otpId = (agResponse.data as { otpId: string }).otpId;
    }


    // Registrar la solicitud en Firestore
    await db.collection('verificaciones_otp').add({
      uid: dto.uid,
      otpId,
      tipoVerificacionSolicitada: tipoVerificacion,
      motivoVerificacionMostrado: dto.motivo,
      nivelRiesgoDetectado: dto.nivelRiesgo,
      canal,
      estado: 'PENDIENTE',
      creadoEn: FieldValue.serverTimestamp(),
    });

    this.logger.log(
      `OTP solicitado para ${dto.uid}: tipo=${tipoVerificacion}, canal=${canal}`,
    );

    return { otpId, canal, mensaje: dto.motivo };
  }

  /**
   * Verifica el OTP ingresado por el usuario con Antigravity Auth.
   * Actualiza el estado en Firestore y bloquea si supera el máximo de intentos.
   */
  async verificarOtp(
    dto: VerificarOtpDto,
  ): Promise<{ valido: boolean; mensaje: string }> {
    const db = this.firestoreService.getDb();
    const endpoint = this.configService.get<string>('AG_AUTH_ENDPOINT');
    const apiKey = this.configService.get<string>('AG_AUTH_API_KEY') || 'REEMPLAZAR';
    const maxIntentos = parseInt(
      this.configService.get<string>('OTP_MAX_INTENTOS', '3'),
      10,
    );

    let valido = false;
    let intentosRestantes = maxIntentos - 1;

    if (apiKey.includes('REEMPLAZAR')) {
      this.logger.warn(`[Simulación] Verificando OTP. Usa el código '000000' para aprobar.`);
      valido = dto.codigo === '000000';
      intentosRestantes = valido ? maxIntentos : 2;
    } else {
      const agResponse = await axios.post(
        `${endpoint}/otp/verify`,
        { userId: dto.uid, otpId: dto.otpId, codigo: dto.codigo },
        { headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' } },
      );
      const data = agResponse.data as { valido: boolean; intentosRestantes: number };
      valido = data.valido;
      intentosRestantes = data.intentosRestantes;
    }


    // Buscar el documento de verificación y actualizarlo
    const snapshot = await db
      .collection('verificaciones_otp')
      .where('uid', '==', dto.uid)
      .where('otpId', '==', dto.otpId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await docRef.update({
        estado: valido ? 'VERIFICADO' : 'FALLIDO',
        fechaUltimaVerificacionAdicional: FieldValue.serverTimestamp(),
      });
    }

    // Bloqueo temporal si se agotaron los intentos
    if (!valido && intentosRestantes <= 0) {
      await db.collection('autenticacion').doc(dto.uid).update({
        intentosFallidosLogin: FieldValue.increment(1),
        bloqueoTemporalHasta: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      });
      this.logger.warn(`OTP bloqueado para ${dto.uid} tras ${maxIntentos} intentos fallidos`);
    }

    return {
      valido,
      mensaje: valido
        ? 'Verificación exitosa'
        : `Código incorrecto. Intentos restantes: ${intentosRestantes}`,
    };
  }
}
