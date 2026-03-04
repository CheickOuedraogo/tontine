# Guide d'Installation A à Z - Tontine App

Ce document explique comment installer et lancer le projet Tontine localement.

## 1. Prérequis
- **Node.js** (v18+)
- **PostgreSQL** (v14+)
- **Expo CLI** (`npm install -g expo-cli`)
- **Git**

## 2. Clonage du projet
```bash
git clone <url-du-repo>
cd tontine
```

## 3. Configuration du Backend
1. Accédez au dossier backend :
   ```bash
   cd backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` basé sur `.env.example` :
   ```bash
   cp .env.example .env
   ```
4. Configurez les variables d'environnement dans `.env` :
   - `DATABASE_URL`: Votre URL de connexion PostgreSQL (ex: `postgres://user:pass@localhost:5432/tontine`)
   - `JWT_SECRET`: Une clé secrète aléatoire
   - `PORT`: 3000

5. Initialisez la base de données :
   - Importez le fichier `backend/schema_only.sql` dans votre base de données PostgreSQL.
   - *Optionnel*: Utilisez un outil comme DBeaver ou la ligne de commande `psql -f schema_only.sql`.

6. Lancez le backend :
   ```bash
   npm run dev
   ```

## 4. Configuration du Frontend
1. Accédez au dossier frontend :
   ```bash
   cd ../frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez l'application avec Expo :
   ```bash
   npx expo start
   ```
4. Utilisez l'application :
   - Appuyez sur **'w'** pour lancer dans le navigateur.
   - Scannez le QR code avec l'application **Expo Go** (Android/iOS) pour tester sur mobile.

## 5. Résolution de problèmes courants
- **Erreur de connexion DB**: Vérifiez que PostgreSQL est lancé et que les identifiants dans `.env` sont corrects.
- **Port déjà utilisé**: Si le port 3000 est pris, changez-le dans le `.env` du backend et mettez à jour l'URL de l'API dans `frontend/src/api/client.ts`.
