const ApiError = require('../utils/ApiError');

// errorHandler(err, req, res, next) => void
const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  res.status(statusCode).json({ success: false, message: err.message || 'Erreur serveur' });
};

module.exports = { errorHandler };
