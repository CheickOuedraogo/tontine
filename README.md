# 🏦 Tontine - Plateforme de Gestion de Tontines

Application complète de gestion de tontines avec backend Node.js/Express et base de données PostgreSQL.

## 📋 Vue d'ensemble

Cette application permet de gérer des tontines (associations rotatives d'épargne et de crédit) avec:
- Création et gestion de tontines
- Système de cotisations et distributions automatiques
- Contrats électroniques avec signatures
- Notifications en temps réel
- Chat intégré
- Invitations par email

## 🏗️ Architecture

```
tontine/
├── backend/          # API REST + Socket.io (Node.js/Express)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── queries/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── jobs/
│   └── ...
├── frontend/         # Application web (à implémenter)
└── README.md         # Ce fichier
```

## 🚀 Démarrage Rapide

### Backend

```bash
cd backend
npm install
createdb tontine_db
npm run init-db
npm run test-email  # Tester l'envoi d'emails
npm run dev
```

Voir `backend/QUICK_TEST.md` pour un test complet en 3 minutes.
Voir `backend/START_HERE.md` pour plus de détails.

### Frontend

```bash
cd frontend
# À implémenter
```

## 📚 Documentation

### 🎓 Pour Commencer (Nouveau!)
- **[GUIDE_DEMARRAGE_RAPIDE.md](GUIDE_DEMARRAGE_RAPIDE.md)** ⭐ - Démarrer en 5 minutes
- **[RESUME_PROJET.md](RESUME_PROJET.md)** ⭐ - Vue d'ensemble complète
- **[CARTE_REFERENCE_RAPIDE.md](CARTE_REFERENCE_RAPIDE.md)** ⭐ - Aide-mémoire
- **[STRUCTURE_VISUELLE.txt](STRUCTURE_VISUELLE.txt)** ⭐ - Diagrammes
- **[INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md)** - Index complet

### Backend
- **backend/START_HERE.md** - Point de départ
- **backend/ETAT_ACTUEL.md** ⭐ - État détaillé du backend
- **backend/WORKFLOW_INVITATION.md** ⭐ - Processus d'invitation complet
- **backend/NOUVELLES_FONCTIONNALITES.md** - Dernières fonctionnalités
- **backend/QUICK_TEST.md** - Test rapide en 3 minutes
- **backend/QUICKSTART.md** - Guide de démarrage rapide
- **backend/MAILERSEND_SETUP.md** - Configuration email
- **backend/API.md** - Documentation complète de l'API
- **backend/API_SUMMARY.md** - Résumé des endpoints
- **backend/ARCHITECTURE.md** - Architecture détaillée
- **backend/DEPLOYMENT.md** - Guide de déploiement
- **backend/PROJECT_STATUS.md** - État du projet

### Collection Postman
Importer `backend/postman_collection.json` pour tester l'API.

## ✨ Fonctionnalités

### ✅ Implémenté (Backend)
- Authentification JWT avec vérification email
- Gestion complète des tontines
- Système de cotisations et paiements
- Distributions automatiques
- Contrats électroniques avec signatures
- Invitations par email
- Notifications en temps réel
- Chat Socket.io
- Tâches CRON planifiées
- Validation des données
- Sécurité complète

### 🔜 À venir
- Interface frontend
- Application mobile
- Upload de fichiers
- Statistiques et tableaux de bord
- Export de données

## 🛠️ Technologies

### Backend
- Node.js + Express
- PostgreSQL
- Socket.io
- JWT (jsonwebtoken)
- Bcrypt
- MailerSend (emails)
- Joi (validation)
- Node-cron

### Frontend (prévu)
- React / Vue / Angular
- Socket.io client
- Axios / Fetch

## 📊 Base de Données

PostgreSQL avec:
- 11 tables principales
- Types ENUM pour les statuts
- Transactions atomiques
- Index optimisés
- Contraintes d'intégrité

Voir `backend/schema.sql` pour le schéma complet.

## 🔒 Sécurité

- Authentification JWT (access + refresh tokens)
- Hachage bcrypt des mots de passe
- Protection contre injection SQL
- Validation des entrées (Joi)
- CORS configuré
- Middlewares d'autorisation

## 🧪 Tests

### Backend
```bash
cd backend
npm run test-config  # Tester la configuration
npm run test-email   # Tester l'envoi d'emails
```

Importer `postman_collection.json` dans Postman pour tester l'API.

## 📦 Déploiement

Voir `backend/DEPLOYMENT.md` pour le guide complet.

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Compte MailerSend (gratuit, déjà configuré)

### Variables d'environnement
Voir `backend/.env.example` et `backend/.env.production.example`

## 🤝 Contribution

Voir `backend/CONTRIBUTING.md` pour les guidelines.

## 📝 Changelog

Voir `backend/CHANGELOG.md` pour l'historique des versions.

## 📄 Licence

À définir

## 👥 Auteurs

Projet Tontine - 2024

## 🆘 Support

Pour toute question:
1. Consulter la documentation dans `backend/`
2. Vérifier `backend/PROJECT_STATUS.md`
3. Ouvrir une issue sur le repository

## 🎯 Statut du Projet

- Backend: ✅ **100% fonctionnel**
- Frontend: 🔜 À implémenter
- Mobile: 🔜 À implémenter

Le backend est prêt pour l'intégration et le déploiement!

---

**Démarrez ici:** `backend/START_HERE.md` 🚀

**Test rapide:** `backend/QUICK_TEST.md` ⚡

**Configuration email:** `backend/MAILERSEND_READY.md` 📧
