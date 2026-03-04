# Architecture et Logique du Projet - Tontine

## 1. Structure Globale
L'application est divisée en deux parties principales :
- **Backend** : API REST Node.js/Express avec base de données PostgreSQL.
- **Frontend** : Application mobile/web React Native avec Expo.

## 2. Logique de la Tontine (Un-seul-Tour)
Conformément aux dernières simplifications, l'application fonctionne désormais sur un modèle de **Tour unique** :
- Une tontine est créée avec un montant, un intervalle et un nombre de membres.
- Lorsqu'elle est démarrée, le système génère **une seule distribution** pour le premier bénéficiaire désigné par l'ordre défini.
- Chaque membre doit payer sa cotisation pour que la distribution soit débloquée.
- Une fois la distribution effectuée, la tontine est considérée comme ayant complété son tour actuel.

## 3. Architecture Backend
- **Controllers** (`backend/src/controllers`) : Gèrent la logique métier des requêtes.
- **Queries** (`backend/src/queries`) : Contiennent toutes les requêtes SQL brutes pour une performance optimale.
- **Middlewares** : 
  - `auth.middleware.js`: Gestion de l'authentification JWT.
  - `validation.middleware.js`: Validation des données entrantes avec Joi.
- **Base de données** : PostgreSQL avec des types ENUM pour sécuriser les statuts (PAYEE, EN_ATTENTE, etc.).

## 4. Architecture Frontend
- **Store** (`frontend/src/store`) : Gestion d'état globale avec **Zustand**.
  - `useAuthStore`: Session utilisateur.
  - `useTontineStore`: Données des tontines et invitations.
- **Screens** : Organisation modulaire par fonctionnalité (Auth, Tontines, Cotisations, Profile).
- **Hooks** : Logique réutilisable pour les interactions API.

## 5. Flux de Paiement
1. Un membre lance un paiement via l'écran des Cotisations.
2. Le backend simule la transaction avec une référence de paiement.
3. Le statut de la cotisation passe à `PAYEE`.
4. Le système vérifie si toutes les cotisations du tour sont payées.
5. Si oui, la distribution associée passe à `EFFECTUEE` et le bénéficiaire est notifié.
