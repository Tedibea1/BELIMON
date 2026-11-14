# Tour des Waifus — Rapport de tests V3.1

**Objet :** compétences spéciales des six classes, chronomètre de 15 secondes, IA, durée des effets, sauvegardes et non-régression des versions antérieures.

## Résultats

| Suite | Résultat |
|---|---:|
| Tests unitaires Node.js du moteur de combat | **44 réussis** |
| Tests navigateur Chromium Playwright — écran PC 1440 px, mobile 390 px et 320 px, six classes et siphon temps réel | **109 réussis** |
| Tests de non-régression — collection, fiche, affichage en grand, bonus, attaque classique, victoire, étage, coffre, abandon et sauvegarde | **21 réussis** |
| **Total** | **174 réussis** |

Aucune exception JavaScript relevée dans ces scénarios.

## Couverture pertinente

- Les six compétences sont activées et coûtent 5 EN.
- Épéiste : réduction permanente de 15 % de la Constitution adverse, sans cumul.
- Bagarreuse : marqueur de siphon sur trois tours, renouvellement sans cumul, perte d'EN observée après une seconde d'horloge active.
- Archère : puissance ×1,7, critique ordinaire disponible.
- Occultiste : étapes −10 %, −20 %, −30 %, −40 %, −50 %, expiration après le cinquième tour, indisponibilité du bouton pendant le délai et réutilisation au sixième tour.
- Prêtresse : soin plafonné à 40 % des PV maximum, IA favorisant le soin quand les PV sont bas.
- Griffeuse : coup critique automatique ×2, sujet à esquive/défense.
- Défense, énergie, dégâts critiques, règle du KO avant riposte inchangées.
- Un tour dépassant 15 s entraîne une action inactive du joueur et une action adverse ; l'EN du joueur reste inchangée.
- Effets/cooldown/énergie et combat en cours conservés après rechargement simulé.
- Aucun débordement horizontal à 1440, 390 ou 320 px.
- Navigation Collection, fiche détaillée, vue agrandie, Bonus et abandon conservés.

## Limite d'environnement

La navigation locale Chromium via `http://127.0.0.1` est bloquée par l'environnement de test (`ERR_BLOCKED_BY_ADMINISTRATOR`). Les suites de navigation ont utilisé un document chargé en mémoire et une simulation de `localStorage` pour vérifier le cycle création → combat → sauvegarde → rechargement. **La persistance réelle IndexedDB dans le navigateur de l'utilisateur reste à vérifier lors de l'essai manuel.** Les vérifications n'ont pas remplacé ce contrôle par une affirmation de succès.

## Fichiers

- `js/combat.js` : moteur pur V3.1, testable avec Node.js.
- `js/game.js` : interfaces, sauvegardes, rythme du combat et siphon temps réel.
- `css/v3_1.css` : compteur et bouton spécial, en conservant la grille 2 × 3.
- `tests/combat_rules.test.js` : tests unitaires.
