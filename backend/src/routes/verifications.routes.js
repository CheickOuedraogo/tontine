const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const {
  getMembresEnAttente,
  getTousMembres,
  validerIdentite,
  rejeterIdentite,
  soumettreVerification
} = require('../controllers/verifications.controller');

router.use(protect);

// Routes pour le créateur
router.get('/tontine/:tontineId', isCreator, getMembresEnAttente);
router.get('/tontine/:tontineId/tous', isMember, getTousMembres);
router.post('/participation/:participationId/valider', validerIdentite);
router.post('/participation/:participationId/rejeter', rejeterIdentite);

// Route pour le membre
router.post('/participation/:participationId/soumettre', soumettreVerification);

module.exports = router;
