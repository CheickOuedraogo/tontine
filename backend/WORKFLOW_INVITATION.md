# Workflow d'Invitation et Vérification d'Identité

## 📋 Vue d'ensemble

Ce document décrit le processus complet d'invitation et de vérification d'identité pour rejoindre une tontine.

## 🔄 Processus Complet

### 1️⃣ Invitation (Créateur)

**Endpoint:** `POST /api/invitations/tontine/:tontineId`

Le créateur envoie une invitation par email:

```json
{
  "emailInvite": "nouveau@example.com"
}
```

**Ce qui se passe:**
- Un token unique est généré
- Un email est envoyé avec un lien d'invitation
- L'invitation expire après 7 jours

---

### 2️⃣ Consultation de l'Invitation (Invité)

**Endpoint:** `GET /api/invitations/:token`

L'invité clique sur le lien et voit les détails de la tontine:

```json
{
  "success": true,
  "invitation": {
    "emailInvite": "nouveau@example.com",
    "statut": "EN_ATTENTE",
    "tontine": {
      "nom": "Tontine Famille",
      "montantCotisation": 10000,
      "frequence": "MENSUELLE",
      "dureeTotale": 12,
      "nbMembresActuels": 5,
      "nbMembresAttendu": 10
    }
  }
}
```

---

### 3️⃣ Inscription (Invité)

Si l'invité n'a pas encore de compte, il s'inscrit:

**Endpoint:** `POST /api/auth/register`

```json
{
  "nom": "Doe",
  "prenom": "John",
  "email": "nouveau@example.com",
  "motDePasse": "password123",
  "telephone": "+22670123456"
}
```

Puis vérifie son email avec le code OTP reçu.

---

### 4️⃣ Upload de la CNIB (Invité)

**Endpoint:** `POST /api/users/me/cnib`

L'invité upload sa pièce d'identité:

```json
{
  "urlCnib": "https://storage.example.com/cnib/john-doe.jpg"
}
```

---

### 5️⃣ Acceptation de l'Invitation (Invité)

**Endpoint:** `POST /api/invitations/:token/accepter`

L'invité accepte l'invitation (doit être connecté):

**Vérifications automatiques:**
- ✅ Email correspond à l'invitation
- ✅ CNIB uploadée
- ✅ Invitation valide et non expirée

**Résultat:**
- L'utilisateur est ajouté à la tontine
- Statut de vérification: `EN_ATTENTE`
- Le créateur reçoit une notification

---

### 6️⃣ Vérification d'Identité (Créateur)

#### a) Liste des membres en attente

**Endpoint:** `GET /api/verifications/tontine/:tontineId`

Le créateur voit tous les membres en attente de vérification:

