# Plateforme de Gestion de Tontines

Application complète de gestion de tontines avec backend Node.js/Express et base de données PostgreSQL.

## Vue d'ensemble

Cette application permet de gérer des tontines (associations rotatives d'épargne et de crédit) avec:
- Création et gestion de tontines
- Système de cotisations et distributions automatiques
- Notifications en temps réel
- Chat intégré

## Démarrage Rapide

### 1. Configuration de l'environnement
1. **Base de données** : Créez une base de données PostgreSQL.
2. **Variables d'environnement** :
   - Dans le dossier `backend`, créez un fichier `.env`.
   - Copiez le contenu de `.env.example` et remplissez `DATABASE_URL` avec votre URL PostgreSQL.

### 2. Installation et Lancement
Depuis la racine du projet, lancez :

```bash
# Installation de toutes les dépendances et initialisation de la base
npm install
npm run setup

# Lancement simultané du backend et du frontend
npm start
```
