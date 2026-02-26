const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const distributionQ = require('../queries/distribution.queries');

// GET /api/distributions/tontine/:tontineId
const getDistributionsByTontine = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  const distributions = await distributionQ.findByTontine(tontineId);
  res.json({ success: true, distributions });
});

module.exports = { getDistributionsByTontine };
