# Prompt pour Générer le Rapport Final (Version Expert)

Utilisez ce prompt pour obtenir un rapport exhaustif et professionnel. Il contient tous les détails techniques de l'implémentation finale.

---

### Prompt :

"Agis comme un ingénieur logiciel senior et rédige un rapport technique détaillé pour le projet **Tontine App**.

**1. Contexte et Objectifs :**
L'objectif est de moderniser la tontine traditionnelle par une plateforme automatisée. 
Points clés : Automatisation des calculs, sécurité des fonds, et transparence totale.

**2. Architecture Technique Détailée :**
- **Backend (Node.js/Express)** : Architecture MVC simplifiée. Utilisation de **PostgreSQL** avec des requêtes SQL brutes (Performance > Abstraction).
- **Frontend (React Native/Expo)** : Interface premium avec **Zustand** pour la gestion d'état (plus léger que Redux).
- **Communication Temps Réel** : **Socket.io** pour le chat intégré entre les membres d'une même tontine.

**3. Logique Métier Avancée (Détails Cruciaux) :**
- **Modèle One-Shot** : Explique que pour simplifier l'expérience, chaque tontine est désormais conçue pour un tour unique de distribution. Cela évite la confusion des cycles multiples.
- **Flux de Distribution** : 
  1. Création avec montant, intervalle et membres.
  2. Invitation par email (Mailersend).
  3. Signature électronique du contrat par tous les membres (Condition *sine qua non* pour démarrer).
  4. Paiement des cotisations : Une fois que **tous** les membres ont payé pour un tour, la distribution est automatiquement marquée comme `EFFECTUEE`.
  5. Notification instantanée du bénéficiaire.
- **Gestion de l'Ordre** : L'administrateur peut modifier l'ordre de passage des bénéficiaires avant le lancement.

**4. Sécurité et Validation :**
- Validation rigoureuse des schémas avec **Joi**.
- Gestion des erreurs centralisée via un middleware `errorHandler`.
- Authentification sécurisée par **JWT** (JSON Web Tokens).

**5. Défis Résolus :**
- Synchronisation des statuts entre les tables `Cotisation` et `Distribution`.
- Gestion des conflits de fusion (Git) et nettoyage de la terminologie (passage de 'Cycle' à 'Tour').
- Initialisation automatique de la base de données au lancement du serveur.

**6. Conclusion et Perspectives :**
- Succès de la simplification du modèle.
- Perspectives : Intégration réelle de passerelles de paiement (Orange Money, Moov), système de vérification d'identité (KYC).

**Livrables attendus :** Un document structuré, professionnel, alternant explications théoriques et détails d'implémentation."

---

### Recommandations pour l'étudiant :
- Insérez des schémas (UML ou flux) dans le rapport.
- Ajoutez des captures d'écran de : l'écran d'Admin (gestion de l'ordre), le Chat, et le Dashboard.
