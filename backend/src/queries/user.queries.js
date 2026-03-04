const db = require('../config/db');

// findById(id: string) => Promise<User | null>
const findById = async (id) => {
  const { rows } = await db.query(`SELECT * FROM "User" WHERE id = $1`, [id]);
  return rows[0] || null;
};

// findByEmail(email: string) => Promise<User | null>
const findByEmail = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  const { rows } = await db.query(`SELECT * FROM "User" WHERE email = $1`, [cleanEmail]);
  return rows[0] || null;
};

// create(data: {nom, prenom, email, motDePasseHash, telephone}) => Promise<User>
const create = async ({ nom, prenom, email, motDePasseHash, telephone }) => {
  const cleanEmail = email.trim().toLowerCase();
  const { rows } = await db.query(
    `INSERT INTO "User" (nom, prenom, email, "motDePasseHash", telephone, "estVerifie")
     VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
    [nom, prenom, cleanEmail, motDePasseHash, telephone]
  );
  return rows[0];
};

// updateProfile(id: string, data: {nom?, prenom?, photo?, telephone?}) => Promise<User>
const updateProfile = async (id, data) => {
  const { rows } = await db.query(
    `UPDATE "User" SET nom=$1, prenom=$2, photo=$3, telephone=$4 WHERE id=$5 RETURNING *`,
    [data.nom, data.prenom, data.photo, data.telephone, id]
  );
  return rows[0];
};

// updatePassword(id: string, motDePasseHash: string) => Promise<void>
const updatePassword = async (id, motDePasseHash) => {
  await db.query(`UPDATE "User" SET "motDePasseHash"=$1 WHERE id=$2`, [motDePasseHash, id]);
};

// updatePhoto(id: string, photo: string) => Promise<User>
const updatePhoto = async (id, photo) => {
  const { rows } = await db.query(
    `UPDATE "User" SET photo=$1 WHERE id=$2 RETURNING *`, [photo, id]
  );
  return rows[0];
};

// updateCnib(id: string, urlCnib: string) => Promise<User>
const updateCnib = async (id, urlCnib) => {
  const { rows } = await db.query(
    `UPDATE "User" SET "urlCnib"=$1 WHERE id=$2 RETURNING *`, [urlCnib, id]
  );
  return rows[0];
};

module.exports = { findById, findByEmail, create, updateProfile, updatePassword, updatePhoto, updateCnib };
