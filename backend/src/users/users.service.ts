import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FirestoreService } from '../shared/firestore/firestore.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(private readonly db: FirestoreService) {}

  async getProfile(userId: string) {
    const firestore = this.db.getDb();
    const doc = await firestore.collection('usuarios').doc(userId).get();
    if (!doc.exists) throw new NotFoundException('Usuario no encontrado');
    const data = doc.data()!;
    const { password: _, ...safe } = data;
    return safe;
  }

  async updateProfile(userId: string, updates: Record<string, any>) {
    const firestore = this.db.getDb();
    const allowed = ['nombre', 'telefono', 'notificacionesConfig'];
    const filtered: Record<string, any> = {};
    allowed.forEach(k => { if (updates[k] !== undefined) filtered[k] = updates[k]; });
    filtered.actualizadoEn = new Date().toISOString();
    await firestore.collection('usuarios').doc(userId).update(filtered);
    return { actualizado: true };
  }

  async getDashboard(userId: string) {
    const firestore = this.db.getDb();

    // Cargar datos en paralelo
    const [userDoc, txSnap, alertaRaspSnap, kycSnap, notiSnap] = await Promise.all([
      firestore.collection('usuarios').doc(userId).get(),
      firestore.collection('transacciones_raw').where('userId', '==', userId).get(),
      firestore.collection('alertas_rasp').where('userId', '==', userId).get(),
      firestore.collection('proceso_kyc').where('userId', '==', userId).limit(1).get(),
      firestore.collection('notificaciones_enviadas').where('userId', '==', userId).where('leida', '==', false).get(),
    ]);

    if (!userDoc.exists) throw new NotFoundException('Usuario no encontrado');
    const user = userDoc.data()!;

    // Últimas 5 transacciones (ordenadas en memoria)
    const txns = txSnap.docs
      .map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data())
      .sort((a: Record<string, any>, b: Record<string, any>) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
      .slice(0, 5);

    // Score de seguridad
    const scoreSeg = user.scoreSeguridadCuenta ?? 100;

    // KYC estado
    const kycEstado = kycSnap.empty ? 'PENDIENTE' : kycSnap.docs[0].data().estadoProcesoBiometrico;

    // Badge alertas no leídas
    const alertasBadge = notiSnap.size;

    return {
      nombre: user.nombre,
      email: user.email,
      kycEstado,
      scoreSeguridadCuenta: scoreSeg,
      alertasBadge,
      ultimasTransacciones: txns,
    };
  }
}
