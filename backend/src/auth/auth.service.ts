import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirestoreService } from '../shared/firestore/firestore.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  private otpTempStore = new Map<string, { codigo: string; email?: string }>();

  constructor(
    private readonly db: FirestoreService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const firestore = this.db.getDb();

    // Verificar si el email ya existe
    const existing = await firestore
      .collection('usuarios')
      .where('email', '==', dto.email)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new ConflictException('Ya existe una cuenta con ese correo electrónico');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const userData = {
      uid: userId,
      nombre: dto.nombre,
      documento: dto.documento,
      email: dto.email,
      telefono: dto.telefono ?? null,
      password: hashedPassword,
      creadoEn: new Date().toISOString(),
      kycEstado: 'PENDIENTE',
      scoreSeguridadCuenta: 100,
      activo: true,
      notificacionesConfig: {
        permisoNotificacionesActivo: true,
        canalesActivos: ['PUSH', 'EMAIL'],
      },
    };

    await firestore.collection('usuarios').doc(userId).set(userData);
    this.logger.log(`Usuario registrado: ${userId}`);

    const token = this.jwtService.sign({ sub: userId, email: dto.email });
    const { password: _, ...safeUser } = userData;

    return { token, user: safeUser };
  }

  async enviarOtpRegistro(email: string, telefono: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `reg-${Date.now()}`;
    
    this.otpTempStore.set(otpId, { codigo: code });
    
    this.logger.warn(`========================================================`);
    this.logger.warn(`SIMULACIÓN DE ENVÍO DE OTP (SMS/EMAIL)`);
    this.logger.warn(`Destinatarios: ${email} | ${telefono}`);
    this.logger.warn(`>>> TU CÓDIGO DE VERIFICACIÓN ES: ${code} <<<`);
    this.logger.warn(`========================================================`);

    // Limpiar en 5 minutos
    setTimeout(() => this.otpTempStore.delete(otpId), 5 * 60 * 1000);

    return { 
      otpId, 
      mensaje: 'Código enviado a tu correo y teléfono',
      codigo: code // Útil para simulación en el frontend
    };
  }

  async verificarOtpRegistro(otpId: string, codigo: string) {
    const stored = this.otpTempStore.get(otpId);
    if (stored && stored.codigo === codigo) {
      this.otpTempStore.delete(otpId);
      return { valido: true };
    }
    return { valido: false };
  }

  async enviarOtpRecuperacion(email: string) {
    const firestore = this.db.getDb();
    const snap = await firestore.collection('usuarios').where('email', '==', email).limit(1).get();

    if (snap.empty) {
      // Simular retraso y éxito falso para prevenir enumeración de correos
      await new Promise(r => setTimeout(r, 1000));
      return { otpId: `fake-${Date.now()}`, mensaje: 'Si el correo existe, te hemos enviado un código.', codigo: null };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `rec-${Date.now()}`;
    
    this.otpTempStore.set(otpId, { codigo: code, email });
    
    this.logger.warn(`========================================================`);
    this.logger.warn(`SIMULACIÓN DE RECUPERACIÓN DE CONTRASEÑA`);
    this.logger.warn(`Destinatario: ${email}`);
    this.logger.warn(`>>> TU CÓDIGO DE RECUPERACIÓN ES: ${code} <<<`);
    this.logger.warn(`========================================================`);

    setTimeout(() => this.otpTempStore.delete(otpId), 10 * 60 * 1000); // 10 mins

    return { 
      otpId, 
      mensaje: 'Si el correo existe, te hemos enviado un código.',
      codigo: code 
    };
  }
  async verificarOtpRecuperacion(otpId: string, codigo: string) {
    if (otpId.startsWith('fake-')) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    const stored = this.otpTempStore.get(otpId);
    if (!stored || stored.codigo !== codigo) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    return { valido: true };
  }

  async resetPassword(otpId: string, codigo: string, newPassword: string) {
    if (otpId.startsWith('fake-')) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    const stored = this.otpTempStore.get(otpId);
    if (!stored || stored.codigo !== codigo || !stored.email) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    const firestore = this.db.getDb();
    const snap = await firestore.collection('usuarios').where('email', '==', stored.email).limit(1).get();

    if (snap.empty) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const userDoc = snap.docs[0];
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    await userDoc.ref.update({ password: hashedNewPassword });
    
    await firestore.collection('notificaciones_enviadas').add({
      userId: userDoc.data().uid,
      mensaje: 'Recuperación de Contraseña: Tu contraseña ha sido restablecida exitosamente.',
      nivelUrgencia: 'ALTA',
      fechaHora: FieldValue.serverTimestamp(),
      leida: false,
    });
    
    this.otpTempStore.delete(otpId); // Limpiar OTP usado
    this.logger.log(`Contraseña restablecida exitosamente para: ${stored.email}`);
    
    return { success: true, mensaje: 'Contraseña actualizada correctamente' };
  }

  async login(dto: LoginDto) {
    const firestore = this.db.getDb();

    const snap = await firestore
      .collection('usuarios')
      .where('email', '==', dto.email)
      .limit(1)
      .get();

    if (snap.empty) {
      throw new UnauthorizedException('No existe una cuenta con este correo');
    }

    const doc = snap.docs[0];
    const userData = doc.data();

    if (!userData.activo) {
      throw new UnauthorizedException('Tu cuenta está desactivada. Contacta soporte.');
    }

    const valid = await bcrypt.compare(dto.password, userData.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.jwtService.sign({ sub: userData.uid, email: userData.email });
    const { password: _, ...safeUser } = userData;

    await firestore.collection('notificaciones_enviadas').add({
      userId: userData.uid,
      mensaje: 'Nuevo inicio de sesión: Se ha detectado un nuevo inicio de sesión en tu cuenta de Pórtico.',
      nivelUrgencia: 'INFORMATIVA',
      fechaHora: FieldValue.serverTimestamp(),
      leida: false,
    });

    this.logger.log(`Login exitoso: ${userData.uid}`);
    return { token, user: safeUser };
  }

  async getMe(userId: string) {
    const firestore = this.db.getDb();
    const doc = await firestore.collection('usuarios').doc(userId).get();

    if (!doc.exists) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const data = doc.data()!;
    const { password: _, ...safeUser } = data;
    return safeUser;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const firestore = this.db.getDb();
    const userRef = firestore.collection('usuarios').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const userData = doc.data()!;
    if (!userData.activo) {
      throw new UnauthorizedException('Tu cuenta está desactivada');
    }

    const valid = await bcrypt.compare(dto.oldPassword, userData.password);
    if (!valid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 12);
    await userRef.update({ password: hashedNewPassword });
    
    await firestore.collection('notificaciones_enviadas').add({
      userId,
      mensaje: 'Contraseña Actualizada: Tu contraseña ha sido cambiada exitosamente desde el panel de perfil.',
      nivelUrgencia: 'INFORMATIVA',
      fechaHora: FieldValue.serverTimestamp(),
      leida: false,
    });
    
    this.logger.log(`Contraseña actualizada para: ${userId}`);
    return { success: true };
  }

  async registerLogout(userId: string) {
    const firestore = this.db.getDb();
    await firestore.collection('notificaciones_enviadas').add({
      userId,
      mensaje: 'Sesión Cerrada: Has cerrado sesión exitosamente en tu cuenta de Pórtico.',
      nivelUrgencia: 'INFORMATIVA',
      fechaHora: FieldValue.serverTimestamp(),
      leida: false,
    });
    return { success: true };
  }
}
