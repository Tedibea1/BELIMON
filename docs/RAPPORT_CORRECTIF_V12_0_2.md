# BELLYMON V12.0.2 — Correction des annonces d’événements

Date : 10 novembre 2026

## Demande
La transition COMBAT / COFFRE / PIÈGE donne l’impression qu’il faut toucher l’écran pour continuer, notamment sur téléphone ; elle est jugée trop longue.

## Constat
Dans V12.0.1, les annonces disparaissaient déjà automatiquement après 2 300 ms. Toutefois, l’interface affichait « TOUCHER POUR PASSER », une consigne trompeuse puisque le toucher était seulement facultatif.

## Modifications
- La fermeture automatique est réglée à **1 800 ms**.
- La mention « TOUCHER POUR PASSER » est supprimée.
- Le toucher/clic pour passer immédiatement reste disponible.
- Aucune modification des règles de combat, des sauvegardes, des animations d’impact (correctif V12.0.1 conservé), des ressources graphiques ou de la progression.

## Essais avec Chromium
Test Playwright sous `/usr/bin/chromium`, en versions desktop 1440 px et mobile émulée 390 px avec écran tactile, sans cliquer pour fermer les annonces.

| Événement | Desktop | Mobile |
|---|---:|---:|
| Combat | 1,866 s | 1,843 s |
| Coffre | 1,804 s | 1,802 s |
| Piège | 1,802 s | 1,849 s |

Pour le piège, la seconde annonce « PIÈGE » disparaît également automatiquement, puis la fenêtre de malus s’affiche. Le raccourci tactile facultatif a été vérifié sur mobile. **7/7 scénarios réussis, aucune erreur JavaScript.**

**Tests de régression :** les 8 fichiers `tests/*.test.js` passent sous Node.js. Le test ciblé est dans `tests/announcement_auto_close.py`.

**Limite :** les essais utilisent Chromium avec une page chargée en mémoire et un stockage simulé, pas un navigateur mobile physique ni le stockage réel sur l’appareil de l’utilisateur.
