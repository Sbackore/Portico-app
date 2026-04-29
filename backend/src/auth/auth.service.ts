import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirestoreService } from '../shared/firestore/firestore.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

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

  async login(dto: LoginDto) {
    const firestore = this.db.getDb();

    const snap = await firestore
      .collection('usuarios')
      .where('email', '==', dto.email)
      .limit(1)
      .get();

    if (snap.empty) {
      throw new UnauthorizedException('Credenciales incorrectas');
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
}
