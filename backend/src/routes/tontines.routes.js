const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const { validate, schemas } = require('../middlewares/validation.middleware');
const { createTontine, getMesTontines, getTontine, getMembres, startTontine, getOpenTontines, joinTontine } = require('../controllers/tontines.controller');

router.use(protect);

router.post('/', validate(schemas.createTontine), createTontine);
router.get('/me', getMesTontines);
router.get('/open', getOpenTontines);
router.get('/:tontineId', getTontine);
router.get('/:tontineId/membres', isMember, getMembres);
router.post('/:tontineId/start', isCreator, startTontine);
router.post('/:tontineId/join', joinTontine);

module.exports = router;
