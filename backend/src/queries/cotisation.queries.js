const db = require('../config/db');

// findByTontineAndCycle(tontineId: string, cycleNumero: number) => Promise<Cotisation[]>
const findByTontineAndCycle = async (tontineId, cycleNumero) => {
  const { rows } = await db.query(
    `SELECT * FROM "Cotisation" WHERE "tontineId"=$1 AND "cycleNumero"=$2`, [tontineId, cycleNumero]
  );
  return rows;
};

// findByParticipation(participationId: string) => Promise<Cotisation[]>
const findByParticipation = async (participationId) => {
  const { rows } = await db.query(
    `SELECT * FROM "Cotisation" WHERE "participationId"=$1 ORDER BY "cycleNumero"`, [participationId]
  );
  return rows;
};

// payer(id: string, simulationRef: string) => Promise<Cotisation>  [transaction atomique]
const payer = async (id, simulationRef) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE "Cotisation" SET statut='PAYEE', "datePaiement"=NOW(), "simulationRef"=$1
       WHERE id=$2 AND statut='EN_ATTENTE' RETURNING *`,
      [simulationRef, id]
    );
    if (!rows[0]) throw new Error('Cotisation introuvable ou deja payee');
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// createBulk(cotisations: CotisationInput[]) => Promise<void>
const createBulk = async (cotisations) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const c of cotisations) {
      await client.query(
        `INSERT INTO "Cotisation" ("participationId","tontineId","montant","datePrevue","cycleNumero")
         VALUES ($1,$2,$3,$4,$5)`,
        [c.participationId, c.tontineId, c.montant, c.datePrevue, c.cycleNumero]
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

// allPaidForCycle(tontineId: string, cycleNumero: number) => Promise<boolean>
const allPaidForCycle = async (tontineId, cycleNumero) => {
  const { rows } = await db.query(
    `SELECT COUNT(*) FILTER (WHERE statut != 'PAYEE') AS unpaid
     FROM "Cotisation" WHERE "tontineId"=$1 AND "cycleNumero"=$2`, [tontineId, cycleNumero]
  );
  return parseInt(rows[0].unpaid) === 0;
};

module.exports = { findByTontineAndCycle, findByParticipation, payer, createBulk, allPaidForCycle };
