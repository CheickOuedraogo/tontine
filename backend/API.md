# Documentation API Tontine

Base URL: `http://localhost:3000/api`

## Authentication

Toutes les routes protégées nécessitent un header:
```
Authorization: Bearer <access_token>
```

---

## Auth Routes

### POST /auth/register
Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "nom": "Doe",
  "prenom": "John",
  "email": "john@example.com",
  "motDePasse": "password123",
  "telephone": "+22670123456"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Inscription reussie. Verifiez votre email.",
  "userId": "uuid"
}
```

### POST /auth/verify-email
Vérification de l'email avec code OTP

**Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

### POST /auth/login
Connexion utilisateur

**Body:**
```json
{
  "email": "john@example.com",
  "motDePasse": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "nom": "Doe",
    "prenom": "John",
    "email": "john@example.com"
  }
}
```

---

## Users Routes (Protected)

### GET /users/me
Récupérer le profil de l'utilisateur connecté

### PUT /users/me
Mettre à jour le profil

**Body:**
```json
{
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+22670123456",
  "photo": "url_photo"
}
```

### PUT /users/me/password
Changer le mot de passe

**Body:**
```json
{
  "ancienMotDePasse": "old_password",
  "nouveauMotDePasse": "new_password"
}
```

---

## Tontines Routes (Protected)

### POST /tontines
Créer une nouvelle tontine

**Body:**
```json
{
  "nom": "Tontine Famille",
  "montantCotisation": 10000,
  "frequence": "MENSUELLE",
  "dureeTotale": 12,
  "nbMembresAttendu": 10,
  "pourcentageFrais": 2
}
```

**Frequence:** `QUOTIDIENNE` | `HEBDOMADAIRE` | `MENSUELLE` | `TRIMESTRIELLE`

### GET /tontines/me
Liste des tontines de l'utilisateur

### GET /tontines/:tontineId
Détails d'une tontine (membre requis)

### GET /tontines/:tontineId/membres
Liste des membres d'une tontine

### POST /tontines/:tontineId/start
Démarrer une tontine (créateur uniquement)

**Body:**
```json
{
  "dateDebut": "2024-01-01"
}
```

---

## Cotisations Routes (Protected)

### GET /cotisations/tontine/:tontineId?cycleNumero=1
Liste des cotisations d'une tontine pour un cycle

### POST /cotisations/:cotisationId/payer
Payer une cotisation

**Body:**
```json
{
  "simulationRef": "PAYMENT_REF_123"
}
```

---

## Distributions Routes (Protected)

### GET /distributions/tontine/:tontineId
Liste des distributions d'une tontine

---

## Contrats Routes (Protected)

### POST /contrats/tontine/:tontineId
Créer un contrat pour une tontine (créateur uniquement)

**Body:**
```json
{
  "texteContrat": "Contenu du contrat..."
}
```

### GET /contrats/tontine/:tontineId
Récupérer le contrat d'une tontine

### POST /contrats/:contratId/signer
Signer un contrat

### GET /contrats/:contratId/signatures
Liste des signatures d'un contrat

---

## Invitations Routes (Protected)

### POST /invitations/tontine/:tontineId
Inviter un membre (créateur uniquement)

**Body:**
```json
{
  "emailInvite": "nouveau@example.com"
}
```

### POST /invitations/:token/accepter
Accepter une invitation

---

## Notifications Routes (Protected)

### GET /notifications?page=1&limit=20
Liste des notifications de l'utilisateur

### PUT /notifications/:notificationId/lire
Marquer une notification comme lue

### GET /notifications/unread-count
Nombre de notifications non lues

---

## Socket.io Events

### Client → Server

**join_room**
```javascript
socket.emit('join_room', { tontineId: 'uuid' });
```

**send_message**
```javascript
socket.emit('send_message', { 
  tontineId: 'uuid', 
  contenu: 'Message text' 
});
```

### Server → Client

**new_message**
```javascript
socket.on('new_message', (message) => {
  // message: { id, tontineId, senderId, contenu, dateEnvoi }
});
```

---

## Codes d'erreur

- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource introuvable
- `500` - Erreur serveur
