# BELLYMON V15.15.1 — Correction du bouton Attaque légère

Signalement du 15 novembre 2026, capture d'écran du jeu sur mobile : le bouton **⚔️ Légère** affichait par erreur `2 ⚡ · 3/3`, alors que `3/3` est réservé aux tentatives de capture.

- **Légère :** affiche désormais uniquement `2 ⚡`.
- **Capture :** conserve son coût de `2 ⚡`, ses `3/3` tentatives initiales et son taux de capture calculé dynamiquement.
- Toutes les autres commandes, les mécaniques de combat, les probabilités, les sauvegardes et les animations V15.15 restent inchangées.
- Test de régression : `node tests/tests/v15_15_1_action_labels.test.js`.
