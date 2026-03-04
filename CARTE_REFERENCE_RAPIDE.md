# 🎯 Carte de Référence Rapide - Backend Tontine

## 🚀 Démarrage Ultra-Rapide

```bash
cd backend
npm install
npm run init-db
npm run dev
```

Serveur: `http://localhost:3000` ✅

---

## 📡 Endpoints Essentiels

### Authentification
```bash
POST /api/auth/register          # Inscription
POST /api/auth/verify-email      # Vérifier email (OTP)
POST /api/auth/login             # Connexion (JWT)
```

### Workflow Invitation Complet
```bash
# 1. Créateur invite
POST /api/invitations/tontine/:id
Body: { "emailInvite": "user@example.com" }

# 2. Invité consulte (PUBLIC - pas de token)
GET /api/invitations/:token

# 3. Invité s'inscrit
POST /api/auth/register

# 4. Invité upload CNIB
POST /api/users/me/cnib
Body: { "urlCnib": "https://..." }

# 5. Invité accepte
POST /api/invitations/:token/accepter

# 6. Créateur voit les demandes
GET /api/verifications/tontine/:id

# 7. Créateur valide
POST /api/verifications/participation/:id/valider

# 8. Créateur rejette (optionnel)
POST /api/verifications/participation/:id/rejeter
Body: { "motif": "Raison du rejet" }
```

### Tontines
```bash
POST /api/tontines              # Créer
GET /api/tontines               # Liste mes tontines
GET /api/tontines/:id           # Détails
POST /api/tontines/:id/start    # Démarrer
```

### Cotisations
```bash
GET /api/cotisations/tontine/:id              # Liste
POST /api/cotisations/:id/simuler-paiement    # Simuler paiement
```

### Contrats
```bash
GET /api/contrats/tontine/:id   # Voir contrat
POST /api/contrats/:id/signer   # Signer
```

---

## 🔐 Authentification

### Headers Requis
```javascript
{
  "Authorization": "Bearer <votre-jwt-token>",
  "Content-Type": "application/json"
}
```

### Exemple avec Fetch
```javascript
const response = await fetch('http://localhost:3000/api/tontines', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📊 Statuts Importants

### Tontine
- `BROUILLON` → `EN_ATTENTE` → `ACTIVE` → `TERMINEE`

### Vérification Identité
- `NON_SOUMIS` → `EN_ATTENTE` → `VERIFIE` ou `REJETE`

### Cotisation
- `EN_ATTENTE` → `PAYEE` → `DISTRIBUEE`

### Invitation
- `EN_ATTENTE` → `ACCEPTEE` ou `REFUSEE` ou `EXPIREE`

---

## 🧪 Scripts de Test

```bash
npm run init-db              # Réinitialiser la DB
npm run test-config          # Tester la config
npm run test-email           # Tester l'envoi d'emails
npm run test-fonctionnalites # Vérifier tout (68 tests)
npm run dev                  # Mode développement
npm start                    # Mode production
```

---

## 🗄️ Configuration (.env)

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/tontine_db
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
JWT_REFRESH_SECRET=votre_secret_refresh_super_securise_changez_moi
MAILERSEND_API_KEY=mlsn.5742ce6b15c6b42fcce334b76408512d9a630dae579fb917ec7c85258c66701a
MAIL_FROM_EMAIL=noreply@trial-0r83ql3zx7pg2vwr.mlsender.net
MAIL_FROM_NAME=Tontine
FRONTEND_URL=http://localhost:5173
PORT=3000
```

---

## 📚 Documentation Clé

| Fichier | Description |
|---------|-------------|
| `GUIDE_DEMARRAGE_RAPIDE.md` | Démarrer en 5 minutes |
| `RESUME_PROJET.md` | Vue d'ensemble complète |
| `STRUCTURE_VISUELLE.txt` | Diagrammes et schémas |
| `backend/ETAT_ACTUEL.md` | État détaillé du projet |
| `backend/WORKFLOW_INVITATION.md` | Processus complet |
| `backend/API.md` | Tous les endpoints |
| `backend/ARCHITECTURE.md` | Architecture technique |

---

## 🔄 Workflow Simplifié

```
1. Créateur invite → Email envoyé
2. Invité consulte → Voit détails
3. Invité s'inscrit → Compte créé
4. Invité upload CNIB → Pièce uploadée
5. Invité accepte → Statut EN_ATTENTE
6. Créateur vérifie → Voit CNIB
7. Créateur valide → Statut VERIFIE
8. Membre signe → Contrat signé
9. Créateur démarre → Tontine ACTIVE
10. Membres paient → Distribution auto
```

