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

    // Obtener FCM token y config de notificaciones del usuario
    const [userSnap, configSnap] = await Promise.all([
      db.collection('usuarios').doc(dto.userId).get(),
      db.collection('notificaciones_config').doc(dto.userId).get(),
    ]);

    const fcmToken = userSnap.data()?.fcmToken;
    const config = configSnap.data();

    // Si el usuario no tiene permisos activos y no es urgencia forzada, omitir
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


    // Persistir la entrega en Firestore (solo cuando la API real está activa)
    if (!apiKey.includes('REEMPLAZAR')) {
      await db.collection('notificaciones_enviadas').add({
        ...payload,
        enviadaEn: FieldValue.serverTimestamp(),
        estado: 'ENTREGADA',
      });
    } else {
      this.logger.log(
        `[Simulación] Notificación registrada solo en log (BD no disponible en modo prueba).`,
      );
    }


    this.logger.log(
      `Notificación enviada a ${dto.userId}: nivel=${dto.nivelUrgencia}, canales=${canales.join(',')}`,
    );

    return { enviado: true, canalesUsados: canales };
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
