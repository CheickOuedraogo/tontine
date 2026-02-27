const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ── JWT ──────────────────────────────────────────────────────────────────────
// generateAccessToken(payload: {id, role}) => string
const generateAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

// generateRefreshToken(payload: {id}) => string
const generateRefreshToken = (payload) => jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// verifyAccessToken(token: string) => {id, role} | null
const verifyAccessToken = (token) => { try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; } };

// ── HASH ─────────────────────────────────────────────────────────────────────
// hashPassword(password: string) => Promise<string>
const hashPassword = (password) => bcrypt.hash(password, 10);

// comparePassword(password: string, hash: string) => Promise<boolean>
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

// ── OTP ──────────────────────────────────────────────────────────────────────
const otpStore = new Map();

// generateOtp() => string
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// storeOtp(email: string, code: string, ttlSeconds: number) => void
const storeOtp = (email, code, ttlSeconds = 300) => {
  otpStore.set(email, { code, expiresAt: Date.now() + ttlSeconds * 1000 });
};

// verifyOtp(email: string, code: string) => boolean
const verifyOtp = (email, code) => {
  const entry = otpStore.get(email);
  if (!entry || Date.now() > entry.expiresAt) return false;
  if (entry.code !== code) return false;
  otpStore.delete(email);
  return true;
};

// ── CALCULS TONTINE ───────────────────────────────────────────────────────────
// calculerMontantNet(montantBrut: number, pourcentageFrais: number) => {montantFrais, montantNet}
const calculerMontantNet = (montantBrut, pourcentageFrais) => {
  const montantFrais = (montantBrut * pourcentageFrais) / 100;
  return { montantFrais, montantNet: montantBrut - montantFrais };
};

// calculerDatesCycles(dateDebut: Date, frequence: string, nbCycles: number) => Date[]
const calculerDatesCycles = (dateDebut, frequence, nbCycles) => {
  const dates = [];
  const base = new Date(dateDebut);
  for (let i = 0; i < nbCycles; i++) {
    const d = new Date(base);
    if (frequence === 'MENSUELLE' || frequence === 'MENSUEL') d.setMonth(base.getMonth() + i);
    else if (frequence === 'HEBDOMADAIRE') d.setDate(base.getDate() + i * 7);
    else if (frequence === 'QUOTIDIENNE' || frequence === 'QUOTIDIEN') d.setDate(base.getDate() + i);
    else if (frequence === 'TRIMESTRIELLE') d.setMonth(base.getMonth() + i * 3);
    else d.setDate(base.getDate() + i * 7); // fallback weekly
    dates.push(d);
  }
  return dates;
};

// genererOrdreAleatoire(userIds: string[]) => string[]
const genererOrdreAleatoire = (userIds) => [...userIds].sort(() => Math.random() - 0.5);

module.exports = {
  generateAccessToken, generateRefreshToken, verifyAccessToken,
  hashPassword, comparePassword,
  generateOtp, storeOtp, verifyOtp,
  calculerMontantNet, calculerDatesCycles, genererOrdreAleatoire
};
