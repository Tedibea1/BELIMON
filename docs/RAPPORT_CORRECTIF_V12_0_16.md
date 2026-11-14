# BELLYMON V12.0.16 — Siphon d'énergie à −3 EN/s

## Demande

Réduire le drain du **Siphon d'énergie de la Bagarreuse** de **−5 à −3 énergies par seconde active**, sans toucher aux autres règles.

## Changements effectués

- `js/combat.js` : drain effectif de **3 EN/seconde** lors de chaque seconde de combat active ; texte du sort et journal de combat mis à jour.
- `js/combat-ui.js` : description du malus actualisée à **−3 énergies/seconde** dans la fenêtre **Effets**.
- `index.html`, `README.txt` : numéro de version et historique mis à jour.
- Tests existants adaptés aux nouvelles valeurs.

La compétence reste active pendant **4 tours, tour d'incantation inclus**, et peut être relancée pour renouveler sa durée, **sans cumuler les débits**. L'énergie adverse ne passe jamais sous zéro. Le temps ne progresse pas pendant les pauses.

Les coûts d'actions sont inchangés : **Légère 2 EN ; Lourde 3 EN ; Spéciale 5 EN ; Défense 0 EN ; Capture 2 EN**.

## Tests réalisés

- **13 fichiers de tests JavaScript**, tous réussis, dont 115 assertions du test d'équilibrage et 60 assertions sur les effets temporisés.
- **3 scénarios Chromium**, tous réussis : combats à 390 px et 1 440 px, puis vérification d'une action dont le coût devient inaccessible à cause du drain pendant le choix de l'IA.
- Les deux tests Chromium ont observé **9 EN retirées en ~3,55 secondes**, correspondant à trois ticks de **3 EN** chacun.
- Aucune erreur JavaScript dans les scénarios Chromium testés.
- Visuels, sons, musiques, compétences différentes du Siphon et format de sauvegarde non modifiés.

## Remarque d'équilibrage

Pour vider **100 EN** sans aucune autre dépense, il faut **34 secondes de combat actif** à −3 EN/s (contre 20 secondes à −5 EN/s). Les dépenses d'énergie supplémentaires de l'ennemi peuvent réduire cette durée.

## Installation

Exporter au préalable les sauvegardes JSON depuis le jeu ; décompresser le ZIP complet, puis ouvrir `index.html`.
