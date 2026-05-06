const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  projectId: 'portico-487201',
  credential: applicationDefault()
});

const db = getFirestore('portico-native');

async function run() {
  const usersRef = db.collection('usuarios');
  const snap = await usersRef.limit(1).get();
  if (snap.empty) {
    console.log('No users found');
    return;
  }
  const userId = snap.docs[0].id;
  console.log(`Testing with user: ${userId}`);

  const notifs = await db.collection('notificaciones_enviadas').where('userId', '==', userId).get();
  console.log(`Found ${notifs.size} notifications`);
  notifs.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });

  const trans = await db.collection('alertas_transacciones').where('userId', '==', userId).get();
  console.log(`Found ${trans.size} transactions`);
  trans.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
  
  process.exit(0);
}

run();
