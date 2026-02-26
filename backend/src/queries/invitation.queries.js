const db = require('../config/db');

// findByToken(token: string) => Promise<Invitation | null>
const findByToken = async (token) => {
  const { rows } = await db.query(`SELECT * FROM "Invitation" WHERE token=$1`, [token]);
  return rows[0] || null;
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

module.exports = { findByToken, create, updateStatut };