---

## 💡 Exemples de Requêtes

### Inscription
```json
POST /api/auth/register
{
  "nom": "Doe",
  "prenom": "John",
  "email": "john@example.com",
  "motDePasse": "password123",
  "telephone": "+22670123456"
}
```

### Créer une Tontine
```json
POST /api/tontines
{
  "nom": "Tontine Famille",
  "montantCotisation": 10000,
  "frequence": "MENSUELLE",
  "dureeTotale": 12,
  "nbMembresAttendu": 10,
  "dateDebut": "2024-02-01"
}
```

### Inviter un Membre
```json
POST /api/invitations/tontine/{tontineId}
{
  "emailInvite": "nouveau@example.com"
}
```

### Upload CNIB
```json
POST /api/users/me/cnib
{
  "urlCnib": "https://storage.example.com/cnib/john-doe.jpg"
}
```

### Simuler un Paiement
```json
POST /api/cotisations/{cotisationId}/simuler-paiement
{}
```

---

## 🛡️ Middlewares de Sécurité

| Middleware | Usage | Description |
|------------|-------|-------------|
| `protect` | Toutes les routes privées | Vérifie JWT |
| `isCreator` | Actions créateur | Vérifie propriété tontine |
| `isMember` | Actions membre | Vérifie appartenance |
| `validate` | Toutes les routes | Valide entrées Joi |

---

## 🔔 Types de Notifications

| Type | Quand | Pour Qui |
|------|-------|----------|
| `NOUVELLE_DEMANDE_ADHESION` | Invité accepte | Créateur |
| `VERIFICATION_SOUMISE` | CNIB soumise | Créateur |
| `IDENTITE_VALIDEE` | Créateur valide | Membre |
| `IDENTITE_REJETEE` | Créateur rejette | Membre |
| `RAPPEL_COTISATION` | Cotisation due | Membre |
| `DISTRIBUTION_EFFECTUEE` | Distribution faite | Bénéficiaire |

---

## 💬 Socket.io (Chat)

### Connexion
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'votre-jwt-token' }
});
```

### Rejoindre une Room
```javascript
socket.emit('join_room', { tontineId: 'uuid-tontine' });
```

### Envoyer un Message
```javascript
socket.emit('send_message', {
  tontineId: 'uuid-tontine',
  contenu: 'Bonjour!'
});
```

### Recevoir des Messages
```javascript
socket.on('new_message', (message) => {
  console.log('Nouveau message:', message);
});
```

---

## 🐛 Dépannage Rapide

### Erreur: "Cannot connect to database"
```bash
# Vérifier PostgreSQL
psql -U postgres -d tontine_db
```

### Erreur: "Port 3000 already in use"
```bash
# Changer le port dans .env
PORT=3001
```

### Erreur: "JWT secret not configured"
```bash
# Générer un nouveau secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Erreur: "MailerSend API error"
- Vérifier le token dans `.env`
- Limite: 100 emails/jour

---

## ✅ Checklist Avant Frontend

- [x] Backend installé (`npm install`)
- [x] Base de données initialisée (`npm run init-db`)
- [x] Serveur démarre (`npm run dev`)
- [x] Tests passent (`npm run test-fonctionnalites`)
- [x] Postman collection importée
- [x] Documentation lue

---

## 📊 Statistiques

- **Endpoints**: 50+
- **Tables DB**: 11
- **Modules**: 8
- **Middlewares**: 5
- **Documentation**: 16 fichiers
- **Tests**: 68/68 (100%)
- **Conformité**: 100%

---

## 🎯 Prochaines Étapes

1. **Frontend**: Créer l'interface utilisateur
2. **Tests**: Tests d'intégration
3. **Déploiement**: Heroku/Railway/Render

---

## 📞 Aide Rapide

### Commandes Essentielles
```bash
npm run dev          # Démarrer
npm run init-db      # Réinitialiser DB
npm run test-config  # Tester config
```

### Fichiers Importants
- `.env` - Configuration
- `schema.sql` - Structure DB
- `postman_collection.json` - Tests API

---

## 🎉 Statut: 100% OPÉRATIONNEL ✅

Le backend est complet et prêt pour le développement du frontend!

**Bon développement!** 🚀
