# Prompt pour Générer le Rapport Final

Utilisez le prompt suivant pour demander à une IA de générer votre document final de projet. Remplacez les parties entre crochets par vos informations spécifiques si nécessaire.

---

### Prompt :

"Agis comme un expert en ingénierie logicielle et rédige un rapport de projet structuré pour une application nommée **Tontine App**. L'application est un système de gestion de tontines automatisé et sécurisé.

**Structure du document à suivre :**

1. **Introduction** : Présente le contexte (finance solidaire, tontines traditionnelles) et les objectifs (simplification, transparence, accessibilité).
2. **Analyse des besoins** : Décris les acteurs (Créateur, Membre, Administrateur) et les cas d'utilisation principaux (Création de tontine, Invitation, Cotisation, Distribution).
3. **Conception** : 
   - Explique la structure de données (User, Tontine, Participation, Cotisation, Distribution, Message/Chat).
   - Détaille la logique de distribution (un seul tour par tontine pour simplifier le processus).
4. **Développement** :
   - Présente le stack technique : **Backend** (Node.js, Express, PostgreSQL), **Frontend** (React Native, Expo, Zustand).
   - Souligne l'utilisation du SQL brut (Queries) pour la performance et de Joi pour la validation.
5. **Démonstration** : Décris le flux utilisateur : Inscription -> Création de Tontine -> Invitation -> Paiement des cotisations -> Notification de réception des fonds.
6. **Conclusion** : Résume les défis relevés (gestion des transactions, synchronisation frontend/backend) et les améliorations futures (intégration réelle Ligdicash, systèmes de notation).

**Ton :** Professionnel, technique mais accessible.
**Langue :** Français."

---

### Instructions additionnelles :
- Assurez-vous d'avoir des captures d'écran de l'application (Dashboard, Détails Tontine, Paiement réussi) pour agrémenter la section **Démonstration**.
- Pour la section **Étapes de développement**, vous pouvez mentionner que le code suit les principes de séparation des préoccupations (Controllers vs Queries).
