# Plan d'Améliorations - Système de Tontine

## Améliorations demandées

### 1. Choix de l'opérateur dans la simulation de paiement
**Besoin**: Permettre à l'utilisateur de choisir l'opérateur mobile (Orange Money, Moov Money, Coris Money) lors de la simulation de paiement.

**Modifications**:
- **Backend**: Ajouter un champ `operateur` dans la table `Cotisation`
- **Backend**: Modifier l'endpoint `simulerPaiement` pour accepter le paramètre `operateur`
- **Frontend**: Ajouter un sélecteur d'opérateur dans l'écran de paiement

### 2. Modification de l'ordre de distribution par le créateur
**Besoin**: Le créateur peut modifier l'ordre de distribution tant que la personne n'a pas encore reçu sa distribution.

**Modifications**:
- **Backend**: Nouvel endpoint `PUT /api/tontines/:tontineId/ordre-distribution`
- **Backend**: Vérifier que la personne n'a pas encore reçu (statut distribution != EFFECTUEE)
- **Frontend**: Écran de gestion de l'ordre avec drag & drop ou boutons haut/bas

### 3. Statistiques des cotisations pour l'admin
**Besoin**: L'admin voit les statistiques de cotisations de tous les membres, pas seulement les siennes.

**Modifications**:
- **Backend**: Modifier `getCotisationsByTontine` pour retourner toutes les cotisations si créateur
- **Frontend**: Afficher un tableau récapitulatif avec tous les membres

### 4. Attribution automatique en fin de journée (simulation)
**Besoin**: À la fin de la journée, si tous les membres ont payé, la distribution est automatiquement effectuée.

**Modifications**:
- **Backend**: Modifier la logique pour marquer la distribution comme EFFECTUEE
- **Backend**: Ajouter `dateEffective` lors de la distribution
- **Frontend**: Afficher clairement qui a reçu et quand

### 5. Indication visuelle des distributions reçues
**Besoin**: Dans l'ordre de distribution, indiquer clairement qui a déjà reçu sa distribution.

**Modifications**:
- **Frontend**: Badge "Reçu" ou icône de validation
- **Frontend**: Couleur différente pour les distributions effectuées

## Implémentation

### Étape 1: Ajout du champ opérateur
```sql
ALTER TABLE "Cotisation" ADD COLUMN "operateur" VARCHAR(50);
```

### Étape 2: Backend - Simulation avec opérateur
Modifier `simulerPaiement` pour accepter `operateur` dans le body.

### Étape 3: Backend - Modification ordre distribution
Créer endpoint pour modifier l'ordre avec vérifications.

### Étape 4: Backend - Statistiques admin
Modifier `getCotisationsByTontine` pour retourner toutes les cotisations si créateur.

### Étape 5: Backend - Attribution automatique
Modifier la logique de distribution pour marquer comme EFFECTUEE et ajouter dateEffective.

### Étape 6: Frontend - Sélecteur opérateur
Ajouter un composant de sélection d'opérateur avec les logos.

### Étape 7: Frontend - Gestion ordre distribution
Créer un écran pour modifier l'ordre (accessible uniquement au créateur).

### Étape 8: Frontend - Statistiques cotisations
Créer un tableau récapitulatif pour l'admin.

### Étape 9: Frontend - Affichage distributions
Améliorer l'affichage pour montrer qui a reçu.

## Priorités
1. ✅ Choix de l'opérateur (simple)
2. ✅ Statistiques admin (simple)
3. ✅ Attribution automatique (simple)
4. ✅ Indication distributions reçues (simple)
5. ⏳ Modification ordre distribution (complexe - drag & drop)
