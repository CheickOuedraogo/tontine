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

// create(data: {nom, montantCotisation, frequence, dureeTotale, nbMembresAttendu, pourcentageFrais, creatorId, type}) => Promise<Tontine>
const create = async (data) => {
  const { rows } = await db.query(
    `INSERT INTO "Tontine" (nom, "montantCotisation", frequence, "dureeTotale", "nbMembresAttendu", "pourcentageFrais", "creatorId", "type")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.nom, data.montantCotisation, data.frequence, data.dureeTotale, data.nbMembresAttendu, data.pourcentageFrais, data.creatorId, data.type || 'CLASSIQUE']
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

// updateDeblocage(id: string, statut: string) => Promise<Tontine>
const updateDeblocage = async (id, statut) => {
  const { rows } = await db.query(
    `UPDATE "Tontine" SET "statutDeblocage"=$1 WHERE id=$2 RETURNING *`, [statut, id]
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

// validerDeblocage(tontineId: string, userId: string, valider: boolean) => Promise<void>
const validerDeblocage = async (tontineId, userId, valider) => {
  await db.query(`UPDATE "Participation" SET "aValideDeblocage"=$1 WHERE "tontineId"=$2 AND "userId"=$3`, [valider, tontineId, userId]);
};

// allSignedContrat(tontineId: string) => Promise<boolean>
const allSignedContrat = async (tontineId) => {
  const { rows } = await db.query(
    `SELECT COUNT(*) FILTER (WHERE "aSigneContrat"=false) AS unsigned
     FROM "Participation" WHERE "tontineId"=$1`, [tontineId]
  );
  return parseInt(rows[0].unsigned) === 0;
};

module.exports = {
  findById, findByMembre, create, updateStatut, updateDeblocage, 
  findMembres, addMembre, removeMembre, validerDeblocage, allSignedContrat 
};

