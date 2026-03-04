# Debug des Droits d'Administration

## Problème rapporté
L'utilisateur voit les options de créateur alors qu'il n'est pas le créateur de la tontine.

## Points à vérifier

### 1. Vérifier la structure des données
Ouvrez la console du navigateur et regardez les logs:
- `🔵 AdminTontineScreen - User connecté:` → Doit afficher l'ID de l'utilisateur connecté
- `🔵 loadData - Tontine:` → Doit afficher l'objet tontine avec `creatorId`
- `🔵 Rendu - État:` → Doit afficher `isCreator: true/false`, `currentUserId` et `creatorId`

### 2. Comparer les IDs
Les IDs doivent être EXACTEMENT identiques (même type, même format):
- Si `currentUserId` = "abc-123" et `creatorId` = "abc-123" → isCreator = true ✅
- Si `currentUserId` = "abc-123" et `creatorId` = "def-456" → isCreator = false ✅
- Si les types sont différents (string vs number), la comparaison échouera ❌

### 3. Vérifier dans la base de données
Exécutez cette requête SQL:
```sql
SELECT id, nom, "creatorId" FROM "Tontine" WHERE id = 'VOTRE_TONTINE_ID';
```

Puis vérifiez l'ID de l'utilisateur connecté:
```sql
SELECT id, email, prenom, nom FROM "User" WHERE email = 'VOTRE_EMAIL';
```

### 4. Vérifier le token JWT
Le token JWT contient l'ID de l'utilisateur. Vérifiez que c'est le bon:
1. Ouvrez les DevTools → Application → Local Storage
2. Cherchez la clé `auth-storage` ou similaire
3. Vérifiez que `user.id` correspond à votre utilisateur

## Solutions possibles

### Solution 1: Problème de cache
```bash
# Frontend
cd frontend
rm -rf node_modules .expo
npm install
npm start -- --clear
```

### Solution 2: Problème de session
1. Déconnectez-vous de l'application
2. Reconnectez-vous
3. Testez à nouveau

### Solution 3: Vérifier les logs console
Ajoutez ces logs temporaires dans `AdminTontineScreen.tsx`:
```typescript
console.log('TYPE currentUser.id:', typeof currentUser?.id, currentUser?.id);
console.log('TYPE tontine.creatorId:', typeof tontine?.creatorId, tontine?.creatorId);
console.log('COMPARAISON:', currentUser?.id === tontine?.creatorId);
console.log('COMPARAISON STRING:', String(currentUser?.id) === String(tontine?.creatorId));
```

## Test manuel
1. Créez une nouvelle tontine avec le compte A
2. Notez l'ID de la tontine et l'ID du créateur
3. Invitez le compte B
4. Connectez-vous avec le compte B
5. Acceptez l'invitation
6. Allez sur la page AdminTontine
7. Vérifiez les logs console
8. Le compte B ne doit PAS voir:
   - Le bouton "Démarrer la Tontine"
   - Le bouton "Inviter"
   - Les boutons pour retirer des membres

## Logs attendus pour un NON-créateur
```
🔵 AdminTontineScreen - User connecté: user-b-id-123
🔵 loadData - Tontine: { id: "tontine-xyz", creatorId: "user-a-id-456", ... }
🔵 Rendu - État: {
  isCreator: false,
  currentUserId: "user-b-id-123",
  creatorId: "user-a-id-456"
}
🔵 Condition bouton - statut: EN_ATTENTE isCreator: false
❌ Bouton NON affiché - statut: EN_ATTENTE isCreator: false
```

## Logs attendus pour un créateur
```
🔵 AdminTontineScreen - User connecté: user-a-id-456
🔵 loadData - Tontine: { id: "tontine-xyz", creatorId: "user-a-id-456", ... }
🔵 Rendu - État: {
  isCreator: true,
  currentUserId: "user-a-id-456",
  creatorId: "user-a-id-456"
}
🔵 Condition bouton - statut: EN_ATTENTE isCreator: true
✅ Bouton devrait être affiché
```
