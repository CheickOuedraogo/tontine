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
  
  // Vérifier que la tontine n'est pas déjà pleine
  const membres = await tontineQ.findMembres(tontineId);
  if (membres.length >= tontine.nbMembresAttendu) {
    throw new ApiError(400, 'La tontine a atteint le nombre maximum de membres');
  }
  
  const dateExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invitation = await invitationQ.create({ tontineId, emailInvite, dateExpiration });
  
  const lien = `${process.env.FRONTEND_URL}/invitation/${invitation.token}`;
  
  const htmlEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Invitation à rejoindre une tontine</h2>
      <p>Bonjour,</p>
      <p>Vous avez été invité(e) à rejoindre la tontine <strong>${tontine.nom}</strong>.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Détails de la tontine:</h3>
        <ul>
          <li><strong>Montant:</strong> ${tontine.montantCotisation} FCFA</li>
          <li><strong>Fréquence:</strong> ${tontine.frequence}</li>
          <li><strong>Durée:</strong> ${tontine.dureeTotale} cycles</li>
          <li><strong>Membres:</strong> ${membres.length}/${tontine.nbMembresAttendu}</li>
        </ul>
      </div>
      
      <p><strong>Pour accepter cette invitation:</strong></p>
      <ol>
        <li>Cliquez sur le lien ci-dessous</li>
        <li>Inscrivez-vous sur la plateforme (si ce n'est pas déjà fait)</li>
        <li>Téléchargez votre pièce d'identité (CNIB)</li>
        <li>Attendez la validation du créateur</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${lien}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Accepter l'invitation
        </a>
      </div>
      
      <p style="color: #666; font-size: 12px;">
        Cette invitation expire le ${new Date(dateExpiration).toLocaleDateString('fr-FR')}
      </p>
    </div>
  `;
  
  await sendMail(emailInvite, `Invitation à rejoindre ${tontine.nom}`, htmlEmail);
  
  res.status(201).json({ success: true, invitation });
});

// GET /api/invitations/:token
const getInvitationDetails = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invitation = await invitationQ.findByToken(token);
  
  if (!invitation) throw new ApiError(404, 'Invitation introuvable');
  if (new Date() > new Date(invitation.dateExpiration)) {
    throw new ApiError(400, 'Invitation expirée');
  }
  
  const tontine = await tontineQ.findById(invitation.tontineId);
  const membres = await tontineQ.findMembres(invitation.tontineId);
  
  res.json({
    success: true,
    invitation: {
      ...invitation,
      tontine: {
        nom: tontine.nom,
        montantCotisation: tontine.montantCotisation,
        frequence: tontine.frequence,
        dureeTotale: tontine.dureeTotale,
        nbMembresActuels: membres.length,
        nbMembresAttendu: tontine.nbMembresAttendu
      }
    }
  });
});

// POST /api/invitations/:token/accepter
// L'utilisateur doit être connecté et avoir uploadé sa CNIB
const accepterInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invitation = await invitationQ.findByToken(token);
  
  if (!invitation) throw new ApiError(404, 'Invitation introuvable');
  if (invitation.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Invitation déjà traitée');
  if (new Date() > new Date(invitation.dateExpiration)) throw new ApiError(400, 'Invitation expirée');
  
  // Vérifier que l'email de l'utilisateur connecté correspond à l'invitation
  const user = await userQ.findById(req.user.id);
  if (user.email !== invitation.emailInvite) {
    throw new ApiError(403, 'Cette invitation n\'est pas pour vous');
  }
  
  // Vérifier que l'utilisateur a uploadé sa CNIB
  if (!user.urlCnib) {
    throw new ApiError(400, 'Vous devez d\'abord uploader votre pièce d\'identité (CNIB)');
  }
  
  // Ajouter l'utilisateur à la tontine avec statut EN_ATTENTE pour vérification
  await tontineQ.addMembre({ userId: user.id, tontineId: invitation.tontineId });
  await invitationQ.updateStatut(invitation.id, 'ACCEPTEE');
  
  // Notifier le créateur
  const tontine = await tontineQ.findById(invitation.tontineId);
  const notifQ = require('../queries/notification.queries');
  await notifQ.create({
    userId: tontine.creatorId,
    type: 'NOUVELLE_DEMANDE_ADHESION',
    titre: 'Nouvelle demande d\'adhésion',
    contenu: `${user.prenom} ${user.nom} souhaite rejoindre ${tontine.nom}. Vérifiez son identité.`,
    lienAction: `/tontines/${tontine.id}/verifications`
  });
  
  res.json({
    success: true,
    message: 'Demande envoyée. En attente de validation du créateur.'
  });
});

module.exports = { inviterMembre, getInvitationDetails, accepterInvitation };
