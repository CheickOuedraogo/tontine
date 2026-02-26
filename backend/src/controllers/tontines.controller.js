const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const tontineQ = require('../queries/tontine.queries');
const cotisationQ = require('../queries/cotisation.queries');
const distributionQ = require('../queries/distribution.queries');
const contratQ = require('../queries/contrat.queries');
const notifQ = require('../queries/notification.queries');
const { calculerMontantNet, calculerDatesCycles, genererOrdreAleatoire } = require('../utils/helpers');

// POST /api/tontines
const createTontine = asyncHandler(async (req, res) => {
  const { nom, montantCotisation, frequence, dureeTotale, nbMembresAttendu, pourcentageFrais } = req.body;
  const tontine = await tontineQ.create({
    nom, montantCotisation, frequence, dureeTotale, nbMembresAttendu,
    pourcentageFrais: pourcentageFrais || 0,
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
  if (tontine.statut !== 'EN_ATTENTE') throw new ApiError(400, 'Tontine deja demarree');
  
  const membres = await tontineQ.findMembres(tontineId);
  if (membres.length !== tontine.nbMembresAttendu) throw new ApiError(400, 'Nombre de membres insuffisant');
  
  const allSigned = await tontineQ.allSignedContrat(tontineId);
  if (!allSigned) throw new ApiError(400, 'Tous les membres doivent signer le contrat');
  
  const ordre = genererOrdreAleatoire(membres.map(m => m.userId));
  const db = require('../config/db');
  for (let i = 0; i < ordre.length; i++) {
    await db.query(`UPDATE "Participation" SET "ordreDistribution"=$1 WHERE "userId"=$2 AND "tontineId"=$3`, [i + 1, ordre[i], tontineId]);
  }
  
  const dateDebut = new Date(req.body.dateDebut || Date.now());
  const datesCycles = calculerDatesCycles(dateDebut, tontine.frequence, tontine.dureeTotale);
  
  const cotisations = [];
  for (let cycle = 0; cycle < tontine.dureeTotale; cycle++) {
    for (const m of membres) {
      cotisations.push({
        participationId: m.id,
        tontineId,
        montant: tontine.montantCotisation,
        datePrevue: datesCycles[cycle],
        cycleNumero: cycle + 1
      });
    }
  }
  await cotisationQ.createBulk(cotisations);
  
  await tontineQ.updateStatut(tontineId, 'ACTIVE');
  
  for (const m of membres) {
    await notifQ.create({
      userId: m.userId,
      type: 'TONTINE_DEMARREE',
      titre: 'Tontine demarree',
      contenu: `La tontine ${tontine.nom} a demarre`,
      lienAction: `/tontines/${tontineId}`
    });
  }
  
  res.json({ success: true, message: 'Tontine demarree' });
});

module.exports = { createTontine, getMesTontines, getTontine, getMembres, startTontine };
