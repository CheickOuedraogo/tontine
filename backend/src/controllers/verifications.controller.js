const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const db = require('../config/db');
const notifQ = require('../queries/notification.queries');

// GET /api/verifications/tontine/:tontineId
// Liste des membres en attente de vérification (créateur uniquement)
const getMembresEnAttente = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  
  const { rows } = await db.query(
    `SELECT p.*, u.nom, u.prenom, u.email, u.telephone, u."urlCnib", u.photo
     FROM "Participation" p
     JOIN "User" u ON u.id = p."userId"
     WHERE p."tontineId" = $1 AND p."statutVerifIdentite" = 'EN_ATTENTE'
     ORDER BY p."dateAdhesion" DESC`,
    [tontineId]
  );
  
  res.json({ success: true, membresEnAttente: rows });
});

// GET /api/verifications/tontine/:tontineId/tous
// Liste de tous les membres avec leur statut de vérification
const getTousMembres = asyncHandler(async (req, res) => {
  const { tontineId } = req.params;
  
  const { rows } = await db.query(
    `SELECT p.*, u.nom, u.prenom, u.email, u.telephone, u."urlCnib", u.photo
     FROM "Participation" p
     JOIN "User" u ON u.id = p."userId"
     WHERE p."tontineId" = $1
     ORDER BY 
       CASE p."statutVerifIdentite"
         WHEN 'EN_ATTENTE' THEN 1
         WHEN 'VERIFIE' THEN 2
         WHEN 'REJETE' THEN 3
         ELSE 4
       END,
       p."dateAdhesion" DESC`,
    [tontineId]
  );
  
  res.json({ success: true, membres: rows });
});

// POST /api/verifications/participation/:participationId/valider
// Valider l'identité d'un membre (créateur uniquement)
const validerIdentite = asyncHandler(async (req, res) => {
  const { participationId } = req.params;
  
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Mettre à jour le statut de vérification
    const { rows } = await client.query(
      `UPDATE "Participation" 
       SET "statutVerifIdentite" = 'VERIFIE'
       WHERE id = $1
       RETURNING *`,
      [participationId]
    );
    
    if (!rows[0]) throw new ApiError(404, 'Participation introuvable');
    
    const participation = rows[0];
    
    // Récupérer les infos de la tontine
    const { rows: tontineRows } = await client.query(
      `SELECT * FROM "Tontine" WHERE id = $1`,
      [participation.tontineId]
    );
    const tontine = tontineRows[0];
    
    // Notifier l'utilisateur
    await client.query(
      `INSERT INTO "Notification" ("userId", type, titre, contenu, "lienAction")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        participation.userId,
        'IDENTITE_VALIDEE',
        'Identité validée',
        `Votre identité a été validée pour la tontine ${tontine.nom}.`,
        `/tontines/${tontine.id}`
      ]
    );
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Identité validée avec succès',
      participation: rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// POST /api/verifications/participation/:participationId/rejeter
// Rejeter l'identité d'un membre (créateur uniquement)
const rejeterIdentite = asyncHandler(async (req, res) => {
  const { participationId } = req.params;
  const { motif } = req.body;
  
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Récupérer la participation avant de la supprimer
    const { rows: participationRows } = await client.query(
      `SELECT p.*, t.nom as "tontineNom"
       FROM "Participation" p
       JOIN "Tontine" t ON t.id = p."tontineId"
       WHERE p.id = $1`,
      [participationId]
    );
    
    if (!participationRows[0]) throw new ApiError(404, 'Participation introuvable');
    
    const participation = participationRows[0];
    
    // Mettre à jour le statut (on garde la participation pour historique)
    await client.query(
      `UPDATE "Participation" 
       SET "statutVerifIdentite" = 'REJETE'
       WHERE id = $1`,
      [participationId]
    );
    
    // Notifier l'utilisateur
    await client.query(
      `INSERT INTO "Notification" ("userId", type, titre, contenu, "lienAction")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        participation.userId,
        'IDENTITE_REJETEE',
        'Identité non validée',
        `Votre demande d'adhésion à la tontine ${participation.tontineNom} a été refusée. ${motif ? 'Motif: ' + motif : ''}`,
        null
      ]
    );
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Identité rejetée'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// POST /api/verifications/participation/:participationId/soumettre
// Soumettre sa CNIB pour vérification (membre)
const soumettreVerification = asyncHandler(async (req, res) => {
  const { participationId } = req.params;
  const { urlCnib } = req.body;
  
  if (!urlCnib) throw new ApiError(400, 'URL de la CNIB requise');
  
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Vérifier que la participation appartient à l'utilisateur
    const { rows: participationRows } = await client.query(
      `SELECT * FROM "Participation" WHERE id = $1 AND "userId" = $2`,
      [participationId, req.user.id]
    );
    
    if (!participationRows[0]) {
      throw new ApiError(404, 'Participation introuvable ou non autorisée');
    }
    
    // Mettre à jour l'URL de la CNIB dans le profil utilisateur
    await client.query(
      `UPDATE "User" SET "urlCnib" = $1 WHERE id = $2`,
      [urlCnib, req.user.id]
    );
    
    // Mettre à jour le statut de vérification
    await client.query(
      `UPDATE "Participation" 
       SET "statutVerifIdentite" = 'EN_ATTENTE', "pieceIdentiteUrl" = $1
       WHERE id = $2`,
      [urlCnib, participationId]
    );
    
    // Récupérer les infos de la tontine
    const { rows: tontineRows } = await client.query(
      `SELECT * FROM "Tontine" WHERE id = $1`,
      [participationRows[0].tontineId]
    );
    const tontine = tontineRows[0];
    
    // Notifier le créateur
    await client.query(
      `INSERT INTO "Notification" ("userId", type, titre, contenu, "lienAction")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        tontine.creatorId,
        'VERIFICATION_SOUMISE',
        'Nouvelle vérification à effectuer',
        `Un membre a soumis sa pièce d'identité pour la tontine ${tontine.nom}`,
        `/tontines/${tontine.id}/verifications`
      ]
    );
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'CNIB soumise pour vérification'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

module.exports = {
  getMembresEnAttente,
  getTousMembres,
  validerIdentite,
  rejeterIdentite,
  soumettreVerification
};
