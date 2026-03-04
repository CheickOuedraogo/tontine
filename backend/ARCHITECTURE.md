# Architecture Backend Tontine

## Vue d'ensemble

L'application suit une architecture en couches avec séparation des responsabilités:

```
Client (Frontend/Mobile)
         ↓
    API REST + Socket.io
         ↓
    Routes → Middlewares → Controllers
         ↓
    Queries (Data Access Layer)
         ↓
    PostgreSQL Database
```

## Couches de l'application

### 1. Routes (`src/routes/`)
- Définition des endpoints HTTP
- Application des middlewares (auth, validation)
- Routage vers les controllers appropriés

### 2. Middlewares (`src/middlewares/`)
- `auth.middleware.js` - Vérification JWT
- `isCreator.middleware.js` - Vérification créateur de tontine
- `isMember.middleware.js` - Vérification membre de tontine
- `validation.middleware.js` - Validation des données avec Joi
- `errorHandler.js` - Gestion centralisée des erreurs

### 3. Controllers (`src/controllers/`)
- Logique métier de l'application
- Orchestration des queries
- Gestion des réponses HTTP
- Pas d'accès direct à la base de données

### 4. Queries (`src/queries/`)
- Couche d'accès aux données
- Requêtes SQL paramétrées
- Transactions atomiques
- Retourne des objets JavaScript

### 5. Utils (`src/utils/`)
- `helpers.js` - Fonctions utilitaires (JWT, hash, calculs)
- `constants.js` - Constantes de l'application
- `ApiError.js` - Classe d'erreur personnalisée
- `asyncHandler.js` - Wrapper pour gestion async/await

### 6. Config (`src/config/`)
- `db.js` - Pool de connexions PostgreSQL
- `mailer.js` - Configuration Nodemailer
- `cors.js` - Configuration CORS

### 7. Jobs (`src/jobs/`)
- `cron.js` - Tâches planifiées (rappels, distributions)

## Flux de données

### Exemple: Création d'une tontine

```
1. Client → POST /api/tontines
2. Route → protect middleware (vérifie JWT)
3. Route → validate middleware (vérifie données)
4. Route → createTontine controller
5. Controller → tontineQ.create() query
6. Query → INSERT INTO "Tontine"
7. Query → return tontine object
8. Controller → tontineQ.addMembre() (ajoute créateur)
9. Controller → return response JSON
10. Client ← 201 Created + tontine data
```

## Sécurité

### Authentification
- JWT avec access token (15min) et refresh token (7j)
- Tokens stockés côté client
- Vérification à chaque requête protégée

### Autorisation
- Middleware `isCreator` pour actions créateur
- Middleware `isMember` pour accès tontine
- Vérification au niveau route

### Validation
- Joi schemas pour validation des entrées
- Paramètres SQL échappés (protection injection)
- Hachage bcrypt pour mots de passe

## Base de données

### Modèle relationnel
```
User ←→ Participation ←→ Tontine
         ↓                  ↓
    Cotisation         Distribution
         ↓                  ↓
    (cycle)            (bénéficiaire)
```

### Transactions
- Paiement cotisation + création distribution
- Signature contrat + mise à jour participation
- Utilisation de `getClient()` pour transactions

## Communication temps réel

### Socket.io
- Authentification via token dans handshake
- Rooms par tontine (isolation des messages)
- Events: `join_room`, `send_message`, `new_message`

## Tâches planifiées

### CRON Jobs
- Rappels J-3 et J-1 pour cotisations
- Distributions automatiques
- Vérification invitations expirées
- Exécution quotidienne à heures fixes

## Gestion des erreurs

### Hiérarchie
```
Error
  ↓
ApiError (custom)
  ↓
errorHandler middleware
  ↓
Response JSON standardisée
```

### Format de réponse
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## Scalabilité

### Optimisations possibles
- Cache Redis pour sessions/OTP
- Queue (Bull/BullMQ) pour emails/notifications
- CDN pour fichiers statiques (photos, CNIB)
- Réplication PostgreSQL (read replicas)
- Load balancer pour instances multiples

### Monitoring
- Logs structurés (Winston/Pino)
- Métriques (Prometheus)
- Tracing (Jaeger/OpenTelemetry)
- Health checks endpoints

## Tests

### Structure recommandée
```
tests/
├── unit/           # Tests unitaires (queries, utils)
├── integration/    # Tests d'intégration (controllers)
└── e2e/           # Tests end-to-end (API complète)
```

### Outils suggérés
- Jest pour tests unitaires
- Supertest pour tests API
- Mock de la base de données

## Déploiement

### Environnements
- Development (local)
- Staging (pré-production)
- Production

### CI/CD
1. Tests automatiques
2. Build
3. Migration base de données
4. Déploiement
5. Health check

### Hébergement suggéré
- Backend: Heroku, Railway, Render
- Base de données: Heroku Postgres, Supabase
- Files: AWS S3, Cloudinary
