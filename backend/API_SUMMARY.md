# Résumé API - Endpoints Disponibles

## 🔓 Routes Publiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/verify-email` | Vérification email |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/forgot-password` | Mot de passe oublié |
| POST | `/api/auth/reset-password` | Réinitialisation |

## 🔒 Routes Protégées (JWT requis)

### 👤 Users
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users/me` | Mon profil |
| PUT | `/api/users/me` | Modifier profil |
| PUT | `/api/users/me/password` | Changer mot de passe |
| POST | `/api/users/me/cnib` | Upload CNIB |

### 💰 Tontines
| Méthode | Endpoint | Autorisation | Description |
|---------|----------|--------------|-------------|
| POST | `/api/tontines` | - | Créer tontine |
| GET | `/api/tontines/me` | - | Mes tontines |
| GET | `/api/tontines/:id` | Membre | Détails |
| GET | `/api/tontines/:id/membres` | Membre | Liste membres |
| POST | `/api/tontines/:id/start` | Créateur | Démarrer |

### 💵 Cotisations
| Méthode | Endpoint | Autorisation | Description |
|---------|----------|--------------|-------------|
| GET | `/api/cotisations/tontine/:id` | Membre | Liste cotisations |
| POST | `/api/cotisations/:id/payer` | - | Payer cotisation |

### 💸 Distributions
| Méthode | Endpoint | Autorisation | Description |
|---------|----------|--------------|-------------|
| GET | `/api/distributions/tontine/:id` | Membre | Liste distributions |

### 📄 Contrats
| Méthode | Endpoint | Autorisation | Description |
|---------|----------|--------------|-------------|
| POST | `/api/contrats/tontine/:id` | Créateur | Créer contrat |
| GET | `/api/contrats/tontine/:id` | Membre | Voir contrat |
| POST | `/api/contrats/:id/signer` | - | Signer |
| GET | `/api/contrats/:id/signatures` | - | Liste signatures |

### ✉️ Invitations
| Méthode | Endpoint | Autorisation | Description |
|---------|----------|--------------|-------------|
| POST | `/api/invitations/tontine/:id` | Créateur | Inviter |
| POST | `/api/invitations/:token/accepter` | - | Accepter |

### 🔔 Notifications
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Liste (paginée) |
| PUT | `/api/notifications/:id/lire` | Marquer lue |
| GET | `/api/notifications/unread-count` | Compteur |

## 🔌 Socket.io Events

### Client → Server
- `join_room` - Rejoindre une tontine
- `send_message` - Envoyer un message

### Server → Client
- `new_message` - Nouveau message reçu

## 📊 Format des Réponses

### Succès
```json
{
  "success": true,
  "data": { ... }
}
```

### Erreur
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## 🔑 Authentification

Header requis pour routes protégées:
```
Authorization: Bearer <access_token>
```

Token obtenu via `/api/auth/login`

## 📝 Validation

Tous les endpoints valident les données entrantes avec Joi.

Erreurs de validation retournent un code 400 avec les détails.

## 🚀 Base URL

Développement: `http://localhost:3000/api`
Production: `https://votre-domaine.com/api`
