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
}
