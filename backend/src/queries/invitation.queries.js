const db = require('../config/db');

// findByToken(token: string) => Promise<Invitation | null>
const findByToken = async (token) => {
  const { rows } = await db.query(`SELECT * FROM "Invitation" WHERE token=$1`, [token]);
  return rows[0] || null;
};

// findById(id: string) => Promise<Invitation | null>
const findById = async (id) => {
  const { rows } = await db.query(`SELECT * FROM "Invitation" WHERE id=$1`, [id]);
  return rows[0] || null;
};

// findByTontine(tontineId: string) => Promise<Invitation[]>
const findByTontine = async (tontineId) => {
  const { rows } = await db.query(
    `SELECT i.*, u.nom, u.prenom FROM "Invitation" i
     LEFT JOIN "User" u ON u.email = i."emailInvite"
     WHERE i."tontineId"=$1 ORDER BY i.statut ASC`,
    [tontineId]
  );
  return rows;
};

// create(data: {tontineId, emailInvite, dateExpiration}) => Promise<Invitation>
const create = async ({ tontineId, emailInvite, dateExpiration }) => {
  const { rows } = await db.query(
    `INSERT INTO "Invitation" ("tontineId","emailInvite","dateExpiration") VALUES ($1,$2,$3) RETURNING *`,
    [tontineId, emailInvite, dateExpiration]
  );
  return rows[0];
};

// updateStatut(id: string, statut: string) => Promise<void>
const updateStatut = async (id, statut) => {
  await db.query(`UPDATE "Invitation" SET statut=$1 WHERE id=$2`, [statut, id]);
};

// findPendingByUser(email: string) => Promise<Invitation[]>
const findPendingByUser = async (email) => {
  const { rows } = await db.query(
    `SELECT i.*, t.nom as "tontineNom", t."montantCotisation", t."intervalleJours", u.nom as "creatorNom", u.prenom as "creatorPrenom"
     FROM "Invitation" i
     JOIN "Tontine" t ON t.id = i."tontineId"
     JOIN "User" u ON u.id = t."creatorId"
     WHERE i."emailInvite" = $1 AND i.statut = 'EN_ATTENTE'
     AND i."dateExpiration" > NOW()`,
    [email ? email.trim().toLowerCase() : '']
  );
  return rows;
};

module.exports = { findByToken, findById, findByTontine, create, updateStatut, findPendingByUser };
