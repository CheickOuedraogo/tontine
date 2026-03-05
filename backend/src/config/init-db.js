const db = require('./db');
const fs = require('fs');
const path = require('path');

const initDb = async () => {
  try {
    console.log('--- Initialisation de la base de données ---');
    
    // On vérifie si la table "User" existe déjà pour ne pas tout relancer
    const checkTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('La base de données est déjà initialisée.');
      return;
    }

    console.log('Création des tables et des types...');
    
    // Lecture du fichier schema_only.sql
    const schemaPath = path.join(__dirname, '../../schema_only.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // On nettoie un peu le SQL si nécessaire (certaines commandes psql ne passent pas en node-pg)
    // Mais pg.query peut généralement gérer plusieurs statements séparés par ;
    // Note: pg_dump peut contenir des commandes psql comme \set ou SET. 
    // On va filtrer les lignes commençant par des commandes spécifiques si besoin.
    
    await db.query(sql);
    
    console.log('Base de données initialisée avec succès !');
  } catch (err) {
    console.error('Erreur lors de l’initialisation de la base de données :', err);
    // On ne bloque pas forcément le démarrage, mais c'est critique
  }
};

module.exports = initDb;
