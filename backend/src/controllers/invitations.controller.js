const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const invitationQ = require('../queries/invitation.queries');
const tontineQ = require('../queries/tontine.queries');
const userQ = require('../queries/user.queries');
const { sendMail } = require('../config/mailer');

// POST /api/invitations/tontine/:tontineId
const inviterMembre = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const { emailInvite } = req.body;
  
  const tontine = await tontineQ.findById(tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  
  const dateExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invitation = await invitationQ.create({ tontineId, emailInvite, dateExpiration });
  
  const lien = `${process.env.FRONTEND_URL}/invitations/${invitation.token}`;
  await sendMail(emailInvite, 'Invitation tontine', `Vous etes invite a rejoindre ${tontine.nom}. Cliquez ici: ${lien}`);
  
  res.status(201).json({ success: true, invitation });
});

// POST /api/invitations/:token/accepter
const accepterInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invitation = await invitationQ.findByToken(token);
  
  if (!invitation) throw new ApiError(404, 'Invitation introuvable');
  if (invitation.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Invitation deja traitee');
  if (new Date() > new Date(invitation.dateExpiration)) throw new ApiError(400, 'Invitation expiree');
  
  const user = await userQ.findByEmail(invitation.emailInvite);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  
  await tontineQ.addMembre({ userId: user.id, tontineId: invitation.tontineId });
  await invitationQ.updateStatut(invitation.id, 'ACCEPTEE');
  
  res.json({ success: true, message: 'Invitation acceptee' });
});

module.exports = { inviterMembre, accepterInvitation };
