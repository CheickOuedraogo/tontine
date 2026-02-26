# Guide de Déploiement

## Prérequis

- Node.js 18+
- PostgreSQL 14+
- Compte email SMTP (Gmail recommandé)

## Installation

1. Cloner le projet
```bash
git clone <repo-url>
cd backend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

4. Créer la base de données PostgreSQL
```bash
createdb tontine_db
```

5. Initialiser le schéma
```bash
npm run init-db
```

6. Démarrer le serveur
```bash
# Développement
npm run dev

# Production
npm start
```

## Configuration Email (Gmail)

1. Activer l'authentification à 2 facteurs sur votre compte Gmail
2. Générer un mot de passe d'application: https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `MAIL_PASS`

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| DATABASE_URL | URL PostgreSQL | postgresql://user:pass@localhost:5432/tontine_db |
| JWT_SECRET | Secret pour access token | chaîne aléatoire longue |
| JWT_REFRESH_SECRET | Secret pour refresh token | chaîne aléatoire longue |
| MAIL_HOST | Serveur SMTP | smtp.gmail.com |
| MAIL_PORT | Port SMTP | 587 |
| MAIL_USER | Email SMTP | votre@email.com |
| MAIL_PASS | Mot de passe SMTP | mot_de_passe_app |
| MAIL_FROM | Email expéditeur | noreply@tontine.com |
| FRONTEND_URL | URL frontend | http://localhost:5173 |
| PORT | Port serveur | 3000 |

## Sécurité

- Changer tous les secrets en production
- Utiliser HTTPS en production
- Configurer CORS correctement
- Limiter les tentatives de connexion
- Activer les logs de sécurité

## Monitoring

- Surveiller les logs d'erreur
- Monitorer l'utilisation de la base de données
- Vérifier les tâches CRON
- Surveiller les connexions Socket.io

## Backup

Sauvegarder régulièrement la base de données:
```bash
pg_dump tontine_db > backup_$(date +%Y%m%d).sql
```
