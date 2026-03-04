const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isMember } = require('../middlewares/isMember.middleware');
const { getDistributionsByTontine } = require('../controllers/distributions.controller');

router.use(protect);

router.get('/tontine/:tontineId', isMember, getDistributionsByTontine);

module.exports = router;
