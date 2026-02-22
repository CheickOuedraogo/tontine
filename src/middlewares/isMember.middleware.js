import { query } from '../config/db';
import ApiError from '../utils/ApiError';

// isMember(req, res, next) => void  — vérifie que req.user est membre de :tontineId
const isMember = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT 1 FROM "Participation" WHERE "userId"=$1 AND "tontineId"=$2`,
      [req.user.id, req.params.tontineId]
    );
    if (!rows.length) return next(new ApiError(403, 'Vous netes pas membre de cette tontine'));
    next();
  } catch (err) { next(err); }
};

export default { isMember };
