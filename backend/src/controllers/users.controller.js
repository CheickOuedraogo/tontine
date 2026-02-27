const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const userQ = require('../queries/user.queries');
const { hashPassword } = require('../utils/helpers');

// GET /api/users/me
const getProfile = asyncHandler(async (req, res) => {
  const user = await userQ.findById(req.user.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  res.json({ success: true, user });
});

// PUT /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const { nom, prenom, telephone, photo } = req.body;
  const user = await userQ.updateProfile(req.user.id, { nom, prenom, telephone, photo });
  res.json({ success: true, user });
});

// PUT /api/users/me/password
const changePassword = asyncHandler(async (req, res) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  const user = await userQ.findById(req.user.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  
  const { comparePassword } = require('../utils/helpers');
  const valid = await comparePassword(ancienMotDePasse, user.motDePasseHash);
  if (!valid) throw new ApiError(400, 'Ancien mot de passe incorrect');
  
  const motDePasseHash = await hashPassword(nouveauMotDePasse);
  await userQ.updatePassword(req.user.id, motDePasseHash);
  
  res.json({ success: true, message: 'Mot de passe modifie' });
});

// POST /api/users/me/cnib
const uploadCnib = asyncHandler(async (req, res) => {
  const { urlCnib } = req.body;
  const user = await userQ.updateCnib(req.user.id, urlCnib);
  res.json({ success: true, user });
});

module.exports = { getProfile, updateProfile, changePassword, uploadCnib };
