const Joi = require('joi');
const ApiError = require('../utils/ApiError');

// validate(schema: JoiSchema) => middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(d => d.message).join(', ');
    return next(new ApiError(400, message));
  }
  next();
};

// Schemas de validation
const schemas = {
  register: Joi.object({
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    email: Joi.string().email().required(),
    motDePasse: Joi.string().min(6).required(),
    telephone: Joi.string().optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    motDePasse: Joi.string().required()
  }),
  
  createTontine: Joi.object({
    nom: Joi.string().required(),
    montantCotisation: Joi.number().positive().required(),
    frequence: Joi.string().valid('QUOTIDIENNE', 'HEBDOMADAIRE', 'MENSUELLE', 'TRIMESTRIELLE').required(),
    dureeTotale: Joi.number().integer().positive().required(),
    nbMembresAttendu: Joi.number().integer().positive().required(),
    pourcentageFrais: Joi.number().min(0).max(100).optional(),
    type: Joi.string().valid('CLASSIQUE', 'ACHAT_COMMUN').optional()
  }),
  
  payerCotisation: Joi.object({
    simulationRef: Joi.string().required()
  })
};

module.exports = { validate, schemas };
