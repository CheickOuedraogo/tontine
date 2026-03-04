const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const tontineQ = require('../queries/tontine.queries');
const cotisationQ = require('../queries/cotisation.queries');
const distributionQ = require('../queries/distribution.queries');
const notifQ = require('../queries/notification.queries');
const db = require('../config/db');
const { calculerDatesCycles, genererOrdreAleatoire } = require('../utils/helpers');

// POST /api/tontines
const createTontine = asyncHandler(async (req, res) => {
  const { nom, montantCotisation, intervalleJours, nbMembresAttendu } = req.body;
  const tontine = await tontineQ.create({
    nom, montantCotisation, intervalleJours, nbMembresAttendu,
    creatorId: req.user.id
  });
  
  await tontineQ.addMembre({ userId: req.user.id, tontineId: tontine.id });

  res.status(201).json({ success: true, tontine });
});

// GET /api/tontines/me
const getMesTontines = asyncHandler(async (req, res) => {
  const tontines = await tontineQ.findByMembre(req.user.id);
  res.json({ success: true, tontines });
});

// GET /api/tontines/:tontineId
const getTontine = asyncHandler(async (req, res) => {
  const tontine = await tontineQ.findById(req.params.tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  res.json({ success: true, tontine });
});

// GET /api/tontines/:tontineId/membres
const getMembres = asyncHandler(async (req, res) => {
  const membres = await tontineQ.findMembres(req.params.tontineId);
  res.json({ success: true, membres });
});

// POST /api/tontines/:tontineId/start
const startTontine = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const tontine = await tontineQ.findById(tontineId);
  
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  
  // Vérifier que l'utilisateur est le créateur
  if (tontine.creatorId !== req.user.id) {
    throw new ApiError(403, 'Seul le créateur de la tontine peut la démarrer');
  }
  
  if (tontine.statut !== 'EN_ATTENTE') {
    throw new ApiError(400, `Cette tontine est déjà ${tontine.statut === 'ACTIVE' ? 'active' : 'terminée'}`);
  }
  
  const membres = await tontineQ.findMembres(tontineId);
  if (membres.length < 2) {
    throw new ApiError(400, 'Il faut au moins 2 membres pour démarrer une tontine');
  }
  
  // Vérifier que tous les membres ont signé le contrat (si un contrat existe)
  const { rows: contrats } = await db.query(
    `SELECT id FROM "Contrat" WHERE "tontineId"=$1`, [tontineId]
  );
  
  if (contrats.length > 0) {
    const membresNonSignes = membres.filter(m => !m.aSigneContrat);
    if (membresNonSignes.length > 0) {
      throw new ApiError(400, `${membresNonSignes.length} membre(s) n'ont pas encore signé le contrat`);
    }
  }
  
  // Vérifier si un ordre manuel a été défini
  const hasManualOrder = membres.every(m => m.ordreDistribution !== null && m.ordreDistribution !== undefined);
  
  if (!hasManualOrder) {
    // Générer l'ordre de distribution aléatoire seulement si pas d'ordre manuel
    const ordre = genererOrdreAleatoire(membres.map(m => m.userId));
    for (let i = 0; i < ordre.length; i++) {
      await db.query(
        `UPDATE "Participation" SET "ordreDistribution"=$1 WHERE "userId"=$2 AND "tontineId"=$3`, 
        [i + 1, ordre[i], tontineId]
      );
    }
  }
  
  // Récupérer les membres avec leur ordre mis à jour
  const updatedMembres = await tontineQ.findMembres(tontineId);
  
  // Utiliser la date actuelle par défaut
  const dateDebut = new Date();
  const realNbMembres = updatedMembres.length;
  const dureeTotale = realNbMembres; // Chaque membre reçoit exactement une fois
  
  // Mettre à jour la tontine avec les vraies valeurs
  await db.query(
    `UPDATE "Tontine" SET "dureeTotale"=$1, "nbMembresAttendu"=$2, "dateDebut"=$3, statut='ACTIVE' WHERE id=$4`,
    [dureeTotale, realNbMembres, dateDebut, tontineId]
  );

  const datesCycles = calculerDatesCycles(dateDebut, tontine.intervalleJours, dureeTotale);
  
  const cotisations = [];
  const distributions = [];

  // Trier les membres par ordre de distribution
  const membresTries = [...updatedMembres].sort((a, b) => a.ordreDistribution - b.ordreDistribution);

  // Générer les cotisations et distributions pour tous les cycles
  for (let turn = 0; turn < dureeTotale; turn++) {
    // Chaque membre paie à chaque tour
    for (const m of updatedMembres) {
      cotisations.push({
        participationId: m.id,
        tontineId,
        montant: tontine.montantCotisation,
        datePrevue: datesCycles[turn],
        cycleNumero: turn + 1
      });
    }

    // Un seul bénéficiaire par tour (selon l'ordre trié)
    const benefIndex = turn % membresTries.length;
    const beneficiaire = membresTries[benefIndex];
    
    const montantBrut = tontine.montantCotisation * updatedMembres.length;
    
    distributions.push({
      tontineId,
      beneficiaireId: beneficiaire.userId,
      montantBrut,
      montantFrais: 0,
      montantNet: montantBrut,
      datePrevue: datesCycles[turn],
      cycleNumero: turn + 1,
      statut: 'PLANIFIEE'
    });
  }

  // Insérer en masse
  await cotisationQ.createBulk(cotisations);
  await distributionQ.createBulk(distributions);
  
  // Notifier tous les membres
  for (const m of updatedMembres) {
    await notifQ.create({
      userId: m.userId,
      type: 'TONTINE_DEMARREE',
      titre: 'Tontine démarrée',
      contenu: `La tontine "${tontine.nom}" a démarré ! Vous êtes en position ${m.ordreDistribution} pour recevoir votre distribution.`,
      lienAction: `/tontines/${tontineId}`
    });
  }
  
  res.json({ 
    success: true, 
    message: 'Tontine démarrée avec succès',
    tontine: {
      id: tontineId,
      nbMembres: realNbMembres,
      dureeTotale,
      dateDebut
    }
  });
});

