# Guide de Contribution

Merci de votre intérêt pour contribuer au projet Tontine Backend!

## Code de conduite

- Soyez respectueux et professionnel
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec:
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Version de Node.js et PostgreSQL
   - Logs d'erreur si disponibles

### Proposer une fonctionnalité

1. Créez une issue décrivant:
   - Le problème que ça résout
   - La solution proposée
   - Les alternatives considérées

### Soumettre du code

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Push vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## Standards de code

### Style JavaScript

- Utiliser CommonJS (`require`/`module.exports`)
- Indentation: 2 espaces
- Point-virgules: optionnels mais cohérents
- Noms de variables: camelCase
- Noms de constantes: UPPER_SNAKE_CASE
- Commentaires en français pour la logique métier

### Structure des fichiers

```javascript
// 1. Imports
const express = require('express');
const { helper } = require('../utils/helpers');

// 2. Constantes
const MAX_RETRIES = 3;

// 3. Fonctions
const maFonction = async (param) => {
  // Implementation
};

// 4. Exports
module.exports = { maFonction };
```

### Gestion des erreurs

```javascript
// Utiliser asyncHandler pour les routes
const maRoute = asyncHandler(async (req, res) => {
  // Si erreur, throw ApiError
  if (!data) throw new ApiError(404, 'Ressource introuvable');
  res.json({ success: true, data });
});
```

### Requêtes SQL

```javascript
// Toujours utiliser des requêtes paramétrées
const { rows } = await db.query(
  `SELECT * FROM "Table" WHERE id = $1`,
  [id]
);
```

### Validation

```javascript
// Définir les schemas Joi dans validation.middleware.js
const schema = Joi.object({
  nom: Joi.string().required(),
  age: Joi.number().integer().min(0)
});
```

## Tests

### Avant de soumettre

1. Tester manuellement avec Postman
2. Vérifier qu'aucune régression n'est introduite
3. S'assurer que le code compile sans erreur
4. Vérifier les logs pour les warnings

### Tests automatisés (à venir)

```bash
npm test              # Tous les tests
npm run test:unit     # Tests unitaires
npm run test:integration  # Tests d'intégration
```

## Documentation

### Commenter le code

```javascript
// Fonction: calculerMontantNet
// Params: montantBrut (number), pourcentageFrais (number)
// Return: {montantFrais, montantNet}
const calculerMontantNet = (montantBrut, pourcentageFrais) => {
  // ...
};
```

### Mettre à jour la documentation

- Si vous ajoutez une route, mettez à jour `API.md`
- Si vous changez l'architecture, mettez à jour `ARCHITECTURE.md`
- Ajoutez une entrée dans `CHANGELOG.md`

## Commits

### Format des messages

```
type(scope): description courte

Description détaillée si nécessaire

Fixes #123
```

### Types
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, point-virgules, etc.
- `refactor`: Refactoring sans changement de fonctionnalité
- `test`: Ajout ou modification de tests
- `chore`: Maintenance, dépendances, etc.

### Exemples
```
feat(auth): ajout de la vérification email par OTP
fix(cotisations): correction du calcul des montants
docs(api): mise à jour de la documentation des endpoints
```

## Questions

Si vous avez des questions, n'hésitez pas à:
- Ouvrir une issue
- Contacter les mainteneurs
- Consulter la documentation existante

Merci de contribuer! 🎉
