import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FirestoreService } from '../shared/firestore/firestore.service';
import { WebhookTransaccionDto } from './dto/webhook-transaccion.dto';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class BankingService {
  private readonly logger = new Logger(BankingService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fórmula de riesgo: R = α(A) + β(L) + γ(V) + δ(D)
   * A = Anomalía de monto (vs. promedio histórico)  peso: 0.35
   * L = Inconsistencia de ubicación                  peso: 0.25
   * V = Velocidad transaccional (volumen reciente)   peso: 0.25
   * D = Factor de dispositivo (0=confiable,100=nuevo)peso: 0.15
   */
  private calcularPuntajeRiesgo(
    monto: number,
    promedioHistorico: number,
    countUltimas4h: number,
    factorDispositivo: number = 0,
  ): number {
    // A — Anomalía de monto: qué tan desviado está respecto al promedio
    let A = 0;
    if (promedioHistorico > 0) {
      const desviacion = Math.abs(monto - promedioHistorico) / promedioHistorico;
      A = Math.min(desviacion * 100, 100);
    }

    // L — Inconsistencia de ubicación: placeholder (100 = distancia muy grande)
    // En producción recibir las coordenadas y calcular distancia desde última txn
    const L = 0;

    // V — Velocidad: más de 5 transacciones en 4h = riesgo máximo
    const V = Math.min(countUltimas4h * 20, 100);

    // D — Factor de dispositivo (viene delDTO)
    const D = factorDispositivo;

    const score = 0.35 * A + 0.25 * L + 0.25 * V + 0.15 * D;
    return Math.round(score);
  }

  /**
   * Procesa el webhook de nueva transacción de Antigravity Banking.
   * 1. Persiste la transacción raw en Firestore.
   * 2. Calcula el score de riesgo.
   * 3. Si supera el umbral, crea una alerta.
   */
  async procesarWebhookTransaccion(
    dto: WebhookTransaccionDto,
  ): Promise<{ processed: boolean; score: number }> {
    const db = this.firestoreService.getDb();
    const umbralDefault = parseInt(
      this.configService.get<string>('RIESGO_UMBRAL_DEFAULT_COP', '500000'),
      10,
    );

    // 1. Persistir transacción raw
    const txnRef = db.collection('transacciones_raw').doc(dto.idTransaccion);
    await txnRef.set({
      ...dto,
      ingeridoEn: FieldValue.serverTimestamp(),
    });

    // 2. Obtener historial reciente del usuario (últimas 30 txns)
    const historial = await db
      .collection('transacciones_raw')
      .where('userId', '==', dto.userId)
      .orderBy('fechaHora', 'desc')
      .limit(30)
      .get();

    // Calcular promedio histórico de montos
    let totalMonto = 0;
    let countUltimas4h = 0;
    const hace4h = Date.now() - 4 * 60 * 60 * 1000;

    historial.forEach((doc) => {
      const data = doc.data();
      totalMonto += data.monto || 0;
      if (new Date(data.fechaHora).getTime() > hace4h) {
        countUltimas4h++;
      }
    });

    const promedioHistorico =
      historial.size > 0 ? totalMonto / historial.size : dto.monto;

    // 3. Calcular score
    const score = this.calcularPuntajeRiesgo(
      dto.monto,
      promedioHistorico,
      countUltimas4h,
      dto.factorDispositivo,
    );

    // 4. Obtener umbral configurado por el usuario
    const configDoc = await db.collection('config_monitoreo').doc(dto.userId).get();
    const umbralUsuario = configDoc.data()?.montoUmbralAlerta ?? umbralDefault;

    // 5. Crear alerta si el score o el monto supera el umbral
    if (score > 40 || dto.monto > umbralUsuario) {
      let nivelUrgencia: string;
      let colorIndicador: string;

      if (score > 80) {
        nivelUrgencia = 'INMEDIATA';
        colorIndicador = 'ROJO';
      } else if (score > 60) {
        nivelUrgencia = 'ALTA';
        colorIndicador = 'NARANJA';
      } else {
        nivelUrgencia = 'MODERADA';
        colorIndicador = 'AMARILLO';
      }

      await db.collection('alertas_transacciones').add({
        idTransaccion: dto.idTransaccion,
        userId: dto.userId,
        monto: dto.monto,
        comercio: dto.comercio,
        fechaHora: new Date(dto.fechaHora),
        puntajeRiesgo: score,
        nivelUrgencia,
        estadoAlerta: 'PENDIENTE',
        colorIndicador,
        creadoEn: FieldValue.serverTimestamp(),
      });

      this.logger.warn(
        `Alerta creada para ${dto.userId}: score=${score}, nivel=${nivelUrgencia}, monto=${dto.monto}`,
      );
    }

    this.logger.log(`Transacción ${dto.idTransaccion} procesada. Score: ${score}`);
    return { processed: true, score };
  }

  /**
   * Crea un Recurrent Link en Antigravity Banking para el usuario.
   * El usuario debe haber completado el flujo OAuth de Antigravity previamente.
   */
  async crearRecurrentLink(
    userId: string,
    authCode: string,
  ): Promise<{ linkId: string }> {
    const db = this.firestoreService.getDb();
    const endpoint = this.configService.get<string>('AG_BANKING_ENDPOINT');
    const apiKey = this.configService.get<string>('AG_BANKING_API_KEY');

    const response = await axios.post(
      `${endpoint}/links/recurrent`,
      { userId, authCode },
      { headers: { 'X-API-Key': apiKey } },
    );

    const { linkId } = response.data as { linkId: string };

    // Guardar el linkId en Firestore
    await db
      .collection('cuentas_bancarias')
      .doc(userId)
      .set({ linkId, creadoEn: FieldValue.serverTimestamp() }, { merge: true });

    this.logger.log(`Recurrent Link creado para ${userId}: ${linkId}`);
    return { linkId };
  }
}
