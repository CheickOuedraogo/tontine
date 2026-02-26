const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');
const { getCotisationsByTontine, payerCotisation, simulerPaiement } = require('../controllers/cotisations.controller');

router.use(protect);

router.get('/tontine/:tontineId', isMember, getCotisationsByTontine);
router.post('/:cotisationId/payer', validate(schemas.payerCotisation), payerCotisation);
router.post('/:cotisationId/simuler-paiement', simulerPaiement); // Simulation de paiement

module.exports = router;
