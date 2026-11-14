# BELLYMON — Rapport V12.0.10

**Objet :** rééquilibrage de Siphon d’énergie (Bagarreuse) et de Malédiction abyssale (Occultiste).

## Règles modifiées

### Bagarreuse — Siphon d’énergie
- La spéciale conserve sa puissance initiale (Force ×0,8), son coût de 5 énergies et sa durée de **4 tours**, lancement compris.
- La cible perd désormais **2 énergies par seconde de combat active**, au lieu de 1.
- Le total ne descend jamais sous 0 énergie. Une relance renouvelle les 4 tours ; il n'y a **pas de cumul** de deux siphons.

### Occultiste — Malédiction abyssale
- La spéciale conserve sa puissance initiale (Force ×0,8), son coût de 5 énergies et sa durée de **5 tours**, lancement compris.
- Le malus affecte **Force, Rapidité et Constitution simultanément**, de **2 points de pourcentage supplémentaires par seconde de combat active**, jusqu'à un **plafond de −50 %**.
- Il commence à 0 % lors de la nouvelle application ; la première réduction de −2 % arrive après la première seconde active.
- **Plus de cooldown :** il est possible de relancer la compétence dès que l'Occultiste dispose d'au moins 5 énergies.
- Si la cible est déjà maudite, la relance remet uniquement la durée à **5 tours**, **conserve l'affaiblissement accumulé** et **ne réinitialise pas le rythme de progression**. Les effets ne s'additionnent pas au-delà du plafond.
- À l'expiration de la malédiction, les statistiques reviennent à leur valeur normale, hors autres effets encore actifs. Une nouvelle application recommence à 0 %.
- Une attaque spéciale esquivée ne pose ni ne renouvelle la malédiction, comme auparavant.
- Le mode AUTO peut relancer la malédiction en fin de durée au lieu de la laisser expirer systématiquement.

## Horloge des effets
- Seules les **secondes de combat visibles** comptent (comportement identique au Siphon antérieur et au chrono de tour) : les fenêtres modales, l'onglet caché, l'écran de menu et la fermeture du navigateur mettent l'horloge des effets en pause.
- Le pourcentage atteint et l'énergie déjà perdue sont enregistrés dans les données de la partie. La réouverture reprend la progression sans rattrapage des secondes hors jeu.
- Une malédiction datant d'une sauvegarde V12.0.9 utilisant l'ancien format `startTurn` est convertie lors de sa reprise, en conservant approximativement le niveau de malus correspondant au tour en cours.
- **Remarque d'équilibrage :** 25 secondes de combat actif sont nécessaires pour passer de 0 à −50 %. En mode AUTO, où les tours s'enchaînent vite, une malédiction peut expirer avant d'atteindre ce maximum si elle n'est pas renouvelée.

## Vérifications
- **12 suites JavaScript exécutées sans échec**, notamment celles sur combats, capture, blessures, pièges, bonus, évolutions, AUTO, effets de siphon, Griffes fatales et le bandeau de combat.
- **60 assertions ciblées** sur les nouveaux effets chronométrés : progression à −2 %/s, cap à −50 %, pénalités sur les trois statistiques, renouvellements, pas de cooldown, deux effets simultanés, migration d'une ancienne malédiction, arrêt à 0 énergie et compatibilité AUTO.
- **Quatre combats Chromium** sur ordinateur et mobile (390 et 1 440 px) : Bagarreuse et Occultiste, avec une reprise de malédiction provenant d'une ancienne sauvegarde, **aucune erreur JavaScript**.
- **Test Chromium supplémentaire de pause/reprise :** le malus ne progresse pas pendant la consultation de la fenêtre « Effets » ni pendant la fermeture du jeu ; la seconde suivante après reprise est correctement comptée, **aucune erreur JavaScript**.
- Les **84 illustrations PNG**, les deux musiques MP3, l'ensemble des mécaniques de combat, la limite de trois waifus engagées et les sauvegardes multi-parties restent présents.

## Fichiers modifiés
`js/combat.js`, `js/game.js`, `js/combat-ui.js`, `js/auto.js`, `index.html`, `README.txt`, tests de règles correspondants et nouveaux scénarios de tests.

**Important :** exporter ses sauvegardes JSON depuis l'ancienne version avant remplacement du dossier du jeu.
