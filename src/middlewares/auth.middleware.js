const { verifyAccessToken } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');

// protect(req, res, next) => void  — vérifie le JWT dans Authorization header
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new ApiError(401, 'Non authentifie'));
  const decoded = verifyAccessToken(token);
  if (!decoded) return next(new ApiError(401, 'Token invalide ou expire'));
  req.user = decoded;
  next();
};

module.exports = { protect };
