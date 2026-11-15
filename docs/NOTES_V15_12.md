# BELLYMON V15.12 — Nouveaux seuils de capture

**Décision du 15 novembre 2026** : faciliter la capture des waifus blessées pour favoriser la collection.

| PV de l'ennemie (en pourcentage de ses PV maximum) | Chance par tentative |
|---|---:|
| **Plus de 75 %** | 5 % |
| **Plus de 50 % à 75 % inclus** | 15 % |
| **Plus de 30 % à 50 % inclus** | 30 % |
| **Plus de 10 % à 30 % inclus** | **75 %** |
| **Plus de 0 % à 10 % inclus** | **90 %** |
| **0 PV (KO)** | 0 % — capture impossible |

- Le palier intermédiaire historique à 50 % de capture pour 11–25 % de PV **disparaît** et est remplacé par le nouveau palier à 75 % jusqu'à 30 % de PV.
- L'affichage du taux dans le bouton « Capture » est déjà calculé dynamiquement via `BellymonCapture.chance()` : il suit automatiquement les nouveaux seuils.
- La chance est déterminée en arrondissant **vers le haut** le pourcentage de PV de l'ennemie, comme auparavant.
- **Inchangé** : 2 EN par tentative, 3 tentatives maximum contre la même ennemie, riposte sur échec, aucun butin en cas de capture réussie, sauvegardes existantes et autres règles de combat.
- Test : `node tests/tests/capture_rules.test.js`, avec vérifications aux nouveaux seuils et aux limites intermédiaires.
