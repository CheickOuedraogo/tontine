const db = require('../config/db');

// findById(id: string) => Promise<Tontine | null>
const findById = async (id) => {
  const { rows } = await db.query(`SELECT * FROM "Tontine" WHERE id=$1`, [id]);
  return rows[0] || null;
};

// findByMembre(userId: string) => Promise<Tontine[]>
const findByMembre = async (userId) => {
  const { rows } = await db.query(
    `SELECT t.* FROM "Tontine" t
     JOIN "Participation" p ON p."tontineId" = t.id
     WHERE p."userId" = $1`, [userId]
  );
  return rows;
};

// create(data) => Promise<Tontine>
const create = async (data) => {
  const nbMembres = parseInt(data.nbMembresAttendu) || 2;
  const montant = parseFloat(data.montantCotisation) || 0;
  const intervalle = parseInt(data.intervalleJours) || 30;

  const { rows } = await db.query(
    `INSERT INTO "Tontine" (
      nom, 
      "montantCotisation", 
      "intervalleJours", 
      "nbMembresAttendu", 
      "dureeTotale", 
      "creatorId", 
      frequence,
      statut
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      data.nom, 
      montant, 
      intervalle, 
      nbMembres, 
      1, // dureeTotale = 1 (Une seule distribution par tontine)
      data.creatorId, 
      'MENSUELLE',
      'EN_ATTENTE'
    ]
  );
  return rows[0];
};

// updateStatut(id: string, statut: string) => Promise<Tontine>
const updateStatut = async (id, statut) => {
  const { rows } = await db.query(
    `UPDATE "Tontine" SET statut=$1 WHERE id=$2 RETURNING *`, [statut, id]
  );
  return rows[0];
};

// findMembres(tontineId: string) => Promise<Participation[]>
const findMembres = async (tontineId) => {
  const { rows } = await db.query(
    `SELECT p.*, u.nom, u.prenom, u.email, u.photo FROM "Participation" p
     JOIN "User" u ON u.id = p."userId"
     WHERE p."tontineId"=$1 ORDER BY p."ordreDistribution"`, [tontineId]
  );
  return rows;
};

// addMembre(data: {userId, tontineId}) => Promise<Participation>
const addMembre = async ({ userId, tontineId }) => {
  const { rows } = await db.query(
    `INSERT INTO "Participation" ("userId","tontineId") VALUES ($1,$2) RETURNING *`,
    [userId, tontineId]
  );
  return rows[0];
};

// removeMembre(tontineId: string, userId: string) => Promise<void>
const removeMembre = async (tontineId, userId) => {
  await db.query(`DELETE FROM "Participation" WHERE "tontineId"=$1 AND "userId"=$2`, [tontineId, userId]);
};

// deleteTontine(id: string) => Promise<void>
const deleteTontine = async (id) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM "Message" WHERE "tontineId"=$1`, [id]);
    await client.query(`DELETE FROM "Cotisation" WHERE "tontineId"=$1`, [id]);
    await client.query(`DELETE FROM "Distribution" WHERE "tontineId"=$1`, [id]);
    await client.query(`DELETE FROM "Contrat" WHERE "tontineId"=$1`, [id]);
    await client.query(`DELETE FROM "Invitation" WHERE "tontineId"=$1`, [id]);
    await client.query(`DELETE FROM "Participation" WHERE "tontineId"=$1`, [id]);
    await client.query(`DELETE FROM "Tontine" WHERE id=$1`, [id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// updateOrdreDistribution(tontineId: string, ordre: {userId: string, ordre: number}[]) => Promise<void>
const updateOrdreDistribution = async (tontineId, ordre) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const item of ordre) {
      await client.query(
        `UPDATE "Participation" SET "ordreDistribution"=$1 WHERE "userId"=$2 AND "tontineId"=$3`,
        [item.ordre, item.userId, tontineId]
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

module.exports = {
  findById, findByMembre, create, updateStatut,
  findMembres, addMembre, removeMembre, deleteTontine, updateOrdreDistribution
};
