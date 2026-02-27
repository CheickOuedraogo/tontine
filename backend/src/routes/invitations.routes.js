const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { inviterMembre, accepterInvitation } = require('../controllers/invitations.controller');

router.post('/tontine/:tontineId', protect, isCreator, inviterMembre);
router.post('/:token/accepter', protect, accepterInvitation);

module.exports = router;
