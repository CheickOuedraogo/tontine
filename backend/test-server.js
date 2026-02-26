// Script de test rapide pour vérifier la configuration
require('dotenv').config();

console.log('=== Configuration Backend ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Configuré' : '✗ Manquant');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Configuré' : '✗ Manquant');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✓ Configuré' : '✗ Manquant');
console.log('MAIL_HOST:', process.env.MAIL_HOST || '✗ Manquant');
console.log('MAIL_USER:', process.env.MAIL_USER || '✗ Manquant');
console.log('PORT:', process.env.PORT || 3000);

// Test connexion DB
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('\n✗ Connexion DB échouée:', err.message);
  } else {
    console.log('\n✓ Connexion DB réussie');
  }
  pool.end();
});
