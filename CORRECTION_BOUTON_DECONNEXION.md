# Correction du Bouton de Déconnexion

## Problème
Le bouton "Se déconnecter" ne fonctionnait pas.

## Cause
`Alert.alert()` de React Native ne fonctionne pas sur le web.

## Solution appliquée

### 1. Remplacement de Alert.alert par window.confirm
**Fichier**: `frontend/src/screens/Profile/ProfileScreen.tsx`

**Avant**:
```typescript
const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui, me déconnecter', onPress: logout },
    ]);
};
```

**Après**:
```typescript
const handleLogout = async () => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (confirmed) {
        console.log('🔴 Déconnexion en cours...');
        await logout();
        console.log('✅ Déconnexion terminée');
    }
};
```

### 2. Ajout de logs de débogage
**Fichier**: `frontend/src/store/useAuthStore.ts`

Ajout de logs dans la fonction `logout()` pour suivre le processus:
```typescript
logout: async () => {
    console.log('🔴 useAuthStore.logout() appelé');
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
    console.log('🔴 AsyncStorage nettoyé');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
    console.log('🔴 State mis à jour: isAuthenticated = false');
},
```

## Fonctionnement

1. L'utilisateur clique sur "Se déconnecter"
2. Une boîte de dialogue de confirmation s'affiche (`window.confirm`)
3. Si l'utilisateur confirme:
   - La fonction `logout()` du store est appelée
   - AsyncStorage est nettoyé (token, refreshToken, user)
   - Le state est mis à jour avec `isAuthenticated = false`
4. Le `RootNavigator` détecte que `isAuthenticated = false`
5. L'utilisateur est automatiquement redirigé vers `AuthNavigator` (écran de connexion)

## Test

1. Aller sur l'écran Profil
2. Cliquer sur "Se déconnecter"
3. Confirmer dans la boîte de dialogue
4. Vérifier dans la console:
   ```
   🔴 Déconnexion en cours...
   🔴 useAuthStore.logout() appelé
   🔴 AsyncStorage nettoyé
   🔴 State mis à jour: isAuthenticated = false
   ✅ Déconnexion terminée
   ```
5. L'utilisateur doit être redirigé vers l'écran de connexion

## Logs attendus

Si tout fonctionne correctement, vous devriez voir dans la console:
```
🔴 Déconnexion en cours...
🔴 useAuthStore.logout() appelé
🔴 AsyncStorage nettoyé
🔴 State mis à jour: isAuthenticated = false
✅ Déconnexion terminée
```

## Nettoyage (optionnel)

Une fois que tout fonctionne, vous pouvez supprimer les `console.log()` pour nettoyer le code.

## Fichiers modifiés

1. `frontend/src/screens/Profile/ProfileScreen.tsx`
   - Remplacement de `Alert.alert` par `window.confirm`
   - Ajout de logs de débogage

2. `frontend/src/store/useAuthStore.ts`
   - Ajout de logs de débogage dans la fonction `logout()`

## Autres endroits avec Alert.alert

Si vous trouvez d'autres endroits dans l'application où `Alert.alert` est utilisé et ne fonctionne pas sur web, remplacez-les par:
- `window.confirm()` pour les confirmations
- `window.alert()` pour les messages simples

## Recherche globale

Pour trouver tous les `Alert.alert` dans le projet:
```bash
grep -r "Alert.alert" frontend/src/
```

Ou dans PowerShell:
```powershell
Get-ChildItem -Path frontend/src -Recurse -Filter *.tsx | Select-String "Alert.alert"
```
