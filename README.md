# Plateforme de Gestion de Tontines

Application complète de gestion de tontines avec backend Node.js/Express et base de données PostgreSQL.

## Vue d'ensemble

Cette application permet de gérer des tontines (associations rotatives d'épargne et de crédit) avec:
- Création et gestion de tontines
- Système de cotisations et distributions automatiques
- Notifications en temps réel
- Chat intégré

## Démarrage Rapide

### Backend
Aller sur postgres sql, creer votre base de donnée
creer un fichier .env en vous basant sur .env.example, et remplir les champs nécessaires dont celui de l'url de connexion a votre base de donnée postgres sql.

```bash
cd backend
npm install
npm run init-db
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npx expo start --web
```