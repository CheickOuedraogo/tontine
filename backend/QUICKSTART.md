# Guide de Démarrage Rapide

## Installation en 5 minutes

### 1. Prérequis
- Node.js 18+ installé
- PostgreSQL 14+ installé et en cours d'exécution

### 2. Installation

```bash
# Installer les dépendances
npm install

# Créer la base de données
createdb tontine_db

# Initialiser le schéma
npm run init-db
```

### 3. Configuration

Éditer le fichier `.env` avec vos paramètres:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tontine_db
JWT_SECRET=changez_moi_en_production
JWT_REFRESH_SECRET=changez_moi_aussi

# MailerSend (déjà configuré avec votre token)
MAILERSEND_API_KEY=mlsn.5742ce6b15c6b42fcce334b76408512d9a630dae579fb917ec7c85258c66701a
MAIL_FROM_EMAIL=noreply@trial-0r83ql3zx7pg2vwr.mlsender.net
MAIL_FROM_NAME=Tontine
```

### 4. Démarrage

```bash
# Tester la configuration
npm run test-config

# Tester l'envoi d'emails
npm run test-email

# Démarrer en mode développement
npm run dev
```

Le serveur démarre sur http://localhost:3000

### 5. Test rapide

Ouvrir Postman et importer `postman_collection.json`, puis:

1. Créer un compte: POST `/api/auth/register`
2. Vérifier l'email (code dans les logs): POST `/api/auth/verify-email`
3. Se connecter: POST `/api/auth/login`
4. Copier le `accessToken` dans la variable Postman
5. Créer une tontine: POST `/api/tontines`

## Structure du projet

```
backend/
├── src/
│   ├── config/         # Configuration DB, mailer, CORS
│   ├── controllers/    # Logique métier
│   ├── middlewares/    # Auth, validation, erreurs
│   ├── queries/        # Requêtes SQL
│   ├── routes/         # Définition des routes
│   ├── utils/          # Helpers, constantes
│   └── jobs/           # Tâches CRON
├── index.js            # Point d'entrée
├── schema.sql          # Schéma de la base
└── .env                # Variables d'environnement
```

## Commandes utiles

```bash
npm run dev          # Démarrage développement
npm start            # Démarrage production
npm run init-db      # Initialiser la base
npm run test-config  # Tester la configuration
```

## Prochaines étapes

- Lire `API.md` pour la documentation complète
- Consulter `DEPLOYMENT.md` pour le déploiement
- Configurer les emails SMTP pour les notifications
- Personnaliser les tâches CRON dans `src/jobs/cron.js`

## Support

En cas de problème:
1. Vérifier que PostgreSQL est démarré
2. Vérifier les variables d'environnement
3. Consulter les logs du serveur
4. Exécuter `npm run test-config`
