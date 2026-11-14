# BELLYMON V14.4 — Ascenseur à la tour

Base V14.3, sans changement sur les potions, combats ou personnages.

- Salle de repos de l’étage 1 : **Avancer**, **Reprendre à l’étage n−5**, **Reprendre à l’étage n** (n = meilleur étage atteint).
- Le bouton Quitter la tour disparaît en salle de repos à l’étage 1 ; il reste disponible ailleurs.
- Les raccourcis sont indisponibles quand ils ne sont pas débloqués ou si le solde de steaks est insuffisant.
- Coûts : `P(n) = Math.round(300 * 1.018 ** (n - 30))` ; `P(n−5) / 2`, avec arrondi au nombre pair en cas de demi-unité (pour reproduire le tableau des prix validé).
- Le joueur confirme le paiement et arrive **au repos** de l’étage choisi. Il doit encore cliquer Avancer pour rencontrer le prochain événement. Aucune récompense, soin ou énergie gratuite lors de la reprise.
- Les steaks sont débitées et la tour déplacée dans la même transaction de sauvegarde ; les gigots et potions restent inchangés.
- Pour un record de 226 : étage 221 à 4 528 steaks, étage 226 à 9 901 steaks.
- Les sauvegardes historiques et le format d’export JSON sont préservés.
- Tests : `node tests/v14_4_shortcuts.test.js`, `python tests/v14_4_shortcuts_browser.py`.
