const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');
const { 
  createTontine, getMesTontines, getTontine, getMembres, startTontine,
  joinTontine, deleteTontine, removeMember, updateMembresOrdre
} = require('../controllers/tontines.controller');

router.use(protect);

router.post('/', validate(schemas.createTontine), createTontine);
router.get('/me', getMesTontines);
router.get('/:tontineId', getTontine);
router.get('/:tontineId/membres', isMember, getMembres);
router.put('/:tontineId/membres/ordre', isCreator, updateMembresOrdre);
router.post('/:tontineId/start', isCreator, startTontine);
router.post('/:tontineId/join', joinTontine);
router.delete('/:tontineId/membres/:userId', isCreator, removeMember);
router.delete('/:tontineId', isCreator, deleteTontine);

module.exports = router;
