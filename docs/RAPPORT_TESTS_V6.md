# BELLYMON — V6 : rapport de tests

Date : 10 novembre 2026.

## Implémentation

- Capture en combat : coût de 2 EN, taux de 5/15/30/50/75 % selon les PV adverses.
- Tirage de capture manuel, retour de l'IA en cas d'échec, fin immédiate en cas de réussite.
- Aucun gigot ni bonus de coffre attribué sur capture réussie.
- Création d'une waifu persistante avec identifiant unique, même classe/rang/morphologie et statistiques que l'ennemie ; PV/EN restaurés à l'entrée en collection.
- Possibilité de capturer plusieurs exemplaires de la même classe ; numérotation visible dans la collection.
- Fenêtre de sélection avant combat et conservation de l'ancien relais après KO.
- Pop-up de capture avec illustration ; événement et pop-up restaurés sans duplication après rechargement.
- Validation des sauvegardes anciennes et nouvelles ; seuil d'import JSON relevé à 40 Mo.

## Résultats vérifiés

| Série | Vérifications | Résultat |
|---|---:|---|
| `node tests/capture_rules.test.js` | 33 | OK |
| `node tests/rewards.test.js` | 21 | OK |
| `node tests/combat_rules.test.js` | 44 | OK |
| Playwright Chromium V6 (`test_v6.py`) | 75 | OK |
| Playwright régression des butins V5 | 68 | OK |
| Playwright régression combats/KO V4 | 62 | OK |
| **Total** | **303** | **OK** |

### Parcours testés

- Capture au rang E, ajout d'un doublon avec identité distincte ; aucune nourriture obtenue.
- Capture à PV faibles, sans perdre la classe ni la morphologie : Occultiste obèse de rang C.
- Échec de capture avec dépense d'énergie, action de l'IA et conservation du combat.
- Fin de capture, confirmation de la pop-up, rechargement avant/après confirmation, aucune création en double.
- Sélection manuelle dans la collection et via la nouvelle fenêtre de précombat.
- Illustration agrandie, bonus de compte, victoires et coffres existants.
- Relais après KO, maintien des PV/EN/malus adverses, convalescence de 18 secondes, défaite totale.
- Navigation sans débordement horizontal à 320, 375, 390, 430, 768 et 1440 px.
- Aucune erreur JavaScript détectée par les navigateurs de test.
- Syntaxe JavaScript et ressources PNG contrôlées.

## Limites

Les tests Playwright reconstituent le DOM/CSS/JS dans Chromium en mémoire, avec
stockage local simulé, car la navigation directe vers des fichiers `file://`
n'est pas autorisée dans l'environnement de test. La persistance réelle dans
le navigateur de l'utilisateur doit donc être confirmée pendant son essai.
Les tests vérifient les parcours couverts, pas l'absence absolue de bugs.

## Version suivante

V7 : nourrissage et évolution de rang E à S avec spécialisation morphologique.
