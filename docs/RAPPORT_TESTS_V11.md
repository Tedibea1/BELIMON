# BELLYMON V11 — Rapport de tests

**Date :** 10 novembre 2026
**Base :** BELLYMON V10. Gameplay et valeurs de combats inchangés.

## Améliorations livrées

- Copie de secours localStorage des sauvegardes IndexedDB, lorsque disponible.
- Mode local de secours en cas d'indisponibilité d'IndexedDB.
- Détection et migration d'anciennes sauvegardes uniquement présentes dans localStorage.
- Révisions incrémentales et vérification des dates de modification en transaction, y compris si une ancienne version du jeu a écrit la partie.
- Suppression propagée à la copie locale, avec registre d'identifiants supprimés.
- Export JSON de **toutes les parties**, import d'archives groupées et d'anciens JSON individuels.
- Validation complète de l'archive avant importation et tentative d'annulation des imports partiels si une écriture échoue.
- Indicateur discret du type de stockage et avertissement lors d'un conflit.
- Correction d'un risque de collision dans le générateur d'ID de secours si `Math.random` est figé.

## Résultats des tests

| Groupe | Vérifications réussies |
|---|---:|
| AUTO V10 — décisions selon classe, énergie, PV | 23 049 |
| Bonus V8 — niveaux, morphologies, nouveaux personnages | 949 |
| Pièges V9 — durée, cumul, impact | 894 |
| Évolutions V7 — nourriture, rangs E–S, morphologies | 500 |
| Captures V6 — règles et probabilités | 33 |
| Combats V3.1 — compétences et dégâts | 44 |
| Récompenses V5 — coffres et combats | 21 |
| **Sous-total règles (Node.js)** | **25 490** |
| Navigateur V11 — reprise des états et import/export, stockage simulé | 44 |
| Navigateur non-régression V10 — AUTO / MAX / interfaces | 52 |
| Navigateur non-régression V9 — pièges / sauvegardes / anciens JSON | 83 |
| **Total des vérifications** | **25 669** |

Les tests combinatoires comptent des milliers d'assertions répétées avec des paramètres
variés : **25 669 vérifications ne signifie pas 25 669 scénarios indépendants**.

## Cas testés en navigateur

- Création de partie et augmentation de révision à chaque sauvegarde.
- Simulation d'une écriture en IndexedDB et dans sa copie locale.
- Fermeture/réouverture en plein combat : tour, PV adverses et état de combat conservés.
- Chronomètre réarmé sans laisser le combat avancer pendant la fermeture.
- Export groupé contenant plusieurs parties, dont une en plein combat.
- Import de l'archive sans écrasement ; nouveaux identifiants de sauvegarde.
- Suppression et absence de résurrection après rechargement.
- Rejet d'une archive dont une partie est invalide, sans création partielle.
- Simulation d'une modification externe : écriture conflictuelle refusée, version distante intacte.
- Repli vers le stockage local lorsque IndexedDB est indisponible.
- Migration simulée d'une sauvegarde V7 stockée exclusivement dans le mode local historique.
- Réouverture d'un coffre avec récompense non confirmée : fenêtre retrouvée, **aucun butin doublé**.
- Rendus à 320, 360, 430, 768 et 1 440 px, sans débordement horizontal détecté.
- Tests de non-régression des mécaniques précédentes (AUTO, MAX, pièges, bonus, capture et évolutions).
- **Aucune erreur JavaScript de page** détectée dans les parcours réalisés.

## Méthode et limites

- Les scripts de règles ont été exécutés avec Node.js.
- Les parcours graphiques ont été exécutés dans Chromium headless via Playwright.
- La navigation vers `file://` et les serveurs locaux était bloquée par l'environnement
  de tests (`ERR_BLOCKED_BY_ADMINISTRATOR`). Les tests de navigateur ont donc utilisé
  la page assemblée en mémoire et **des simulateurs de localStorage et IndexedDB**.
- Les scénarios de transaction et de conflit ont été exercés, mais **il n'a pas été
  possible de certifier la persistance réelle d'IndexedDB dans Brave/Chrome de l'utilisateur**.
- Images allégées uniquement pour les tests graphiques ; les 84 PNG originaux sont
  conservés dans le jeu livré.
- Les sauvegardes d'un navigateur ne remplacent pas un export JSON extérieur.
- Les combats où les deux parties ont épuisé leur énergie peuvent rester bloqués.
  Ce comportement V10 n'a pas été modifié en V11 ; équilibrage prévu en V12.

## Compatibilité

- Les identifiants de stockage historiques `tour_des_waifus_sauvegardes_v1`
  et `tour_des_waifus_v1_slot_` sont conservés volontairement.
- Format de sauvegarde individuel `tour-des-waifus-v1` conservé.
- `saveRevision` reste optionnel à l'import et sur les anciennes sauvegardes.
- Nouveau format d'archive groupée `bellymon-v11-archive` version 1.
- Les parties de FEASTBORN et Chronicles ne sont pas modifiées.
