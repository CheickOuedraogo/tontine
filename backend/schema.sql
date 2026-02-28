-- =============================================
-- CRÉATION DE LA BASE DE DONNÉES TONTINE
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TYPES ENUM
-- =============================================

CREATE TYPE frequence_enum AS ENUM ('QUOTIDIENNE', 'HEBDOMADAIRE', 'MENSUELLE', 'TRIMESTRIELLE');

CREATE TYPE statut_tontine_enum AS ENUM ('EN_ATTENTE', 'ACTIVE', 'TERMINEE', 'ANNULEE');

CREATE TYPE statut_cotisation_enum AS ENUM ('EN_ATTENTE', 'PAYEE', 'EN_RETARD', 'ANNULEE');

CREATE TYPE statut_distribution_enum AS ENUM ('PLANIFIEE', 'EFFECTUEE', 'ANNULEE');

CREATE TYPE statut_invitation_enum AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE');

CREATE TYPE role_systeme_enum AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

CREATE TYPE statut_user_enum AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU', 'BANNI');

CREATE TYPE type_message_enum AS ENUM ('text', 'system');

CREATE TYPE statut_verif_enum AS ENUM ('NON_SOUMIS', 'EN_ATTENTE', 'VERIFIE', 'REJETE');

CREATE TYPE type_tontine_enum AS ENUM ('CLASSIQUE', 'ACHAT_COMMUN');

CREATE TYPE statut_deblocage_enum AS ENUM ('NON_DEMANDE', 'EN_ATTENTE', 'VALIDE', 'REJETE');


-- =============================================
-- TABLES
-- =============================================

-- Table User
CREATE TABLE "User" (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    telephone       VARCHAR(20),
    "motDePasseHash" TEXT NOT NULL,
    photo           TEXT,
    statut          statut_user_enum NOT NULL DEFAULT 'ACTIF',
    "dateInscription" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "roleSysteme"   role_systeme_enum NOT NULL DEFAULT 'USER',
    "estVerifie"    BOOLEAN NOT NULL DEFAULT FALSE,
    "urlCnib"       TEXT
);

-- Table Tontine
CREATE TABLE "Tontine" (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom                 VARCHAR(255) NOT NULL,
    "montantCotisation" NUMERIC(15, 2) NOT NULL,
    frequence           frequence_enum NOT NULL,
    "dureeTotale"       INTEGER NOT NULL, -- en nombre de cycles
    "nbMembresAttendu"  INTEGER NOT NULL,
    "dateDebut"         DATE,
    "dateFin"           DATE,
    statut              statut_tontine_enum NOT NULL DEFAULT 'EN_ATTENTE',
    "pourcentageFrais"  NUMERIC(5, 2) NOT NULL DEFAULT 0,
    "creatorId"         UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "type"              type_tontine_enum NOT NULL DEFAULT 'CLASSIQUE',
    "statutDeblocage"   statut_deblocage_enum NOT NULL DEFAULT 'NON_DEMANDE'
);


-- Table Participation
CREATE TABLE "Participation" (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId"              UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "tontineId"           UUID NOT NULL REFERENCES "Tontine"(id) ON DELETE CASCADE,
    "ordreDistribution"   INTEGER,
    "aRecu"               BOOLEAN NOT NULL DEFAULT FALSE,
    "dateAdhesion"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "aSigneContrat"       BOOLEAN NOT NULL DEFAULT FALSE,
    "statutVerifIdentite" statut_verif_enum NOT NULL DEFAULT 'NON_SOUMIS',
    "pieceIdentiteUrl"    TEXT,
    "aValideDeblocage"  BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE ("userId", "tontineId")
);


-- Table Cotisation
CREATE TABLE "Cotisation" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "participationId" UUID NOT NULL REFERENCES "Participation"(id) ON DELETE CASCADE,
    "tontineId"      UUID NOT NULL REFERENCES "Tontine"(id) ON DELETE CASCADE,
    montant          NUMERIC(15, 2) NOT NULL,
    "datePrevue"     DATE NOT NULL,
    "datePaiement"   TIMESTAMP WITH TIME ZONE,
    statut           statut_cotisation_enum NOT NULL DEFAULT 'EN_ATTENTE',
    "simulationRef"  VARCHAR(255),
    "cycleNumero"    INTEGER NOT NULL
);

-- Table Distribution
CREATE TABLE "Distribution" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tontineId"      UUID NOT NULL REFERENCES "Tontine"(id) ON DELETE CASCADE,
    "beneficiaireId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "montantBrut"    NUMERIC(15, 2) NOT NULL,
    "montantFrais"   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "montantNet"     NUMERIC(15, 2) NOT NULL,
    "datePrevue"     DATE NOT NULL,
    "dateEffective"  TIMESTAMP WITH TIME ZONE,
    "cycleNumero"    INTEGER NOT NULL,
    statut           statut_distribution_enum NOT NULL DEFAULT 'PLANIFIEE'
);

-- Table Contrat
CREATE TABLE "Contrat" (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tontineId"     UUID NOT NULL UNIQUE REFERENCES "Tontine"(id) ON DELETE CASCADE,
    "texteContrat"  TEXT NOT NULL,
    "dateCreation"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table SignatureContrat
CREATE TABLE "SignatureContrat" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contratId"      UUID NOT NULL REFERENCES "Contrat"(id) ON DELETE CASCADE,
    "userId"         UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "dateSignature"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "ipAddress"      INET,
    accepte          BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE ("contratId", "userId")
);

-- Table Message
CREATE TABLE "Message" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tontineId"   UUID NOT NULL REFERENCES "Tontine"(id) ON DELETE CASCADE,
    "senderId"    UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    contenu       TEXT NOT NULL,
    "dateEnvoi"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "typeMessage" type_message_enum NOT NULL DEFAULT 'text'
);

-- Table Notification
CREATE TABLE "Notification" (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId"        UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type            VARCHAR(100) NOT NULL,
    titre           VARCHAR(255) NOT NULL,
    contenu         TEXT NOT NULL,
    "estLue"        BOOLEAN NOT NULL DEFAULT FALSE,
    "dateCreation"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "lienAction"    TEXT
);

-- Table Invitation
CREATE TABLE "Invitation" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tontineId"      UUID NOT NULL REFERENCES "Tontine"(id) ON DELETE CASCADE,
    "emailInvite"    VARCHAR(255) NOT NULL,
    token            UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    statut           statut_invitation_enum NOT NULL DEFAULT 'EN_ATTENTE',
    "dateExpiration" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- =============================================
-- INDEX
-- =============================================

CREATE INDEX idx_tontine_creator     ON "Tontine"("creatorId");
CREATE INDEX idx_participation_user  ON "Participation"("userId");
CREATE INDEX idx_participation_tontine ON "Participation"("tontineId");
CREATE INDEX idx_cotisation_participation ON "Cotisation"("participationId");
CREATE INDEX idx_cotisation_tontine  ON "Cotisation"("tontineId");
CREATE INDEX idx_distribution_tontine ON "Distribution"("tontineId");
CREATE INDEX idx_distribution_beneficiaire ON "Distribution"("beneficiaireId");
CREATE INDEX idx_message_tontine     ON "Message"("tontineId");
CREATE INDEX idx_message_sender      ON "Message"("senderId");
CREATE INDEX idx_notification_user   ON "Notification"("userId");
CREATE INDEX idx_notification_estlue ON "Notification"("estLue");
CREATE INDEX idx_invitation_tontine  ON "Invitation"("tontineId");
CREATE INDEX idx_invitation_token    ON "Invitation"(token);
CREATE INDEX idx_signature_contrat   ON "SignatureContrat"("contratId");