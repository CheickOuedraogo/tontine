const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const tontineQ = require('../queries/tontine.queries');
const userQ = require('../queries/user.queries');
const notifQ = require('../queries/notification.queries');
const invitationQ = require('../queries/invitation.queries');
const db = require('../config/db');

// POST /api/invitations/tontine/:tontineId
// Le créateur invite un membre par email → notification in-app
const inviterMembre = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  let { emailInvite } = req.body;
  
  // Normaliser l'email
  emailInvite = emailInvite.trim().toLowerCase();
  
  // Valider le format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInvite)) {
    throw new ApiError(400, 'Format d\'email invalide');
  }
  
  const tontine = await tontineQ.findById(tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  
  // Vérifier que l'utilisateur est le créateur
  if (tontine.creatorId !== req.user.id) {
    throw new ApiError(403, 'Seul le créateur de la tontine peut inviter des membres');
  }
  
  // Vérifier que la tontine est en attente
  if (tontine.statut !== 'EN_ATTENTE') {
    throw new ApiError(400, 'Impossible d\'inviter des membres, la tontine est déjà active');
  }
  
  // Vérifier que la tontine n'est pas pleine
  const membres = await tontineQ.findMembres(tontineId);
  if (membres.length >= tontine.nbMembresAttendu) {
    throw new ApiError(400, 'La tontine a atteint le nombre maximum de membres');
  }
  
  // Chercher l'utilisateur par email
  const invitedUser = await userQ.findByEmail(emailInvite);
  if (!invitedUser) {
    throw new ApiError(404, 'Aucun utilisateur inscrit avec cet email. Il doit d\'abord créer un compte.');
  }
  
  // Vérifier qu'il n'est pas déjà membre
  const dejaMembre = membres.find(m => m.userId === invitedUser.id);
  if (dejaMembre) {
    throw new ApiError(400, 'Cet utilisateur est déjà membre de la tontine');
  }
  
  // Vérifier qu'il n'y a pas déjà une invitation en attente
  const { rows: existingInvitations } = await db.query(
    `SELECT id FROM "Invitation" WHERE "tontineId"=$1 AND "emailInvite"=$2 AND statut='EN_ATTENTE'`,
    [tontineId, emailInvite]
  );
  
  if (existingInvitations.length > 0) {
    throw new ApiError(400, 'Une invitation est déjà en attente pour cet utilisateur');
  }
  
  // Créer l'invitation en BDD
  const dateExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invitation = await invitationQ.create({ tontineId, emailInvite, dateExpiration });
  
  // Envoyer une notification in-app à l'utilisateur invité
  const creator = await userQ.findById(req.user.id);
  await notifQ.create({
    userId: invitedUser.id,
    type: 'INVITATION_TONTINE',
    titre: 'Invitation à une tontine',
    contenu: `${creator.prenom} ${creator.nom} vous invite à rejoindre la tontine "${tontine.nom}" (${Number(tontine.montantCotisation).toLocaleString('fr-FR')} FCFA tous les ${tontine.intervalleJours} jours).`,
    lienAction: `/invitations/${invitation.id}/repondre`
  });
  
  res.status(201).json({ 
    success: true, 
    message: 'Invitation envoyée avec succès', 
    invitation 
  });
});

// GET /api/invitations/tontine/:tontineId
// Liste des invitations d'une tontine
const getInvitationsByTontine = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const invitations = await invitationQ.findByTontine(tontineId);
  res.json({ success: true, invitations });
});