```json
{
  "success": true,
  "membresEnAttente": [
    {
      "id": "participation-uuid",
      "userId": "user-uuid",
      "nom": "Doe",
      "prenom": "John",
      "email": "nouveau@example.com",
      "telephone": "+22670123456",
      "urlCnib": "https://storage.example.com/cnib/john-doe.jpg",
      "statutVerifIdentite": "EN_ATTENTE",
      "dateAdhesion": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### b) Validation de l'identité

**Endpoint:** `POST /api/verifications/participation/:participationId/valider`

Le créateur valide l'identité:

```json
{
  "success": true,
  "message": "Identité validée avec succès"
}
```

**Ce qui se passe:**
- Statut passe à `VERIFIE`
- Le membre reçoit une notification
- Le membre peut maintenant signer le contrat

#### c) Rejet de l'identité

**Endpoint:** `POST /api/verifications/participation/:participationId/rejeter`

Le créateur rejette l'identité:

```json
{
  "motif": "La photo ne correspond pas à la personne invitée"
}
```

**Ce qui se passe:**
- Statut passe à `REJETE`
- Le membre reçoit une notification avec le motif
- La participation est conservée pour historique

---

### 7️⃣ Signature du Contrat (Membre Vérifié)

Une fois l'identité validée, le membre peut signer le contrat:

**Endpoint:** `POST /api/contrats/:contratId/signer`

---

### 8️⃣ Démarrage de la Tontine (Créateur)

Le créateur peut démarrer la tontine quand:
- ✅ Nombre de membres atteint
- ✅ Tous les membres ont l'identité vérifiée
- ✅ Tous les membres ont signé le contrat

**Endpoint:** `POST /api/tontines/:tontineId/start`

---

## 📊 Statuts de Vérification

| Statut | Description |
|--------|-------------|
| `NON_SOUMIS` | Membre ajouté mais CNIB non uploadée |
| `EN_ATTENTE` | CNIB soumise, en attente de validation |
| `VERIFIE` | Identité validée par le créateur |
| `REJETE` | Identité rejetée par le créateur |

---

## 🔐 Sécurité

### Vérifications automatiques

1. **Invitation:**
   - Token unique et sécurisé
   - Expiration après 7 jours
   - Email doit correspondre

2. **Acceptation:**
   - Utilisateur doit être connecté
   - Email doit correspondre à l'invitation
   - CNIB doit être uploadée

3. **Vérification:**
   - Seul le créateur peut valider/rejeter
   - Notifications automatiques

---

## 💰 Simulation de Paiement

Pour les tests sans intégration de paiement réelle:

**Endpoint:** `POST /api/cotisations/:cotisationId/simuler-paiement`

```json
{
  "success": true,
  "message": "Paiement simulé avec succès",
  "simulationRef": "SIM-1234567890-ABC123",
  "cotisation": { ... }
}
```

**Ce qui se passe:**
- Génère une référence de simulation unique
- Marque la cotisation comme payée
- Déclenche la distribution si tous ont payé

---

## 📧 Notifications Automatiques

### Pour le Créateur

1. **Nouvelle demande d'adhésion**
   - Quand un invité accepte l'invitation
   - Type: `NOUVELLE_DEMANDE_ADHESION`

2. **Vérification soumise**
   - Quand un membre soumet sa CNIB
   - Type: `VERIFICATION_SOUMISE`

### Pour le Membre

1. **Identité validée**
   - Quand le créateur valide l'identité
   - Type: `IDENTITE_VALIDEE`

2. **Identité rejetée**
   - Quand le créateur rejette l'identité
   - Type: `IDENTITE_REJETEE`
   - Contient le motif du rejet

---

## 🧪 Exemple de Test Complet

### 1. Créateur invite un membre
```bash
POST /api/invitations/tontine/tontine-uuid
{
  "emailInvite": "test@example.com"
}
```

### 2. Invité s'inscrit
```bash
POST /api/auth/register
{
  "nom": "Test",
  "prenom": "User",
  "email": "test@example.com",
  "motDePasse": "password123"
}
```

### 3. Invité vérifie son email
```bash
POST /api/auth/verify-email
{
  "email": "test@example.com",
  "code": "123456"
}
```

### 4. Invité se connecte
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "motDePasse": "password123"
}
```

### 5. Invité upload sa CNIB
```bash
POST /api/users/me/cnib
{
  "urlCnib": "https://example.com/cnib.jpg"
}
```

### 6. Invité accepte l'invitation
```bash
POST /api/invitations/token-uuid/accepter
```

### 7. Créateur vérifie les demandes
```bash
GET /api/verifications/tontine/tontine-uuid
```

### 8. Créateur valide l'identité
```bash
POST /api/verifications/participation/participation-uuid/valider
```

### 9. Membre signe le contrat
```bash
POST /api/contrats/contrat-uuid/signer
```

### 10. Créateur démarre la tontine
```bash
POST /api/tontines/tontine-uuid/start
```

---

## ✅ Points Clés

1. **Sécurité:** Vérification d'identité obligatoire avant participation
2. **Traçabilité:** Toutes les actions sont enregistrées
3. **Notifications:** Communication automatique entre créateur et membres
4. **Flexibilité:** Le créateur peut rejeter une demande avec motif
5. **Simulation:** Paiements simulés pour les tests

---

## 🔗 Endpoints Résumés

| Endpoint | Méthode | Rôle | Description |
|----------|---------|------|-------------|
| `/api/invitations/tontine/:id` | POST | Créateur | Inviter un membre |
| `/api/invitations/:token` | GET | Public | Voir détails invitation |
| `/api/invitations/:token/accepter` | POST | Invité | Accepter invitation |
| `/api/verifications/tontine/:id` | GET | Créateur | Liste membres en attente |
| `/api/verifications/participation/:id/valider` | POST | Créateur | Valider identité |
| `/api/verifications/participation/:id/rejeter` | POST | Créateur | Rejeter identité |
| `/api/cotisations/:id/simuler-paiement` | POST | Membre | Simuler un paiement |
