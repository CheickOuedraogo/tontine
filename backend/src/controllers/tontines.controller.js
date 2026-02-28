const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const tontineQ = require('../queries/tontine.queries');
const cotisationQ = require('../queries/cotisation.queries');
const distributionQ = require('../queries/distribution.queries');
const contratQ = require('../queries/contrat.queries');
const notifQ = require('../queries/notification.queries');
const db = require('../config/db');
const { calculerMontantNet, calculerDatesCycles, genererOrdreAleatoire } = require('../utils/helpers');


// POST /api/tontines
const createTontine = asyncHandler(async (req, res) => {
  const { nom, montantCotisation, frequence, dureeTotale, nbMembresAttendu, pourcentageFrais, type } = req.body;
  const tontine = await tontineQ.create({
    nom, montantCotisation, frequence, dureeTotale, nbMembresAttendu,
    pourcentageFrais: pourcentageFrais || 0,
    creatorId: req.user.id,
    type: type || 'CLASSIQUE'
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
  // Pour ACHAT_COMMUN, le nombre de membres peut être flexible ou validé différemment.
  // Pour CLASSIQUE, on garde la contrainte stricte.
  if (tontine.type === 'CLASSIQUE' && membres.length !== tontine.nbMembresAttendu) {
     throw new ApiError(400, 'Nombre de membres insuffisant pour une tontine classique');
  }
  
  const allSigned = await tontineQ.allSignedContrat(tontineId);
  if (!allSigned) throw new ApiError(400, 'Tous les membres doivent signer le contrat');
  
  // Ordre de distribution (utile surtout pour CLASSIQUE)
  const ordre = genererOrdreAleatoire(membres.map(m => m.userId));
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


// POST /api/tontines/:tontineId/demander-deblocage
const demanderDeblocage = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const tontine = await tontineQ.findById(tontineId);
  if (!tontine) throw new ApiError(404, 'Tontine introuvable');
  if (tontine.creatorId !== req.user.id) throw new ApiError(403, 'Seul le créateur peut demander le déblocage');
  
  await tontineQ.updateDeblocage(tontineId, 'EN_ATTENTE');
  
  // Notifier tous les membres
  const membres = await tontineQ.findMembres(tontineId);
  for (const m of membres) {
    await notifQ.create({
      userId: m.userId,
      type: 'DEBLOCAGE_DEMANDE',
      titre: 'Demande de déblocage',
      contenu: `Le créateur de la tontine ${tontine.nom} demande le déblocage des fonds. Votre validation est requise.`,
      lienAction: `/tontines/${tontineId}`
    });
  }
  
  res.json({ success: true, message: 'Demande de déblocage envoyée' });
});

// POST /api/tontines/:tontineId/valider-deblocage
const validerDeblocage = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const { valider } = req.body; // boolean
  
  await tontineQ.validerDeblocage(tontineId, req.user.id, valider);
  
  const membres = await tontineQ.findMembres(tontineId);
  const totalMembres = membres.length;
  const nbValides = membres.filter(m => m.aValideDeblocage).length;
  
  if (nbValides === totalMembres) {
    await tontineQ.updateDeblocage(tontineId, 'VALIDE');
    // Notifier le créateur
    const tontine = await tontineQ.findById(tontineId);
    await notifQ.create({
      userId: tontine.creatorId,
      type: 'DEBLOCAGE_VALIDE',
      titre: 'Déblocage validé',
      contenu: `Tous les membres ont validé le déblocage de la tontine ${tontine.nom}.`,
      lienAction: `/tontines/${tontineId}`
    });
  }
  
  res.json({ success: true, message: 'Vote enregistré', nbValides, totalMembres });
});

// POST /api/tontines/:tontineId/quitter
const quitterEtRetirer = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const user = await db.query('SELECT * FROM "Participation" WHERE "tontineId"=$1 AND "userId"=$2', [tontineId, req.user.id]);
  if (user.rows.length === 0) throw new ApiError(404, 'Vous ne faites pas partie de cette tontine');
  
  const participationId = user.rows[0].id;
  
  // Calculer le montant déjà cotisé
  const cotisations = await db.query('SELECT SUM(montant) as total FROM "Cotisation" WHERE "participationId"=$1 AND statut=\'PAYEE\'', [participationId]);
  const montantARetirer = parseFloat(cotisations.rows[0].total || 0);
  
  // Ici on simulerait un virement vers le compte de l'utilisateur
  // Puis on supprime sa participation
  await tontineQ.removeMembre(tontineId, req.user.id);
  
  res.json({ success: true, message: 'Vous avez quitté la tontine', montantRetire: montantARetirer });
});

module.exports = { 
  createTontine, getMesTontines, getTontine, getMembres, startTontine,
  demanderDeblocage, validerDeblocage, quitterEtRetirer
};

