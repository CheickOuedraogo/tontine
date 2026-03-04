const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { isCreator } = require('../middlewares/isCreator.middleware');
const { inviterMembre, getInvitationsByTontine, accepterInvitation, refuserInvitation, getMesInvitations } = require('../controllers/invitations.controller');

router.use(protect);

// Le créateur invite un membre
router.post('/tontine/:tontineId', isCreator, inviterMembre);

// Liste des invitations d'une tontine
router.get('/tontine/:tontineId', getInvitationsByTontine);

// Liste des invitations reçues par l'utilisateur
router.get('/me', getMesInvitations);

// L'invité accepte ou refuse
router.post('/:invitationId/accepter', accepterInvitation);
router.post('/:invitationId/refuser', refuserInvitation);

module.exports = router;
