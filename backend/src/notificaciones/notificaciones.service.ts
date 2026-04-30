import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FirestoreService } from '../shared/firestore/firestore.service';
import { EnviarNotificacionDto } from './dto/enviar-notificacion.dto';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  // Matriz de canales activos según nivel de urgencia
  private readonly matrizCanales: Record<string, string[]> = {
    INFORMATIVA: ['PUSH'],
    MODERADA: ['PUSH', 'EMAIL'],
    ALTA: ['PUSH', 'WHATSAPP', 'SMS', 'EMAIL'],
    INMEDIATA: ['PUSH', 'WHATSAPP', 'SMS', 'EMAIL'],
  };

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Envía una notificación push accionable mediante Antigravity Notify.
   * Selecciona los canales según el nivelUrgencia de la alerta.
   * Registra la entrega en la colección notificaciones_enviadas.
   */
  async enviarNotificacion(
    dto: EnviarNotificacionDto,
  ): Promise<{ enviado: boolean; canalesUsados: string[] }> {
    const db = this.firestoreService.getDb();
    const endpoint = this.configService.get<string>('AG_NOTIFY_ENDPOINT');
    const apiKey = this.configService.get<string>('AG_NOTIFY_API_KEY') || 'REEMPLAZAR';

    const [userSnap, configSnap] = await Promise.all([
      db.collection('usuarios').doc(dto.userId).get(),
      db.collection('notificaciones_config').doc(dto.userId).get(),
    ]);

    const fcmToken = userSnap.data()?.fcmToken;
    const config = configSnap.data();

    if (!config?.permisoNotificacionesActivo && dto.nivelUrgencia !== 'INMEDIATA') {
      this.logger.warn(
        `Notificación omitida para ${dto.userId}: permisos desactivados`,
      );
      return { enviado: false, canalesUsados: [] };
    }

    const emoji = dto.colorIndicador === 'ROJO' ? '🔴' : dto.colorIndicador === 'NARANJA' ? '🟠' : '🟡';
    const canales = dto.forzarTodosCanales
      ? ['PUSH', 'WHATSAPP', 'SMS', 'EMAIL']
      : (this.matrizCanales[dto.nivelUrgencia] || ['PUSH']);

    const payload = {
      userId: dto.userId,
      fcmToken,
      titulo: `${emoji} Alerta ${dto.nivelUrgencia}`,
      cuerpo: `$${dto.monto} en ${dto.comercio}`,
      acciones: ['CONFIRMAR', 'REPORTAR', 'BLOQUEAR'],
      alertaId: dto.alertaId,
      prioridad: dto.nivelUrgencia === 'INMEDIATA' ? 'high' : 'normal',
      canales,
    };

    if (apiKey.includes('REEMPLAZAR')) {
      this.logger.warn('[Simulación] API Key no configurada. Simulando envío de notificación Push.');
    } else {
      await axios.post(`${endpoint}/send`, payload, {
        headers: { 'X-API-Key': apiKey },
      });
    }

    // Persistir siempre en Firestore para que el historial sea visible
    await db.collection('notificaciones_enviadas').add({
      userId: dto.userId,
      mensaje: `${emoji} ${payload.cuerpo}`,
      nivelUrgencia: dto.nivelUrgencia,
      comercio: dto.comercio,
      monto: dto.monto,
      alertaId: dto.alertaId,
      canalesUsados: canales,
      leida: false,
      enviado: !apiKey.includes('REEMPLAZAR'),
      fechaHora: new Date().toISOString(),
      enviadaEn: FieldValue.serverTimestamp(),
    });

    this.logger.log(
      `Notificación enviada a ${dto.userId}: nivel=${dto.nivelUrgencia}, canales=${canales.join(',')}`,
    );

    return { enviado: true, canalesUsados: canales };
  }

  /**
   * Retorna el historial de notificaciones del usuario desde Firestore.
   */
  async getHistorial(userId: string): Promise<object[]> {
    const db = this.firestoreService.getDb();

    const snap = await db
      .collection('notificaciones_enviadas')
      .where('userId', '==', userId)
      .limit(50)
      .get();

    const notificaciones = snap.docs.map((doc) => {
      const data = doc.data();

      // Normalizar fechaHora
      let fechaHora: string;
      if (data.fechaHora && typeof data.fechaHora.toDate === 'function') {
        fechaHora = data.fechaHora.toDate().toISOString();
      } else if (data.enviadaEn && typeof data.enviadaEn.toDate === 'function') {
        fechaHora = data.enviadaEn.toDate().toISOString();
      } else if (typeof data.fechaHora === 'string') {
        fechaHora = data.fechaHora;
      } else {
        fechaHora = new Date().toISOString();
      }

      return {
        id: doc.id,
        alertaId: data.alertaId || doc.id,
        comercio: data.comercio || null,
        monto: data.monto || null,
        nivelUrgencia: data.nivelUrgencia || 'INFORMATIVA',
        mensaje: data.mensaje || data.cuerpo || 'Notificación recibida',
        fechaHora,
        leida: data.leida ?? false,
        enviado: data.enviado ?? true,
      };
    });

    // Ordenar por fecha descendente
    notificaciones.sort(
      (a, b) =>
        new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
    );

    return notificaciones;
  }

  /**
   * Actualiza la configuración de notificaciones del usuario en Firestore.
   */
  async actualizarConfiguracion(
    userId: string,
    config: Record<string, unknown>,
  ): Promise<{ actualizado: boolean }> {
    const db = this.firestoreService.getDb();
    await db
      .collection('notificaciones_config')
      .doc(userId)
      .set(config, { merge: true });

    this.logger.log(`Configuración de notificaciones actualizada para ${userId}`);
    return { actualizado: true };
  }
}