// POST /api/tontines/:tontineId/join
const joinTontine = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const tontine = await tontineQ.findById(tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  if (tontine.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Cette tontine n\'accepte plus de membres');
  
  const membres = await tontineQ.findMembres(tontineId);
  if (membres.length >= tontine.nbMembresAttendu) throw new ApiError(400, 'La tontine est complete');
  
  const dejaMembreCheck = membres.find(m => m.userId === req.user.id);
  if (dejaMembreCheck) throw new ApiError(400, 'Vous etes deja membre de cette tontine');
  
  await tontineQ.addMembre({ userId: req.user.id, tontineId });
  
  res.json({ success: true, message: 'Vous avez rejoint la tontine' });
});

// DELETE /api/tontines/:tontineId
const deleteTontine = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const tontine = await tontineQ.findById(tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  if (tontine.creatorId !== req.user.id) throw new ApiError(403, 'Seul le createur peut supprimer la tontine');
  if (tontine.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Impossible de supprimer une tontine active');
  
  await tontineQ.deleteTontine(tontineId);
  res.json({ success: true, message: 'Tontine supprimee' });
});

// DELETE /api/tontines/:tontineId/membres/:userId
const removeMember = asyncHandler(async (req, res) => {
  const { tontineId, userId } = req.params;
  const tontine = await tontineQ.findById(tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  if (tontine.creatorId !== req.user.id) throw new ApiError(403, 'Seul le createur peut retirer un membre');
  if (tontine.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Impossible de retirer un membre d\'une tontine active');
  if (userId === tontine.creatorId) throw new ApiError(400, 'Le createur ne peut pas se retirer lui-meme');

  await tontineQ.removeMembre(tontineId, userId);
  res.json({ success: true, message: 'Membre retire' });
});

// PUT /api/tontines/:tontineId/membres/ordre
const updateMembresOrdre = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const { ordre } = req.body; // [{userId, ordre}]
  
  const tontine = await tontineQ.findById(tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  if (tontine.creatorId !== req.user.id) throw new ApiError(403, 'Seul le créateur peut modifier l\'ordre');
  if (tontine.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Impossible de modifier l\'ordre d\'une tontine déjà démarrée');
  
  if (!Array.isArray(ordre) || ordre.length === 0) {
    throw new ApiError(400, 'L\'ordre doit être un tableau non vide');
  }
  
  await tontineQ.updateOrdreDistribution(tontineId, ordre);
  
  res.json({ success: true, message: 'Ordre de distribution mis à jour' });
});

module.exports = { 
  createTontine, getMesTontines, getTontine, getMembres, startTontine,
  joinTontine, deleteTontine, removeMember, updateMembresOrdre
};
