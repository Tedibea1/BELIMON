# BELLYMON V12.0.17 — Renommage de la compétence de la Bagarreuse

## Changement
- **Siphon d’énergie** est renommé **Absorption** dans le bouton de combat, sa description, les comptes rendus d'action, l'étiquette d'effet actif, le détail des effets et le message d'énergie insuffisante.
- Aucun changement de puissance ni de mécanique : l'attaque conserve `Force ×0,8`, coûte 5 EN, retire 3 EN par seconde active pendant 4 tours, est renouvelable et non cumulable.
- Les autres compétences et les coûts des attaques restent inchangés.
- **Sauvegardes compatibles :** la propriété interne `siphon` est volontairement préservée. Il s'agit d'un identifiant technique, non affiché au joueur.

## Contrôles
- 14 suites de tests Node.js réussies, dont un nouveau test de renommage vérifiant la spéciale et ses effets.
- Chromium 390 px et 1440 px : bouton « Absorption », description, résumé de tour, effet actif et fenêtre de détails vérifiés dans un combat réel.
- Aucune erreur JavaScript observée pendant ces deux tests Chromium.

## Fichiers concernés
`js/combat.js`, `js/combat-ui.js`, `js/game.js`, `index.html`, `README.txt` et nouveau test `tests/v12_0_17_rename.test.js` + `tests/v12_0_17_rename_browser.py`.

Les 84 sprites et les ressources musicales sont inchangés. Sauvegarder/exporter ses parties JSON reste conseillé avant tout changement de dossier du jeu.
