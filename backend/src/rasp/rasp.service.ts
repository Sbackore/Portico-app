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
    sesionesRecientes: object[];
    kycPendiente: boolean;
    resumenTransaccional?: {
      promedioRiesgo: number;
      ubicacionFrecuente: string;
      totalAnalizadas: number;
    };
  }> {
    const db = this.firestoreService.getDb();

    const [userDoc, segDoc, autDoc, amenazasSnap, notifSnap, transSnap] = await Promise.all([
      db.collection('usuarios').doc(userId).get(),
      db.collection('seguridad_dispositivo').doc(userId).get(),
      db.collection('autenticacion').doc(userId).get(),
      db.collection('alertas_rasp')
        .where('userId', '==', userId)
        .limit(10)
        .get(),
      db.collection('notificaciones_enviadas')
        .where('userId', '==', userId)
        .get(),
      db.collection('alertas_transacciones')
        .where('userId', '==', userId)
        .get(),
    ]);

    const userData = userDoc.data() || {};
    const kycEstado = userData.kycEstado || 'PENDIENTE';
    const kycPendiente = kycEstado !== 'APROBADO';

    // Score base: primero seguridad_dispositivo, luego usuarios, default 100
    let scoreSeguridadCuenta =
      segDoc.data()?.nivelSeguridadCuenta ??
      userData.scoreSeguridadCuenta ??
      100;

    if (kycPendiente) {
      scoreSeguridadCuenta -= 30; // Penalización por KYC
    }

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

    amenazasRecientes.sort((a, b) => b.timestampMs - a.timestampMs);

    // Filtrar sesiones recientes de las notificaciones
    const allNotifs = notifSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const sesionesRecientes = allNotifs
      .filter((n: any) => n.mensaje && /sesi[oó]n/i.test(n.mensaje))
      .map((n: any) => {
        let ts = Date.now();
        if (n.fechaHora && typeof n.fechaHora.toDate === 'function') ts = n.fechaHora.toDate().getTime();
        return {
          id: n.id,
          tipo: n.mensaje.includes('Nuevo') ? 'INICIO' : 'CIERRE',
          dispositivo: 'Navegador Web',
          timestampMs: ts,
        };
      })
      .sort((a, b) => b.timestampMs - a.timestampMs)
      .slice(0, 3);

    // Resumen Riesgo Transaccional
    const allTrans = transSnap.docs.map(d => d.data());
    const ultimasTrans = allTrans
      .map((t: any) => {
        let ts = Date.now();
        if (t.creadoEn && typeof t.creadoEn.toDate === 'function') ts = t.creadoEn.toDate().getTime();
        return { ...t, ts };
      })
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 10);
      
    let promedioRiesgo = 0;
    if (ultimasTrans.length > 0) {
      promedioRiesgo = Math.round(ultimasTrans.reduce((acc, curr) => acc + (curr.score || 0), 0) / ultimasTrans.length);
    }

    const resumenTransaccional = {
      promedioRiesgo,
      ubicacionFrecuente: ultimasTrans.length > 0 ? (ultimasTrans[0].ubicacion || 'Bogotá, CO') : 'Desconocida',
      totalAnalizadas: ultimasTrans.length,
      historialScores: ultimasTrans.map((t: any) => t.score || 0).reverse()
    };

    // Penalización dinámica por alto riesgo transaccional
    if (promedioRiesgo > 20) {
      // Restamos la mitad de los puntos que excedan el "riesgo normal" de 20.
      // Por ejemplo, si el promedio es 46, excedemos por 26. 26 / 2 = 13 puntos de penalización.
      scoreSeguridadCuenta -= Math.floor((promedioRiesgo - 20) / 2);
    }

    this.logger.log(`[RaspService] User: ${userId} -> Sesiones: ${sesionesRecientes.length}, Transacciones: ${ultimasTrans.length}, Score Final: ${Math.max(0, Math.min(100, scoreSeguridadCuenta))}`);

    return {
      scoreSeguridadCuenta: Math.max(0, Math.min(100, scoreSeguridadCuenta)),
      amenazasRecientes,
      bloqueoTemporalHasta,
      sesionesRecientes,
      kycPendiente,
      resumenTransaccional,
    };
  }
}
