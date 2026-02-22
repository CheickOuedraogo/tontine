const db = require('../config/db');

// findByTontine(tontineId: string) => Promise<Contrat | null>
const findByTontine = async (tontineId) => {
  const { rows } = await db.query(`SELECT * FROM "Contrat" WHERE "tontineId"=$1`, [tontineId]);
  return rows[0] || null;
};

// create(data: {tontineId, texteContrat}) => Promise<Contrat>
const create = async ({ tontineId, texteContrat }) => {
  const { rows } = await db.query(
    `INSERT INTO "Contrat" ("tontineId","texteContrat") VALUES ($1,$2) RETURNING *`,
    [tontineId, texteContrat]
  );
  return rows[0];
};

// findSignatures(contratId: string) => Promise<SignatureContrat[]>
const findSignatures = async (contratId) => {
  const { rows } = await db.query(
    `SELECT s.*, u.nom, u.prenom FROM "SignatureContrat" s
     JOIN "User" u ON u.id = s."userId"
     WHERE s."contratId"=$1`, [contratId]
  );
  return rows;
};

// signer(data: {contratId, userId, ipAddress}) => Promise<SignatureContrat>
const signer = async ({ contratId, userId, ipAddress }) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO "SignatureContrat" ("contratId","userId","ipAddress")
       VALUES ($1,$2,$3) RETURNING *`,
      [contratId, userId, ipAddress]
    );
    await client.query(
      `UPDATE "Participation" SET "aSigneContrat"=true WHERE "userId"=$1 AND "tontineId"=(SELECT "tontineId" FROM "Contrat" WHERE id=$2)`,
      [userId, contratId]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { findByTontine, create, findSignatures, signer };
