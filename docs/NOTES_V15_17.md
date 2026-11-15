# BELLYMON V15.17 — Hôpital à durée variable

## Règle approuvée
La durée d'hospitalisation dépend désormais uniquement du pourcentage de PV **manquants au moment de l'admission** :

`durée = 18 000 ms × (PV max − PV actuels) / PV max` (arrondie à la milliseconde).

- KO, 100 % manquants : **18 s**
- 75 % de PV manquants (25 % restants) : **13,5 s**
- 50 % manquants : **9 s**
- 25 % manquants (75 % restants) : **4,5 s**
- Santé maximale : pas d'admission nécessaire

Le moteur préserve les trois lits, la guérison complète à l'échéance, la récupération d'énergie à 100 et l'accès à l'hôpital uniquement à l'étage 1. Chaque lit conserve `readyAt` dans la sauvegarde : les soins déjà en cours avant V15.17 ne sont pas recalculés. Les blessures ne guérissent pas automatiquement hors hôpital.

## Présentation
- Durée prévisionnelle affichée pour les patients en attente.
- Message d'admission utilisant le temps effectivement calculé.
- Description de l'hôpital et version visibles corrigées (y compris l'en-tête resté en V15.15.1).

## Contrôles
Le test `tests/tests/v15_17_hospital_duration.test.js` couvre les exemples, les PV partiellement perdus, la limite des trois lits, les échéances indépendantes, la persistance après rechargement, les conditions d'accès et les textes affichés.

Aucune autre règle du combat, des personnages ou de l'économie n'est changée.
