const db = require('../config/db');

// findByUser(userId: string, page: number, limit: number) => Promise<Notification[]>
const findByUser = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { rows } = await db.query(
    `SELECT * FROM "Notification" WHERE "userId"=$1 ORDER BY "dateCreation" DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

// create(data: {userId, type, titre, contenu, lienAction?}) => Promise<Notification>
const create = async ({ userId, type, titre, contenu, lienAction }) => {
  const { rows } = await db.query(
    `INSERT INTO "Notification" ("userId",type,titre,contenu,"lienAction") VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, type, titre, contenu, lienAction || null]
  );
  return rows[0];
};

// markAsRead(id: string, userId: string) => Promise<void>
const markAsRead = async (id, userId) => {
  await db.query(
    `UPDATE "Notification" SET "estLue"=true WHERE id=$1 AND "userId"=$2`, [id, userId]
  );
};

// countUnread(userId: string) => Promise<number>
const countUnread = async (userId) => {
  const { rows } = await db.query(
    `SELECT COUNT(*) FROM "Notification" WHERE "userId"=$1 AND "estLue"=false`, [userId]
  );
  return parseInt(rows[0].count);
};

// deleteById(id: string, userId: string) => Promise<void>
const deleteById = async (id, userId) => {
  await db.query(`DELETE FROM "Notification" WHERE id=$1 AND "userId"=$2`, [id, userId]);
};

// deleteAllByUser(userId: string) => Promise<void>
const deleteAllByUser = async (userId) => {
  await db.query(`DELETE FROM "Notification" WHERE "userId"=$1`, [userId]);
};

module.exports = { findByUser, create, markAsRead, countUnread, deleteById, deleteAllByUser };
