const db = require('../config/db');

// findByTontine(tontineId: string) => Promise<Distribution[]>
const findByTontine = async (tontineId) => {
  const { rows } = await db.query(
    `SELECT d.*, u.nom, u.prenom, u.email 
     FROM "Distribution" d
     JOIN "User" u ON u.id = d."beneficiaireId"
     WHERE d."tontineId"=$1 
     ORDER BY d."cycleNumero" ASC`,
    [tontineId]
  );
  return rows;
};

// findById(id: string) => Promise<Distribution | null>
const findById = async (id) => {
  const { rows } = await db.query(`SELECT * FROM "Distribution" WHERE id=$1`, [id]);
  return rows[0] || null;
};

// createBulk(distributions: DistributionInput[]) => Promise<void>
const createBulk = async (distributions) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const d of distributions) {
      await client.query(
        `INSERT INTO "Distribution" (
          "tontineId", 
          "beneficiaireId", 
          "montantBrut", 
          "montantFrais", 
          "montantNet", 
          "datePrevue", 
          "cycleNumero", 
          statut
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          d.tontineId, 
          d.beneficiaireId, 
          d.montantBrut, 
          d.montantFrais, 
          d.montantNet, 
          d.datePrevue, 
          d.cycleNumero, 
          d.statut || 'PLANIFIEE'
        ]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// updateStatut(id: string, statut: string) => Promise<Distribution>
const updateStatut = async (id, statut) => {
  const { rows } = await db.query(
    `UPDATE "Distribution" SET statut=$1 WHERE id=$2 RETURNING *`,
    [statut, id]
  );
  return rows[0];
};

module.exports = { findByTontine, findById, createBulk, updateStatut };
