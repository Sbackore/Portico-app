const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { RaspService } = require('./dist/rasp/rasp.service');
const { FirestoreService } = require('./dist/shared/firestore/firestore.service');

async function bootstrap() {
  console.log('Inicializando contexto de NestJS...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('Obteniendo servicios...');
  const raspService = app.get(RaspService);
  const firestoreService = app.get(FirestoreService);
  const db = firestoreService.getDb();

  console.log('Buscando usuario...');
  const users = await db.collection('usuarios').limit(1).get();
  const userId = 'usr_1777702094752_pwfkc1';
  console.log(`Probando con usuario ID: ${userId}`);

  try {
    const estado = await raspService.getEstado(userId);
    console.log('\n--- RESULTADO DE RASP ---');
    console.log(JSON.stringify(estado, null, 2));
    
    const allNotifs = await db.collection('notificaciones_enviadas').where('userId', '==', userId).get();
    console.log(`\nTotal Notificaciones en DB para ${userId}: ${allNotifs.size}`);
    allNotifs.forEach(doc => {
       console.log('Notif:', doc.data().mensaje);
    });
    if (!allNotifs.empty) {
      console.log('Última notif:', allNotifs.docs[allNotifs.size - 1].data());
    }

    const allTrans = await db.collection('alertas_transacciones').get();
    console.log(`\nTotal Transacciones en DB: ${allTrans.size}`);
    if (!allTrans.empty) {
      console.log('Última trans:', allTrans.docs[allTrans.size - 1].data());
    }
  } catch (err) {
    console.error(err);
  }

  await app.close();
  process.exit(0);
}
bootstrap().catch(console.error);
