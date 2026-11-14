# BELLYMON V15.5.1 — Correctif affichage des journaux et typographie

**Constat** : en affichage PC, le compte rendu détaillé et le journal latéral étaient simultanément visibles, sans contenir les mêmes informations ; la version mobile ne montrait pas les événements récents du panneau droit. Certaines commandes (notamment « Quitter la tour ») utilisaient des tailles de police très différentes.

**Correctifs** :

- `index.html` : ajout de l'historique des événements au bandeau mobile, et du compte rendu détaillé dans le journal droit.
- `js/game.js` : affichage synchronisé depuis les mêmes champs d'état : `tower.history` et dernier compte rendu. Évite de répéter un compte rendu du tour dans l'historique lorsqu'il est déjà visible intégralement.
- `css/v15_5_1.css` : un seul journal visible à la fois selon le point de rupture de 1120 px, et homogénéisation des polices des boutons du panneau Commandes. Pas de changement des zones du Guide.
- Historique en lecture seule, aucune modification de la structure des sauvegardes ou de la logique de combat.

**Tests validés** :

- 22 suites JavaScript existantes.
- 49 contrôles Guide Chromium sur PC et mobile.
- 209 assertions Chromium sur 8 résolutions (340, 390, 720, 1024, 1120, 1121, 1366, 1648 px), repos/combat et tours effectivement exécutés. Pas d'erreurs JS ni de débordements horizontaux.

**Utilisation** : décompresser le ZIP puis ouvrir `index.html` ; la V15.5.1 conserve la compatibilité des sauvegardes V15.5.
