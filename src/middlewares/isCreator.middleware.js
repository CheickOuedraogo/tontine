const db = require('../config/db');
const ApiError = require('../utils/ApiError');

// isCreator(req, res, next) => void  — vérifie que req.user est créateur de :tontineId
const isCreator = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT 1 FROM "Tontine" WHERE id=$1 AND "creatorId"=$2`,
      [req.params.tontineId, req.user.id]
    );
    if (!rows.length) return next(new ApiError(403, 'Action reservee au createur'));
    next();
  } catch (err) { next(err); }
};

module.exports = { isCreator };
