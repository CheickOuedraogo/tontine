const db = require('../config/db');

// findByTontineAndCycle(tontineId: string, cycleNumero?: number, participationId?: string) => Promise<Cotisation[]>
const findByTontineAndCycle = async (tontineId, cycleNumero, participationId) => {
  let query = `
    SELECT c.*, 
           u.nom as "beneficiaireNom", 
           u.prenom as "beneficiairePrenom"
    FROM "Cotisation" c
    LEFT JOIN "Distribution" d ON d."tontineId" = c."tontineId" AND d."cycleNumero" = c."cycleNumero"
    LEFT JOIN "User" u ON u.id = d."beneficiaireId"
    WHERE c."tontineId" = $1`;
  const params = [tontineId];
  
  let paramIdx = 2;
  if (cycleNumero && !isNaN(cycleNumero)) {
    query += ` AND c."cycleNumero"=$${paramIdx++}`;
    params.push(cycleNumero);
  }

  if (participationId) {
    query += ` AND c."participationId"=$${paramIdx++}`;
    params.push(participationId);
  }
  
  query += ` ORDER BY c."cycleNumero" ASC, c."datePrevue" ASC`;
  
  const { rows } = await db.query(query, params);
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

// payerAvecOperateur(id: string, simulationRef: string, operateur: string) => Promise<Cotisation>
const payerAvecOperateur = async (id, simulationRef, operateur) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE "Cotisation" SET statut='PAYEE', "datePaiement"=NOW(), "simulationRef"=$1, "operateur"=$2
       WHERE id=$3 AND statut='EN_ATTENTE' RETURNING *`,
      [simulationRef, operateur, id]
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

module.exports = { findByTontineAndCycle, findByParticipation, payer, payerAvecOperateur, createBulk, allPaidForCycle };
