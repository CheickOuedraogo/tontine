const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const userQ = require('../queries/user.queries');
const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, generateOtp, storeOtp, verifyOtp } = require('../utils/helpers');
const { sendMail } = require('../config/mailer');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { nom, prenom, email, motDePasse, telephone } = req.body;
  const existing = await userQ.findByEmail(email);
  if (existing) throw new ApiError(400, 'Email deja utilise');
  
  const motDePasseHash = await hashPassword(motDePasse);
  const user = await userQ.create({ nom, prenom, email, motDePasseHash, telephone });
  
  const otp = generateOtp();
  storeOtp(email, otp);
  await sendMail(email, 'Code de verification', `Votre code: ${otp}`);
  
  res.status(201).json({ success: true, message: 'Inscription reussie. Veuillez verifier votre email.', userId: user.id });
});

// POST /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!verifyOtp(email, code)) throw new ApiError(400, 'Code invalide ou expire');
  
  const user = await userQ.findByEmail(email);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  
  await userQ.setVerifie(user.id);
  res.json({ success: true, message: 'Email verifie avec succes' });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, motDePasse } = req.body;
  const user = await userQ.findByEmail(email);
  if (!user) throw new ApiError(401, 'Identifiants invalides');
  
  const valid = await comparePassword(motDePasse, user.motDePasseHash);
  if (!valid) throw new ApiError(401, 'Identifiants invalides');
  
  if (!user.estVerifie) throw new ApiError(403, 'Email non verifie. Veuillez verifier votre boite mail.');
  
  const accessToken = generateAccessToken({ id: user.id, role: user.roleSysteme });
  const refreshToken = generateRefreshToken({ id: user.id });
  
  res.json({ success: true, accessToken, refreshToken, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userQ.findByEmail(email);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  
  const otp = generateOtp();
  storeOtp(email, otp);
  await sendMail(email, 'Reinitialisation mot de passe', `Votre code: ${otp}`);
  
  res.json({ success: true, message: 'Code envoye par email' });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, nouveauMotDePasse } = req.body;
  if (!verifyOtp(email, code)) throw new ApiError(400, 'Code invalide ou expire');
  
  const user = await userQ.findByEmail(email);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  
  const motDePasseHash = await hashPassword(nouveauMotDePasse);
  await userQ.updatePassword(user.id, motDePasseHash);
  
  res.json({ success: true, message: 'Mot de passe reinitialise' });
});

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };
