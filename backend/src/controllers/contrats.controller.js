const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const contratQ = require('../queries/contrat.queries');
const tontineQ = require('../queries/tontine.queries');

// POST /api/contrats/tontine/:tontineId
const createContrat = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const { texteContrat } = req.body;
  
  const existing = await contratQ.findByTontine(tontineId);
  if (existing) throw new ApiError(400, 'Contrat deja existant');
  
  const contrat = await contratQ.create({ tontineId, texteContrat });
  res.status(201).json({ success: true, contrat });
});

// GET /api/contrats/tontine/:tontineId
const getContrat = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const contrat = await contratQ.findByTontine(tontineId);
  if (!contrat) throw new ApiError(404, 'Contrat introuvable');
  res.json({ success: true, contrat });
});

// POST /api/contrats/:contratId/signer
const signerContrat = asyncHandler(async (req, res) => {
  const { contratId } = req.params;
  const ipAddress = req.ip;
  
  const signature = await contratQ.signer({ contratId, userId: req.user.id, ipAddress });
  res.json({ success: true, signature });
});

// GET /api/contrats/:contratId/signatures
const getSignatures = asyncHandler(async (req, res) => {
  const { contratId } = req.params;
  const signatures = await contratQ.findSignatures(contratId);
  res.json({ success: true, signatures });
});

module.exports = { createContrat, getContrat, signerContrat, getSignatures };
