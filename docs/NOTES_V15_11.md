# BELLYMON V15.11 — Journal PC et animations MISS

- Le Journal réapparaît dans la **colonne de droite sur PC** (largeur d'écran supérieure à 1120 px), avec résumé et deux événements récents.
- Il reste absent des interfaces compactes et mobiles. La disposition large retrouve ses trois colonnes.
- Les résultats de combats `miss` (échec de précision) et `dodged` (esquive, y compris intangibilité) font flotter **MISS** en bleu clair sur la carte **de la cible** de l'attaque.
- Les animations de dégâts rouges et soins verts sont conservées. Un MISS peut coexister avec des pertes de PV dues à des effets indirects, sans masquer les dégâts.
- Fonctionne en manuel et en AUTO, pour la joueuse et le PNJ, et pendant une riposte ennemie après une capture ratée.
- Aucun changement des règles de combat, compétences, probabilités, statistiques, sauvegardes ou capture.
- Régression : `node tests/tests/v15_11_journal_miss.test.js`.
