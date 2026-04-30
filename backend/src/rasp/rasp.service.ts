import { Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from '../shared/firestore/firestore.service';
import { AlertaRaspDto } from './dto/alerta-rasp.dto';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class RaspService {
  private readonly logger = new Logger(RaspService.name);

  // Degradación del score de seguridad según severidad de amenaza
  private readonly deltaSeguridadPorSeveridad: Record<string, number> = {
    CRITICA: -40,
    ALTA: -20,
    MEDIA: -10,
    BAJA: -5,
  };

  constructor(private readonly firestoreService: FirestoreService) {}

  /**
   * Procesa una alerta del SDK Antigravity Shield.
   * 1. Registra la amenaza en alertas_rasp.
   * 2. Degrada el nivelSeguridadCuenta en seguridad_dispositivo.
   * 3. Si es CRÍTICA: bloquea sesiones activas por 2 horas.
   */
  async procesarAlertaRasp(
    dto: AlertaRaspDto,
  ): Promise<{ procesado: boolean; accionTomada: string }> {
    const db = this.firestoreService.getDb();

    // 1. Registrar la alerta
    await db.collection('alertas_rasp').add({
      userId: dto.userId,
      tipoAmenaza: dto.tipoAmenaza,
      severidad: dto.severidad,
      dispositivo: dto.dispositivo || 'desconocido',
      tiempoEvaluacionMs: dto.timestampMs || Date.now(),
      accionAutomatica: dto.severidad === 'CRITICA',
      impactoRendimiento: 'BAJO',
      detectadoEn: FieldValue.serverTimestamp(),
    });

    // 2. Degradar el score de seguridad del dispositivo
    const delta =
      this.deltaSeguridadPorSeveridad[dto.severidad] ??
      this.deltaSeguridadPorSeveridad['BAJA'];

    const segRef = db.collection('seguridad_dispositivo').doc(dto.userId);
    await segRef.set(
      { nivelSeguridadCuenta: FieldValue.increment(delta) },
      { merge: true },
    );

    let accionTomada = `Score degradado en ${delta} puntos`;

    // 3. Si la amenaza es crítica, bloquear sesiones por 2 horas
    if (dto.severidad === 'CRITICA') {
      const bloqueoHasta = new Date(Date.now() + 2 * 60 * 60 * 1000);
      await db.collection('autenticacion').doc(dto.userId).set(
        {
          sesionesActivas: [],
          estadoRecuperacionCuenta: 'BLOQUEADO_SEGURIDAD',
          bloqueoTemporalHasta: bloqueoHasta,
        },
        { merge: true },
      );
      accionTomada = `Sesiones revocadas. Bloqueo hasta: ${bloqueoHasta.toISOString()}`;
      this.logger.error(
        `AMENAZA CRÍTICA para ${dto.userId}: ${dto.tipoAmenaza}. ${accionTomada}`,
      );
    } else {
      this.logger.warn(
        `Amenaza ${dto.severidad} para ${dto.userId}: ${dto.tipoAmenaza}`,
      );
    }

    return { procesado: true, accionTomada };
  }

  /**
   * Retorna el estado de seguridad del usuario:
   * score, amenazas recientes y si hay bloqueo activo.
   */
  async getEstado(userId: string): Promise<{
    scoreSeguridadCuenta: number;
    amenazasRecientes: object[];
    bloqueoTemporalHasta?: string;
  }> {
    const db = this.firestoreService.getDb();

    const [userDoc, segDoc, autDoc, amenazasSnap] = await Promise.all([
      db.collection('usuarios').doc(userId).get(),
      db.collection('seguridad_dispositivo').doc(userId).get(),
      db.collection('autenticacion').doc(userId).get(),
      db.collection('alertas_rasp')
        .where('userId', '==', userId)
        .limit(10)
        .get(),
    ]);

    // Score: primero seguridad_dispositivo, luego usuarios, default 100
    const scoreSeguridadCuenta =
      segDoc.data()?.nivelSeguridadCuenta ??
      userDoc.data()?.scoreSeguridadCuenta ??
      100;

    // Bloqueo activo
    let bloqueoTemporalHasta: string | undefined;
    const bloqueoRaw = autDoc.data()?.bloqueoTemporalHasta;
    if (bloqueoRaw) {
      if (typeof bloqueoRaw.toDate === 'function') {
        bloqueoTemporalHasta = bloqueoRaw.toDate().toISOString();
      } else if (bloqueoRaw instanceof Date) {
        bloqueoTemporalHasta = bloqueoRaw.toISOString();
      } else {
        bloqueoTemporalHasta = String(bloqueoRaw);
      }
    }

    // Amenazas recientes
    const amenazasRecientes = amenazasSnap.docs.map((doc) => {
      const d = doc.data();
      let timestampMs: number;
      if (d.detectadoEn && typeof d.detectadoEn.toDate === 'function') {
        timestampMs = d.detectadoEn.toDate().getTime();
      } else {
        timestampMs = d.tiempoEvaluacionMs || Date.now();
      }
      return {
        id: doc.id,
        tipoAmenaza: d.tipoAmenaza || 'DESCONOCIDA',
        severidad: d.severidad || 'BAJA',
        accionTomada: d.accionAutomatica
          ? 'Acción automática ejecutada'
          : 'Registrado sin acción',
        timestampMs,
      };
    });

    // Ordenar por fecha descendente
    amenazasRecientes.sort((a, b) => b.timestampMs - a.timestampMs);

    return {
      scoreSeguridadCuenta: Math.max(0, Math.min(100, scoreSeguridadCuenta)),
      amenazasRecientes,
      bloqueoTemporalHasta,
    };
  }
}
