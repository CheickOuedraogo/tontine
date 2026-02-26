const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { inviterMembre, getInvitationDetails, accepterInvitation } = require('../controllers/invitations.controller');

router.post('/tontine/:tontineId', protect, isCreator, inviterMembre);
router.get('/:token', getInvitationDetails); // Public pour voir les détails avant inscription
router.post('/:token/accepter', protect, accepterInvitation);

module.exports = router;
