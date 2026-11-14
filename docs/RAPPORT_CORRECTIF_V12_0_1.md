# BELLYMON V12.0.1 — Correctif visuel des impacts

**Signalement :** après qu’une carte a subi des dégâts, le voile rouge disparaissait après la secousse mais revenait sans nouvelle attaque.

**Cause reproduite dans un vrai combat Chromium V12 :** l’animation CSS `flash-hit` dure 0,42 s et s’achève à une opacité de 0 ; mais sa classe `.impact-hit` n’est retirée qu’après 0,85 s. En absence de `animation-fill-mode: forwards`, le pseudo-élément `::after` revient à son opacité normale de 1 entre ces deux instants.

**Correction :** dans `css/v12.css`, ajout de `opacity:0` au pseudo-élément et de `forwards` à l’animation pour les impacts rouges **et** les soins verts. Pas de changement de logique JavaScript ni de sauvegarde.

## Reproduction avant/après — vrai combat Chromium

| Après le coup | V12, opacité du rouge | V12.0.1, opacité du rouge |
|---|---:|---:|
| Début | 1 | 1 |
| ~320 ms | 0,04 | 0,07 |
| ~480 ms | **1 : rouge réapparu** | **0 : rouge disparu** |
| ~560 ms | **1** | **0** |
| ~720 ms | **1** | **0** |
| ~800 ms | pseudo-élément retiré | pseudo-élément retiré |

Les chiffres sont issus de `getComputedStyle(card, '::after').opacity` lors de vrais tours de combat, en Chromium headless.

## Tests après correction

- Test ciblé `python tests/impact_regression.py` : réussite sur un duel, contrôle de l’opacité entre 480 et 640 ms, retrait des classes et zéro erreur JS.
- Huit suites Node.js (AUTO, bonus, capture, combats, évolutions, récompenses, pièges, règles V12) : réussies.
- Parcours navigateur V12 : **91 vérifications**, six largeurs d’écran (320–1440 px), zéro erreur JS.

**Compatibilité :** toutes les parties V12, V11 et précédentes restent compatibles. Seul le rendu visuel est corrigé. Tests navigateur avec stockage simulé : non assimilables à une vérification du navigateur personnel de l’utilisateur.
