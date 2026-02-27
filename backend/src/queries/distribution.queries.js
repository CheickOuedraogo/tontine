const db = require('../config/db');

// findByTontine(tontineId: string) => Promise<Distribution[]>
const findByTontine = async (tontineId) => {
  const { rows } = await db.query(
    `SELECT d.*, u.nom, u.prenom FROM "Distribution" d
     JOIN "User" u ON u.id = d."beneficiaireId"
     WHERE d."tontineId"=$1 ORDER BY d."cycleNumero"`, [tontineId]
  );
  return rows;
};

// create(data) => Promise<Distribution>  [transaction atomique]
const create = async (data) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO "Distribution" ("tontineId","beneficiaireId","montantBrut","montantFrais","montantNet","datePrevue","cycleNumero")
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [data.tontineId, data.beneficiaireId, data.montantBrut, data.montantFrais, data.montantNet, data.datePrevue, data.cycleNumero]
    );
    await client.query(
      `UPDATE "Participation" SET "aRecu"=true WHERE "userId"=$1 AND "tontineId"=$2`,
      [data.beneficiaireId, data.tontineId]
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

module.exports = { findByTontine, create };
