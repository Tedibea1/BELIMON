# BELLYMON V15.15 — Textes de combat flottants : 1,8 seconde

Demande du 15 novembre 2026 : prolonger les indications de dégâts **rouges** (`−30`), soins **verts** (`+30`) et esquives **bleues** (`MISS`).

- `.hit-pop` : animation CSS prolongée de **0,8 à 1,8 s**, avec une phase lisible à pleine opacité jusqu'à 70 %.
- `prefers-reduced-motion` : fondu de **1,8 s** également, sans déplacement.
- JavaScript : chaque texte est retiré **1800 ms après son apparition**, indépendamment des autres textes.
- AUTO : un nouveau tour ne retire plus prématurément les dégâts/soins/MISS du tour précédent. Plusieurs textes peuvent donc coexister brièvement.
- Animations d'impact, flash et secousse des cartes : **0,42 s**, inchangées.
- Minuteur de nettoyage des classes d'impact : **850 ms**, inchangé.
- Aucun changement du moteur de combat, statistiques, captures, tours, récompenses, sauvegardes ou réglages AUTO.
- Régression : `node tests/tests/v15_15_float_duration.test.js`. L'ancien test V15.11 est adapté à la coexistence des textes.