// POST /api/invitations/:invitationId/accepter
// L'invité accepte l'invitation
const accepterInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;
  const invitation = await invitationQ.findById(invitationId);
  
  if (!invitation) throw new ApiError(404, 'Invitation introuvable');
  if (invitation.statut !== 'EN_ATTENTE') {
    throw new ApiError(400, 'Cette invitation a déjà été traitée');
  }
  
  // Vérifier l'expiration
  if (new Date() > new Date(invitation.dateExpiration)) {
    await invitationQ.updateStatut(invitation.id, 'EXPIREE');
    throw new ApiError(400, 'Cette invitation a expiré');
  }
  
  // Vérifier que c'est bien l'utilisateur invité
  const user = await userQ.findById(req.user.id);
  if (user.email.toLowerCase() !== invitation.emailInvite.toLowerCase()) {
    throw new ApiError(403, 'Cette invitation n\'est pas pour vous');
  }
  
  // Vérifier que la tontine est toujours en attente
  const tontine = await tontineQ.findById(invitation.tontineId);
  if (tontine.statut !== 'EN_ATTENTE') {
    throw new ApiError(400, 'Cette tontine a déjà démarré, impossible de la rejoindre');
  }
  
  // Vérifier la capacité
  const membres = await tontineQ.findMembres(invitation.tontineId);
  const dejaMembre = membres.find(m => m.userId === user.id);
  
  if (dejaMembre) {
    // Déjà membre, juste marquer l'invitation comme acceptée
    await invitationQ.updateStatut(invitation.id, 'ACCEPTEE');
    return res.json({ success: true, message: 'Vous êtes déjà membre de cette tontine' });
  }
  
  if (membres.length >= tontine.nbMembresAttendu) {
    throw new ApiError(400, 'La tontine est déjà complète');
  }
  
  // Ajouter le membre
  await tontineQ.addMembre({ userId: user.id, tontineId: invitation.tontineId });
  
  // Marquer comme acceptée
  await invitationQ.updateStatut(invitation.id, 'ACCEPTEE');
  
  // Notifier le créateur
  await notifQ.create({
    userId: tontine.creatorId,
    type: 'INVITATION_ACCEPTEE',
    titre: 'Invitation acceptée',
    contenu: `${user.prenom} ${user.nom} a accepté de rejoindre la tontine "${tontine.nom}". (${membres.length + 1}/${tontine.nbMembresAttendu} membres)`,
    lienAction: `/tontines/${tontine.id}`
  });
  
  res.json({ 
    success: true, 
    message: 'Vous avez rejoint la tontine avec succès',
    tontine: {
      id: tontine.id,
      nom: tontine.nom,
      nbMembres: membres.length + 1,
      nbMembresAttendu: tontine.nbMembresAttendu
    }
  });
});

// POST /api/invitations/:invitationId/refuser
// L'invité refuse l'invitation
const refuserInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;
  const invitation = await invitationQ.findById(invitationId);
  
  if (!invitation) throw new ApiError(404, 'Invitation introuvable');
  if (invitation.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Invitation deja traitee');
  
  const user = await userQ.findById(req.user.id);
  if (user.email !== invitation.emailInvite) {
    throw new ApiError(403, 'Cette invitation n\'est pas pour vous');
  }
  
  await invitationQ.updateStatut(invitation.id, 'REFUSEE');
  
  // Notifier le créateur
  const tontine = await tontineQ.findById(invitation.tontineId);
  await notifQ.create({
    userId: tontine.creatorId,
    type: 'INVITATION_REFUSEE',
    titre: 'Invitation refusee',
    contenu: `${user.prenom} ${user.nom} a refuse de rejoindre la tontine "${tontine.nom}".`,
    lienAction: `/tontines/${tontine.id}`
  });
  
  res.json({ success: true, message: 'Invitation refusee' });
});

// GET /api/invitations/me
// Liste des invitations reçues par l'utilisateur connecté
const getMesInvitations = asyncHandler(async (req, res) => {
  let email = req.user.email;
  
  // Fallback au cas où le token ne contient pas l'email (ancien token)
  if (!email) {
    const user = await userQ.findById(req.user.id);
    email = user?.email;
  }

  const invitations = await invitationQ.findPendingByUser(email);
  res.json({ success: true, invitations });
});

module.exports = { inviterMembre, getInvitationsByTontine, accepterInvitation, refuserInvitation, getMesInvitations };
