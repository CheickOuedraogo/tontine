# 🚀 Test Rapide - 3 Minutes

## Étape 1: Installation (1 min)
```bash
cd backend
npm install
```

## Étape 2: Base de données (1 min)
```bash
# Créer la base
createdb tontine_db

# Initialiser le schéma
npm run init-db
```

## Étape 3: Test Email (30 sec)
```bash
npm run test-email
```
Entrez votre email et vérifiez la réception.

## Étape 4: Démarrer (30 sec)
```bash
npm run dev
```

Serveur prêt sur http://localhost:3000 ✅

## Test avec Postman

1. Importer `postman_collection.json`
2. POST `/api/auth/register`:
```json
{
  "nom": "Test",
  "prenom": "User",
  "email": "test@example.com",
  "motDePasse": "password123",
  "telephone": "+22670123456"
}
```

3. Vérifier l'email reçu avec le code OTP

4. POST `/api/auth/verify-email`:
```json
{
  "email": "test@example.com",
  "code": "123456"
}
```

5. POST `/api/auth/login`:
```json
{
  "email": "test@example.com",
  "motDePasse": "password123"
}
```

6. Copier le `accessToken` reçu

7. Créer une tontine (avec le token dans Authorization):
POST `/api/tontines`:
```json
{
  "nom": "Ma Première Tontine",
  "montantCotisation": 10000,
  "frequence": "MENSUELLE",
  "dureeTotale": 12,
  "nbMembresAttendu": 10,
  "pourcentageFrais": 2
}
```

## ✅ Succès!

Si tout fonctionne, vous avez:
- ✅ Backend démarré
- ✅ Emails envoyés
- ✅ Utilisateur créé
- ✅ Tontine créée

## 🎯 Prochaines Étapes

- Lire `API.md` pour tous les endpoints
- Consulter `ARCHITECTURE.md` pour comprendre le code
- Voir `MAILERSEND_SETUP.md` pour la config email

Bon développement! 🚀
