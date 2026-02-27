const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');
const { getCotisationsByTontine, payerCotisation } = require('../controllers/cotisations.controller');

router.use(protect);

router.get('/tontine/:tontineId', isMember, getCotisationsByTontine);
router.post('/:cotisationId/payer', validate(schemas.payerCotisation), payerCotisation);

module.exports = router;
