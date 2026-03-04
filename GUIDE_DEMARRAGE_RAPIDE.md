# 🚀 Guide de Démarrage Rapide - Projet Tontine

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- npm ou pnpm

---

## ⚡ Démarrage en 5 Minutes

### 1. Installer les dépendances
```bash
cd backend
npm install
```

### 2. Configurer PostgreSQL
```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE tontine_db;
\q
```

### 3. Vérifier la configuration
Le fichier `.env` est déjà configuré:
```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/tontine_db
MAILERSEND_API_KEY=mlsn.5742ce6b15c6b42fcce334b76408512d9a630dae579fb917ec7c85258c66701a
MAIL_FROM_EMAIL=noreply@trial-0r83ql3zx7pg2vwr.mlsender.net
```

**⚠️ Important**: Modifiez le mot de passe PostgreSQL si nécessaire

### 4. Initialiser la base de données
```bash
npm run init-db
```

### 5. Démarrer le serveur
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000` 🎉

---

## 🧪 Tester l'Installation

### Test 1: Configuration
```bash
npm run test-config
```
Devrait afficher: ✅ Configuration OK

### Test 2: Email
```bash
npm run test-email
```
Devrait envoyer un email de test

### Test 3: Fonctionnalités
```bash
npm run test-fonctionnalites
```
Devrait afficher: 68/68 fonctionnalités (100%)

---

## 📡 Tester les Endpoints

### Avec Postman
1. Importer `backend/postman_collection.json`
2. Tester les endpoints dans l'ordre:
   - Inscription
   - Vérification email
   - Connexion
   - Créer une tontine
   - Inviter un membre

### Avec cURL

#### 1. Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Doe",
    "prenom": "John",
    "email": "john@example.com",
    "motDePasse": "password123",
    "telephone": "+22670123456"
  }'
```

#### 2. Vérification Email
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'
```

#### 3. Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "motDePasse": "password123"
  }'
```

---

## 🔄 Workflow Complet de Test

### Scénario: Créer une tontine et inviter un membre

#### Étape 1: Créateur s'inscrit et se connecte
```bash
# Inscription
POST /api/auth/register

# Vérification email
POST /api/auth/verify-email

# Connexion (récupérer le token)
POST /api/auth/login
```

#### Étape 2: Créateur crée une tontine
```bash
POST /api/tontines
Authorization: Bearer {token}
{
  "nom": "Tontine Test",
  "montantCotisation": 10000,
  "frequence": "MENSUELLE",
  "dureeTotale": 12,
  "nbMembresAttendu": 5
}
```

#### Étape 3: Créateur invite un membre
```bash
POST /api/invitations/tontine/{tontineId}
Authorization: Bearer {token}
{
  "emailInvite": "membre@example.com"
}
```

#### Étape 4: Membre consulte l'invitation
```bash
GET /api/invitations/{token}
# Pas besoin d'authentification
```

#### Étape 5: Membre s'inscrit
```bash
POST /api/auth/register
{
  "email": "membre@example.com",
  ...
}
```

#### Étape 6: Membre upload sa CNIB
```bash
POST /api/users/me/cnib
Authorization: Bearer {token-membre}
{
  "urlCnib": "https://example.com/cnib.jpg"
}
```

#### Étape 7: Membre accepte l'invitation
```bash
POST /api/invitations/{token}/accepter
Authorization: Bearer {token-membre}
```

#### Étape 8: Créateur vérifie les demandes
```bash
GET /api/verifications/tontine/{tontineId}
Authorization: Bearer {token-createur}
```

#### Étape 9: Créateur valide l'identité
```bash
POST /api/verifications/participation/{participationId}/valider
Authorization: Bearer {token-createur}
```

#### Étape 10: Membre signe le contrat
```bash
POST /api/contrats/{contratId}/signer
Authorization: Bearer {token-membre}
```

#### Étape 11: Créateur démarre la tontine
```bash
POST /api/tontines/{tontineId}/start
Authorization: Bearer {token-createur}
```

#### Étape 12: Membre paie sa cotisation
```bash
POST /api/cotisations/{cotisationId}/simuler-paiement
Authorization: Bearer {token-membre}
```

---

## 📚 Documentation Complète

### Pour Comprendre le Projet
- `backend/ETAT_ACTUEL.md` - État complet du projet
- `backend/README.md` - Vue d'ensemble
- `backend/START_HERE.md` - Point d'entrée

### Pour Développer
- `backend/ARCHITECTURE.md` - Architecture détaillée
- `backend/API.md` - Documentation des endpoints
- `backend/WORKFLOW_INVITATION.md` - Processus d'invitation

### Pour Déployer
- `backend/DEPLOYMENT.md` - Guide de déploiement
- `backend/CONFIGURATION_COMPLETE.md` - Configuration

---

## 🐛 Résolution de Problèmes

### Erreur: "Cannot connect to database"
```bash
# Vérifier que PostgreSQL est démarré
# Windows
net start postgresql-x64-14

# Vérifier la connexion
psql -U postgres -d tontine_db
```

### Erreur: "Port 3000 already in use"
```bash
# Changer le port dans .env
PORT=3001
```

### Erreur: "MailerSend API error"
```bash
# Vérifier le token dans .env
# Limite: 100 emails/jour sur compte gratuit
```

### Erreur: "JWT secret not configured"
```bash
# Générer de nouveaux secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🎯 Prochaines Étapes

### 1. Développement Frontend
- Créer l'interface utilisateur
- Intégrer les appels API
- Implémenter Socket.io pour le chat

### 2. Tests
- Tests unitaires (Jest)
- Tests d'intégration
- Tests end-to-end

### 3. Déploiement
- Déployer sur Heroku/Railway/Render
- Configurer la base de données production
- Activer HTTPS

---

## ✅ Checklist de Vérification

Avant de commencer le développement frontend:

- [ ] PostgreSQL installé et démarré
- [ ] Base de données créée
- [ ] `npm install` exécuté
- [ ] `npm run init-db` exécuté avec succès
- [ ] `npm run test-config` passe
- [ ] `npm run dev` démarre le serveur
- [ ] Test d'inscription fonctionne
- [ ] Test de connexion fonctionne
- [ ] Postman collection importée

---

## 📞 Aide

### Commandes Utiles
```bash
# Voir les logs en temps réel
npm run dev

# Réinitialiser la base de données
npm run init-db

# Tester la configuration
npm run test-config

# Tester l'envoi d'emails
npm run test-email

# Vérifier les fonctionnalités
npm run test-fonctionnalites
```

### Fichiers Importants
- `.env` - Configuration
- `schema.sql` - Structure de la base de données
- `postman_collection.json` - Tests API
- `backend/ETAT_ACTUEL.md` - Documentation complète

---

## 🎉 Félicitations!

Si tous les tests passent, votre backend est **100% opérationnel** et prêt pour le développement du frontend! 🚀

**Bon développement!** 💪
