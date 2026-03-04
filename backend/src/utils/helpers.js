const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ── JWT ──────────────────────────────────────────────────────────────────────
const generateAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (payload) => jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
const verifyAccessToken = (token) => { try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; } };

// ── HASH ─────────────────────────────────────────────────────────────────────
const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

// ── OTP ──────────────────────────────────────────────────────────────────────
const otpStore = new Map();
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const storeOtp = (email, code, ttlSeconds = 300) => {
  const cleanEmail = email.trim().toLowerCase();
  otpStore.set(cleanEmail, { code, expiresAt: Date.now() + ttlSeconds * 1000 });
};
const verifyOtp = (email, code) => {
  const cleanEmail = email.trim().toLowerCase();
  const entry = otpStore.get(cleanEmail);
  if (!entry || Date.now() > entry.expiresAt) return false;
  if (entry.code !== code) return false;
  otpStore.delete(cleanEmail);
  return true;
};

// ── CALCULS TONTINE ───────────────────────────────────────────────────────────
// calculerDatesCycles(dateDebut: Date, intervalleJours: number, nbCycles: number) => Date[]
const calculerDatesCycles = (dateDebut, intervalleJours, nbCycles) => {
  const dates = [];
  const base = new Date(dateDebut);
  for (let i = 0; i < nbCycles; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i * intervalleJours);
    dates.push(d);
  }
  return dates;
};

// genererOrdreAleatoire(userIds: string[]) => string[]
// Utilise l'algorithme Fisher-Yates pour un mélange vraiment aléatoire
const genererOrdreAleatoire = (userIds) => {
  const array = [...userIds];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

module.exports = {
  generateAccessToken, generateRefreshToken, verifyAccessToken,
  hashPassword, comparePassword,
  generateOtp, storeOtp, verifyOtp,
  calculerDatesCycles, genererOrdreAleatoire
};
