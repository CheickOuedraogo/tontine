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

// Distributions automatiques : tous les jours a 9h
cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Distributions...');
  // TODO: requete distributions dont datePrevue <= TODAY AND statut = PLANIFIEE
});
