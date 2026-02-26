const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cotisationQ = require('../queries/cotisation.queries');
const distributionQ = require('../queries/distribution.queries');
const tontineQ = require('../queries/tontine.queries');
const notifQ = require('../queries/notification.queries');
const { calculerMontantNet } = require('../utils/helpers');

// GET /api/cotisations/tontine/:tontineId
const getCotisationsByTontine = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const { cycleNumero } = req.query;
  const cotisations = await cotisationQ.findByTontineAndCycle(tontineId, parseInt(cycleNumero));
  res.json({ success: true, cotisations });
});

// POST /api/cotisations/:cotisationId/payer
const payerCotisation = asyncHandler(async (req, res) => {
  const { cotisationId } = req.params;
  const { simulationRef } = req.body;
  
  const cotisation = await cotisationQ.payer(cotisationId, simulationRef);
  
  const allPaid = await cotisationQ.allPaidForCycle(cotisation.tontineId, cotisation.cycleNumero);
  if (allPaid) {
    const tontine = await tontineQ.findById(cotisation.tontineId);
    const membres = await tontineQ.findMembres(cotisation.tontineId);
    const beneficiaire = membres.find(m => m.ordreDistribution === cotisation.cycleNumero);
    
    if (beneficiaire) {
      const montantBrut = tontine.montantCotisation * membres.length;
      const { montantFrais, montantNet } = calculerMontantNet(montantBrut, tontine.pourcentageFrais);
      
      await distributionQ.create({
        tontineId: cotisation.tontineId,
        beneficiaireId: beneficiaire.userId,
        montantBrut,
        montantFrais,
        montantNet,
        datePrevue: new Date(),
        cycleNumero: cotisation.cycleNumero
      });
      
      await notifQ.create({
        userId: beneficiaire.userId,
        type: 'DISTRIBUTION_PRETE',
        titre: 'Distribution prete',
        contenu: `Vous allez recevoir ${montantNet} FCFA`,
        lienAction: `/tontines/${cotisation.tontineId}`
      });
    }
  }
  
  res.json({ success: true, cotisation });
});

module.exports = { getCotisationsByTontine, payerCotisation };
