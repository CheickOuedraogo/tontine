# 🚀 Bienvenue dans le Backend Tontine

## ⚡ Démarrage Rapide (5 minutes)

### 1️⃣ Installation
```bash
cd backend
npm install
```

### 2️⃣ Configuration
```bash
# Créer la base de données
createdb tontine_db

# Initialiser le schéma
npm run init-db
```

### 3️⃣ Configuration .env
Le fichier `.env` est déjà créé. Modifiez-le avec vos paramètres:
- `DATABASE_URL` - Connexion PostgreSQL
- `JWT_SECRET` - Secret pour les tokens
- `MAIL_USER` et `MAIL_PASS` - Configuration email

### 4️⃣ Démarrage
```bash
# Tester la configuration
npm run test-config

# Démarrer le serveur
npm run dev
```

Le serveur démarre sur http://localhost:3000 🎉

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| **QUICKSTART.md** | Guide de démarrage détaillé |
| **API.md** | Documentation complète des endpoints |
| **API_SUMMARY.md** | Résumé visuel de l'API |
| **ARCHITECTURE.md** | Architecture du projet |
| **DEPLOYMENT.md** | Guide de déploiement |
| **PROJECT_STATUS.md** | État d'avancement du projet |

## 🧪 Tester l'API

1. Importer `postman_collection.json` dans Postman
2. Tester l'inscription: POST `/api/auth/register`
3. Vérifier l'email (code dans les logs)
4. Se connecter: POST `/api/auth/login`
5. Utiliser le token pour les autres requêtes

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/         # Configuration (DB, mailer, CORS)
│   ├── controllers/    # Logique métier (8 fichiers)
│   ├── middlewares/    # Auth, validation, erreurs
│   ├── queries/        # Requêtes SQL (7 fichiers)
│   ├── routes/         # Définition des routes (8 fichiers)
│   ├── utils/          # Helpers et constantes
│   └── jobs/           # Tâches CRON
├── index.js            # Point d'entrée
├── schema.sql          # Schéma de la base
└── .env                # Variables d'environnement
```

## ✅ Fonctionnalités Implémentées

- ✅ Authentification complète (JWT, OTP)
- ✅ Gestion des tontines
- ✅ Cotisations et paiements
- ✅ Distributions automatiques
- ✅ Contrats électroniques
- ✅ Invitations par email
- ✅ Notifications
- ✅ Chat temps réel (Socket.io)
- ✅ Validation des données
- ✅ Sécurité (JWT, bcrypt, SQL injection protection)

## 🎯 Prochaines Étapes

1. **Tester localement** avec Postman
2. **Lire la documentation** API
3. **Intégrer avec le frontend**
4. **Déployer** en staging puis production

## 💡 Commandes Utiles

```bash
npm run dev          # Démarrage développement (avec nodemon)
npm start            # Démarrage production
npm run init-db      # Initialiser/réinitialiser la base
npm run test-config  # Tester la configuration
```

## 🆘 Besoin d'Aide?

- Consultez `QUICKSTART.md` pour un guide détaillé
- Lisez `API.md` pour la documentation des endpoints
- Vérifiez `PROJECT_STATUS.md` pour l'état du projet
- Consultez `ARCHITECTURE.md` pour comprendre la structure

## 🎉 Tout est Prêt!

Le backend est **100% fonctionnel** et prêt pour:
- Développement local ✅
- Tests avec Postman ✅
- Intégration frontend ✅
- Déploiement ✅

Bon développement! 🚀
