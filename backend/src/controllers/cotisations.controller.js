const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cotisationQ = require('../queries/cotisation.queries');
const tontineQ = require('../queries/tontine.queries');
const notifQ = require('../queries/notification.queries');
const db = require('../config/db');

// GET /api/cotisations/tontine/:tontineId
const getCotisationsByTontine = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const { cycleNumero, stats } = req.query; // Ajout du paramètre stats
  const userId = req.user.id;

  // Vérifier que l'utilisateur est membre de la tontine
  const { rows: participations } = await db.query(
    'SELECT id FROM "Participation" WHERE "tontineId" = $1 AND "userId" = $2',
    [tontineId, userId]
  );
  
  if (participations.length === 0) {
    throw new ApiError(403, 'Vous ne faites pas partie de cette tontine');
  }

  // Vérifier si l'utilisateur est le créateur
  const tontine = await tontineQ.findById(tontineId);
  const isCreator = String(tontine.creatorId) === String(userId);

  const parsedCycle = cycleNumero ? parseInt(cycleNumero) : null;
  
  let cotisations;
  // Si stats=true ET que l'utilisateur est créateur, retourner toutes les cotisations
  if (stats === 'true' && isCreator) {
    // Le créateur demande les statistiques - voir toutes les cotisations
    cotisations = await cotisationQ.findByTontineAndCycle(tontineId, parsedCycle, null);
    
    // Enrichir avec les infos des membres
    const membres = await tontineQ.findMembres(tontineId);
    cotisations = cotisations.map(cot => {
      const participation = membres.find(m => m.id === cot.participationId);
      return {
        ...cot,
        membre: participation ? {
          nom: participation.nom,
          prenom: participation.prenom,
          email: participation.email,
          photo: participation.photo
        } : null
      };
    });
  } else {
    // Tous les membres (y compris le créateur) voient uniquement LEURS cotisations
    const participationId = participations[0].id;
    cotisations = await cotisationQ.findByTontineAndCycle(tontineId, parsedCycle, participationId);
  }
  
  res.json({ success: true, cotisations, isCreator });
});

// POST /api/cotisations/:cotisationId/payer
const payerCotisation = asyncHandler(async (req, res) => {
  const { cotisationId } = req.params;
  const { simulationRef } = req.body;
  
  const cotisation = await cotisationQ.payer(cotisationId, simulationRef);
  
  const allPaid = await cotisationQ.allPaidForCycle(cotisation.tontineId, cotisation.cycleNumero);
  if (allPaid) {
    // Mettre à jour la distribution existante en EFFECTUEE
    await db.query(
      `UPDATE "Distribution" SET statut='EFFECTUEE', "dateEffective"=NOW()
       WHERE "tontineId"=$1 AND "cycleNumero"=$2 AND statut='PLANIFIEE'`,
      [cotisation.tontineId, cotisation.cycleNumero]
    );
    
    // Récupérer la distribution pour notifier le bénéficiaire
    const { rows: distRows } = await db.query(
      `SELECT d.*, u.nom, u.prenom FROM "Distribution" d
       JOIN "User" u ON u.id = d."beneficiaireId"
       WHERE d."tontineId"=$1 AND d."cycleNumero"=$2`,
      [cotisation.tontineId, cotisation.cycleNumero]
    );
    
    if (distRows[0]) {
      await notifQ.create({
        userId: distRows[0].beneficiaireId,
        type: 'DISTRIBUTION_PRETE',
        titre: 'Distribution effectuée',
        contenu: `Vous avez reçu ${Number(distRows[0].montantNet).toLocaleString('fr-FR')} FCFA (tour ${cotisation.cycleNumero})`,
        lienAction: `/tontines/${cotisation.tontineId}`
      });
    }
  }
  
  res.json({ success: true, cotisation });
});

// POST /api/cotisations/:cotisationId/simuler-paiement
const simulerPaiement = asyncHandler(async (req, res) => {
  const { cotisationId } = req.params;
  const { operateur } = req.body;
  
  const simulationRef = `SIM-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  
  // Valider l'opérateur
  const operateursValides = ['ORANGE_MONEY', 'MOOV_MONEY', 'CORIS_MONEY'];
  if (operateur && !operateursValides.includes(operateur)) {
    throw new ApiError(400, 'Opérateur invalide. Valeurs acceptées: ORANGE_MONEY, MOOV_MONEY, CORIS_MONEY');
  }
  
  const cotisation = await cotisationQ.payerAvecOperateur(cotisationId, simulationRef, operateur || 'ORANGE_MONEY');
  
  const allPaid = await cotisationQ.allPaidForCycle(cotisation.tontineId, cotisation.cycleNumero);
  if (allPaid) {
    // Mettre à jour la distribution existante en EFFECTUEE
    await db.query(
      `UPDATE "Distribution" SET statut='EFFECTUEE', "dateEffective"=NOW()
       WHERE "tontineId"=$1 AND "cycleNumero"=$2 AND statut='PLANIFIEE'`,
      [cotisation.tontineId, cotisation.cycleNumero]
    );
    
    // Récupérer la distribution pour notifier le bénéficiaire
    const { rows: distRows } = await db.query(
      `SELECT d.*, u.nom, u.prenom FROM "Distribution" d
       JOIN "User" u ON u.id = d."beneficiaireId"
       WHERE d."tontineId"=$1 AND d."cycleNumero"=$2`,
      [cotisation.tontineId, cotisation.cycleNumero]
    );
    
    if (distRows[0]) {
      await notifQ.create({
        userId: distRows[0].beneficiaireId,
        type: 'DISTRIBUTION_PRETE',
        titre: 'Distribution effectuée (simulation)',
        contenu: `Vous avez reçu ${Number(distRows[0].montantNet).toLocaleString('fr-FR')} FCFA (tour ${cotisation.cycleNumero})`,
        lienAction: `/tontines/${cotisation.tontineId}`
      });
    }
  }
  
  res.json({ success: true, cotisation, simulationRef });
});

module.exports = { getCotisationsByTontine, payerCotisation, simulerPaiement };
