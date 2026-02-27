const db = require('../config/db');

// findById(id: string) => Promise<User | null>
const findById = async (id) => {
  const { rows } = await db.query(`SELECT * FROM "User" WHERE id = $1`, [id]);
  return rows[0] || null;
};

// findByEmail(email: string) => Promise<User | null>
const findByEmail = async (email) => {
  const { rows } = await db.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
  return rows[0] || null;
};

// create(data: {nom, prenom, email, motDePasseHash, telephone}) => Promise<User>
const create = async ({ nom, prenom, email, motDePasseHash, telephone }) => {
  const { rows } = await db.query(
    `INSERT INTO "User" (nom, prenom, email, "motDePasseHash", telephone)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nom, prenom, email, motDePasseHash, telephone]
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

// setVerifie(id: string) => Promise<User>
const setVerifie = async (id) => {
  const { rows } = await db.query(
    `UPDATE "User" SET "estVerifie"=true WHERE id=$1 RETURNING *`, [id]
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

module.exports = { findById, findByEmail, create, updateProfile, updatePassword, setVerifie, updateCnib };
