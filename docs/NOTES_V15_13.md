# BELLYMON V15.13 — Ajustement des paliers de capture

Réglages décidés le 15 novembre 2026 pour une capture inspirée des jeux de collection de créatures.

| PV restants de la cible | Chance de capture par tentative |
|---|---:|
| > 75 % | 5 % |
| > 50 % à 75 % inclus | 15 % |
| > 30 % à 50 % inclus | 30 % |
| > 10 % à 30 % inclus | **55 %** (précédemment 75 %) |
| > 0 % à 10 % inclus | **85 %** (précédemment 90 %) |
| 0 % (KO) | Impossible |

- Les paliers supérieurs sont inchangés.
- Le calcul conserve l'arrondi supérieur du pourcentage de PV restants, comme avant.
- Seule la **chance par essai** est codée ; aucune colonne de cumul sur trois essais n'est ajoutée au jeu.
- L'affichage du bouton de capture emploie la même fonction `BellymonCapture.chance()` et se met donc à jour automatiquement.
- La limite de **3 tentatives par adversaire**, le coût de **2 points d'énergie** et la riposte sur échec sont inchangés.
- Régression ciblée : `node tests/tests/capture_rules.test.js`. Les autres règles et les sauvegardes sont inchangées.
