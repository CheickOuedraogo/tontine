const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const userQ = require('../queries/user.queries');
const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } = require('../utils/helpers');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { nom, prenom, motDePasse, telephone } = req.body;
  const email = req.body.email.trim().toLowerCase();
  const existing = await userQ.findByEmail(email);
  if (existing) throw new ApiError(400, 'Email deja utilise');
  
  const motDePasseHash = await hashPassword(motDePasse);
  const user = await userQ.create({ nom, prenom, email, motDePasseHash, telephone });
  
  res.status(201).json({ success: true, message: 'Inscription reussie !', userId: user.id });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { motDePasse } = req.body;
  const email = req.body.email.trim().toLowerCase();
  const user = await userQ.findByEmail(email);
  if (!user) throw new ApiError(401, 'Identifiants invalides');
  
  const valid = await comparePassword(motDePasse, user.motDePasseHash);
  if (!valid) throw new ApiError(401, 'Identifiants invalides');
  
  const accessToken = generateAccessToken({ 
    id: user.id, 
    email: user.email, 
    role: user.roleSysteme,
    nom: user.nom,
    prenom: user.prenom
  });
  const refreshToken = generateRefreshToken({ id: user.id });
  
  res.json({ success: true, accessToken, refreshToken, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, telephone: user.telephone || null, photo: user.photo || null, roleSysteme: user.roleSysteme } });
});

module.exports = { register, login };
