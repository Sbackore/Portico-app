import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private readonly logger = new Logger(FirestoreService.name);
  private db: Firestore;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIRESTORE_PROJECT_ID');
    const databaseId = this.configService.get<string>(
      'FIRESTORE_DATABASE_ID',
      '(default)',
    );

    if (!admin.apps.length) {
      // En Cloud Run usamos Application Default Credentials automáticas.
      // Si hay serviceAccountKey.json local, lo usamos para desarrollo.
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        this.logger.log('Firebase Admin inicializado con serviceAccountKey.json');
      } catch {
        admin.initializeApp({ projectId });
        this.logger.log('Firebase Admin inicializado con Application Default Credentials');
      }
    }

    // API correcta en firebase-admin v13 para conectar a una BD nombrada:
    // getFirestore(app, databaseId) en lugar de admin.firestore().settings(...)
    this.db = getFirestore(admin.app(), databaseId);
    this.logger.log(`Firestore conectado — BD: "${databaseId}", Proyecto: ${projectId}`);
  }

  getDb(): Firestore {
    return this.db;
  }
}
