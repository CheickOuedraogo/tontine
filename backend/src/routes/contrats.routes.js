const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const { createContrat, getContrat, signerContrat, getSignatures } = require('../controllers/contrats.controller');

router.use(protect);

router.post('/tontine/:tontineId', isCreator, createContrat);
router.get('/tontine/:tontineId', isMember, getContrat);
router.post('/:contratId/signer', signerContrat);
router.get('/:contratId/signatures', getSignatures);

module.exports = router;
