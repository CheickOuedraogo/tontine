const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const resetDb = async () => {
    const client = await pool.connect();
    try {
        console.log('--- Réinitialisation de la base de données ---');
        
        // Liste des tables à vider (l'ordre n'importe pas trop avec CASCADE)
        const tables = [
            'Notification',
            'Message',
            'Distribution',
            'Cotisation',
            'Participation',
            'Invitation',
            'Tontine',
            'User'
        ];

        for (const table of tables) {
            console.log(`Vidinig table "${table}"...`);
            await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
        }

        console.log('--- Réinitialisation terminée avec succès ! ---');
    } catch (err) {
        console.error('Erreur lors de la réinitialisation :', err);
    } finally {
        client.release();
        await pool.end();
    }
};

resetDb();
