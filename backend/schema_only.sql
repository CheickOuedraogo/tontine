--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: frequence_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.frequence_enum AS ENUM (
    'QUOTIDIENNE',
    'HEBDOMADAIRE',
    'MENSUELLE',
    'TRIMESTRIELLE'
);


ALTER TYPE public.frequence_enum OWNER TO postgres;

--
-- Name: role_systeme_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_systeme_enum AS ENUM (
    'USER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public.role_systeme_enum OWNER TO postgres;

--
-- Name: statut_cotisation_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_cotisation_enum AS ENUM (
    'EN_ATTENTE',
    'PAYEE',
    'EN_RETARD',
    'ANNULEE'
);


ALTER TYPE public.statut_cotisation_enum OWNER TO postgres;

--
-- Name: statut_deblocage_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_deblocage_enum AS ENUM (
    'NON_DEMANDE',
    'EN_ATTENTE',
    'VALIDE',
    'REJETE'
);


ALTER TYPE public.statut_deblocage_enum OWNER TO postgres;

--
-- Name: statut_distribution_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_distribution_enum AS ENUM (
    'PLANIFIEE',
    'EFFECTUEE',
    'ANNULEE'
);


ALTER TYPE public.statut_distribution_enum OWNER TO postgres;

--
-- Name: statut_invitation_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_invitation_enum AS ENUM (
    'EN_ATTENTE',
    'ACCEPTEE',
    'REFUSEE',
    'EXPIREE'
);


ALTER TYPE public.statut_invitation_enum OWNER TO postgres;

--
-- Name: statut_tontine_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_tontine_enum AS ENUM (
    'EN_ATTENTE',
    'ACTIVE',
    'TERMINEE',
    'ANNULEE'
);


ALTER TYPE public.statut_tontine_enum OWNER TO postgres;

--
-- Name: statut_user_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_user_enum AS ENUM (
    'ACTIF',
    'INACTIF',
    'SUSPENDU',
    'BANNI'
);


ALTER TYPE public.statut_user_enum OWNER TO postgres;

--
-- Name: statut_verif_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_verif_enum AS ENUM (
    'NON_SOUMIS',
    'EN_ATTENTE',
    'VERIFIE',
    'REJETE'
);


ALTER TYPE public.statut_verif_enum OWNER TO postgres;

--
-- Name: type_message_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_message_enum AS ENUM (
    'text',
    'system'
);


ALTER TYPE public.type_message_enum OWNER TO postgres;

--
-- Name: type_tontine_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_tontine_enum AS ENUM (
    'CLASSIQUE',
    'ACHAT_COMMUN'
);


ALTER TYPE public.type_tontine_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;


--
-- Name: Cotisation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cotisation" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "participationId" uuid NOT NULL,
    "tontineId" uuid NOT NULL,
    montant numeric(15,2) NOT NULL,
    "datePrevue" date NOT NULL,
    "datePaiement" timestamp with time zone,
    statut public.statut_cotisation_enum DEFAULT 'EN_ATTENTE'::public.statut_cotisation_enum NOT NULL,
    "simulationRef" character varying(255),
    "cycleNumero" integer NOT NULL
);


ALTER TABLE public."Cotisation" OWNER TO postgres;

--
-- Name: Distribution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Distribution" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tontineId" uuid NOT NULL,
    "beneficiaireId" uuid NOT NULL,
    "montantBrut" numeric(15,2) NOT NULL,
    "montantFrais" numeric(15,2) DEFAULT 0 NOT NULL,
    "montantNet" numeric(15,2) NOT NULL,
    "datePrevue" date NOT NULL,
    "dateEffective" timestamp with time zone,
    "cycleNumero" integer NOT NULL,
    statut public.statut_distribution_enum DEFAULT 'PLANIFIEE'::public.statut_distribution_enum NOT NULL
);


ALTER TABLE public."Distribution" OWNER TO postgres;

--
-- Name: Invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invitation" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tontineId" uuid NOT NULL,
    "emailInvite" character varying(255) NOT NULL,
    token uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    statut public.statut_invitation_enum DEFAULT 'EN_ATTENTE'::public.statut_invitation_enum NOT NULL,
    "dateExpiration" timestamp with time zone NOT NULL
);


ALTER TABLE public."Invitation" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tontineId" uuid NOT NULL,
    "senderId" uuid NOT NULL,
    contenu text NOT NULL,
    "dateEnvoi" timestamp with time zone DEFAULT now() NOT NULL,
    "typeMessage" public.type_message_enum DEFAULT 'text'::public.type_message_enum NOT NULL
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    type character varying(100) NOT NULL,
    titre character varying(255) NOT NULL,
    contenu text NOT NULL,
    "estLue" boolean DEFAULT false NOT NULL,
    "dateCreation" timestamp with time zone DEFAULT now() NOT NULL,
    "lienAction" text
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Participation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Participation" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "tontineId" uuid NOT NULL,
    "ordreDistribution" integer,
    "aRecu" boolean DEFAULT false NOT NULL,
    "dateAdhesion" timestamp with time zone DEFAULT now() NOT NULL,
    "statutVerifIdentite" public.statut_verif_enum DEFAULT 'NON_SOUMIS'::public.statut_verif_enum NOT NULL,
    "pieceIdentiteUrl" text,
    "aValideDeblocage" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Participation" OWNER TO postgres;


