import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`Statut HTTP: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Corps de la réponse:', data);
    if (res.statusCode === 200 && data === 'OK') {
      console.log('✅ Health check OK');
      process.exit(0);
    } else {
      console.error('❌ Health check FAILED');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Erreur de requête HTTP:', error);
  process.exit(1);
});

req.end();
