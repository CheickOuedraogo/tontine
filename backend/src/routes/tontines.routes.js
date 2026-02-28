const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');
const { 
  createTontine, getMesTontines, getTontine, getMembres, startTontine,
  demanderDeblocage, validerDeblocage, quitterEtRetirer
} = require('../controllers/tontines.controller');

router.use(protect);

router.post('/', validate(schemas.createTontine), createTontine);
router.get('/me', getMesTontines);
router.get('/:tontineId', isMember, getTontine);
router.get('/:tontineId/membres', isMember, getMembres);
router.post('/:tontineId/start', isCreator, startTontine);

// Routes de déblocage (Achat Commun)
router.post('/:tontineId/demander-deblocage', isCreator, demanderDeblocage);
router.post('/:tontineId/valider-deblocage', isMember, validerDeblocage);
router.post('/:tontineId/quitter', isMember, quitterEtRetirer);

module.exports = router;