--
-- Name: Tontine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tontine" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nom character varying(255) NOT NULL,
    "montantCotisation" numeric(15,2) NOT NULL,
    frequence public.frequence_enum NOT NULL,
    "dureeTotale" integer NOT NULL,
    "nbMembresAttendu" integer NOT NULL,
    "dateDebut" date,
    "dateFin" date,
    statut public.statut_tontine_enum DEFAULT 'EN_ATTENTE'::public.statut_tontine_enum NOT NULL,
    "pourcentageFrais" numeric(5,2) DEFAULT 0 NOT NULL,
    "creatorId" uuid NOT NULL,
    type public.type_tontine_enum DEFAULT 'CLASSIQUE'::public.type_tontine_enum NOT NULL,
    "statutDeblocage" public.statut_deblocage_enum DEFAULT 'NON_DEMANDE'::public.statut_deblocage_enum NOT NULL,
    visibilite character varying(20) DEFAULT 'PUBLIQUE'::character varying,
    "dateLimiteInscription" date,
    "createdAt" timestamp with time zone DEFAULT now(),
    "intervalleJours" integer DEFAULT 30 NOT NULL,
    "nombreCycles" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."Tontine" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    telephone character varying(20),
    "motDePasseHash" text NOT NULL,
    photo text,
    statut public.statut_user_enum DEFAULT 'ACTIF'::public.statut_user_enum NOT NULL,
    "dateInscription" timestamp with time zone DEFAULT now() NOT NULL,
    "roleSysteme" public.role_systeme_enum DEFAULT 'USER'::public.role_systeme_enum NOT NULL,
    "estVerifie" boolean DEFAULT false NOT NULL,
    "urlCnib" text,
    "emailVerificationToken" character varying(255),
    "emailVerificationExpires" timestamp with time zone,
    "resetPasswordToken" character varying(255),
    "resetPasswordExpires" timestamp with time zone
);


ALTER TABLE public."User" OWNER TO postgres;



--
-- Name: Cotisation Cotisation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cotisation"
    ADD CONSTRAINT "Cotisation_pkey" PRIMARY KEY (id);


--
-- Name: Distribution Distribution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Distribution"
    ADD CONSTRAINT "Distribution_pkey" PRIMARY KEY (id);


--
-- Name: Invitation Invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_pkey" PRIMARY KEY (id);


--
-- Name: Invitation Invitation_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_token_key" UNIQUE (token);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Participation Participation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Participation"
    ADD CONSTRAINT "Participation_pkey" PRIMARY KEY (id);


--
-- Name: Participation Participation_userId_tontineId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Participation"
    ADD CONSTRAINT "Participation_userId_tontineId_key" UNIQUE ("userId", "tontineId");




--
-- Name: Tontine Tontine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tontine"
    ADD CONSTRAINT "Tontine_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: idx_cotisation_participation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cotisation_participation ON public."Cotisation" USING btree ("participationId");


--
-- Name: idx_cotisation_tontine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cotisation_tontine ON public."Cotisation" USING btree ("tontineId");


--
-- Name: idx_distribution_beneficiaire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_distribution_beneficiaire ON public."Distribution" USING btree ("beneficiaireId");


--
-- Name: idx_distribution_tontine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_distribution_tontine ON public."Distribution" USING btree ("tontineId");


--
-- Name: idx_invitation_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitation_token ON public."Invitation" USING btree (token);


--
-- Name: idx_invitation_tontine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitation_tontine ON public."Invitation" USING btree ("tontineId");


--
-- Name: idx_message_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_sender ON public."Message" USING btree ("senderId");


--
-- Name: idx_message_tontine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_tontine ON public."Message" USING btree ("tontineId");


--
-- Name: idx_notification_estlue; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_estlue ON public."Notification" USING btree ("estLue");


--
-- Name: idx_notification_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_user ON public."Notification" USING btree ("userId");


--
-- Name: idx_participation_tontine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participation_tontine ON public."Participation" USING btree ("tontineId");


--
-- Name: idx_participation_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participation_user ON public."Participation" USING btree ("userId");




--
-- Name: idx_tontine_creator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tontine_creator ON public."Tontine" USING btree ("creatorId");


--
-- Name: idx_user_email_verification_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_email_verification_token ON public."User" USING btree ("emailVerificationToken");


--
-- Name: idx_user_reset_password_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_reset_password_token ON public."User" USING btree ("resetPasswordToken");




--
-- Name: Cotisation Cotisation_participationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cotisation"
    ADD CONSTRAINT "Cotisation_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES public."Participation"(id) ON DELETE CASCADE;


--
-- Name: Cotisation Cotisation_tontineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cotisation"
    ADD CONSTRAINT "Cotisation_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES public."Tontine"(id) ON DELETE CASCADE;


--
-- Name: Distribution Distribution_beneficiaireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Distribution"
    ADD CONSTRAINT "Distribution_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES public."User"(id) ON DELETE RESTRICT;


--
-- Name: Distribution Distribution_tontineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Distribution"
    ADD CONSTRAINT "Distribution_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES public."Tontine"(id) ON DELETE CASCADE;


--
-- Name: Invitation Invitation_tontineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES public."Tontine"(id) ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON DELETE RESTRICT;


--
-- Name: Message Message_tontineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES public."Tontine"(id) ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Participation Participation_tontineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Participation"
    ADD CONSTRAINT "Participation_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES public."Tontine"(id) ON DELETE CASCADE;


--
-- Name: Participation Participation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Participation"
    ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE RESTRICT;




--
-- Name: Tontine Tontine_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tontine"
    ADD CONSTRAINT "Tontine_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

