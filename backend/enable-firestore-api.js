const { execSync } = require('child_process');

async function enableApi() {
  try {
    console.log('Obteniendo token de gcloud...');
    const token = execSync('gcloud auth print-access-token').toString().trim();
    
    const url = 'https://firestore.googleapis.com/v1/projects/portico-487201/databases/portico-native?updateMask=firestoreDataAccessMode';
    const body = JSON.stringify({ firestoreDataAccessMode: 'DATA_ACCESS_MODE_ENABLED' });
    
    console.log('Enviando petición PATCH a la API de Firestore Management...');
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body
    });
    
    const result = await response.json();
    console.log('Resultado de la operacion:', JSON.stringify(result, null, 2));
    if (result.error) {
       console.error('Falló la activación:', result.error.message);
    } else {
       console.log('¡API Native Data Access HABILITADO exitosamente!');
    }
  } catch (error) {
    console.error('Error ejecutando el script:', error);
  }
}

enableApi();
