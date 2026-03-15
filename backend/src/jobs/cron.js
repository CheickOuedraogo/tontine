const cron = require('node-cron');
const db = require('../config/db');
const notifQ = require('../queries/notification.queries');

// Rappel J-3 : tous les jours a 8h
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Rappels J-3...');
  // TODO: requete cotisations dont datePrevue = TODAY + 3 AND statut = EN_ATTENTE
});

// Rappel J-1 : tous les jours a 8h
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Rappels J-1...');
  // TODO: requete cotisations dont datePrevue = TODAY + 1 AND statut = EN_ATTENTE
});

// Distributions automatiques : à 23h59 chaque jour
cron.schedule('59 23 * * *', async () => {
  console.log('[CRON] Traitement des distributions automatiques...');
  try {
    // 1. Trouver les distributions planifiées dont la date est passée ou aujourd'hui
    const { rows: dists } = await db.query(
      `UPDATE "Distribution" 
       SET statut = 'EFFECTUEE', "dateEffective" = NOW() 
       WHERE statut = 'PLANIFIEE' AND "datePrevue" <= NOW() 
       RETURNING *`
    );

    for (const dist of dists) {
      // 2. Notifier le bénéficiaire
      await notifQ.create({
        userId: dist.beneficiaireId,
        type: 'DISTRIBUTION_EFFECTUEE',
        titre: 'Distribution reçue',
        contenu: `La distribution de ${Number(dist.montantNet).toLocaleString('fr-FR')} FCFA pour le tour ${dist.cycleNumero} a été effectuée.`,
        lienAction: `/tontines/${dist.tontineId}/distributions`
      });
    }
    
    if (dists.length > 0) {
      console.log(`[CRON] ${dists.length} distributions effectuées.`);
    }
  } catch (err) {
    console.error('[CRON] Erreur distribution:', err);
  }
});
