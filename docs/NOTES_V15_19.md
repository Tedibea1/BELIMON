# BELLYMON V15.19 — Vol de puissance à 20 %
L'Envoûteuse vole désormais **20 % de la Force effective de sa cible**, au lieu d'un transfert fixe de 20 points plafonné à 20. Montant arrondi au point le plus proche. Exemples : 50 FOR → 10, 100 FOR → 20, 200 FOR → 40.
Le calcul ignore le vol temporaire déjà appliqué par cette même compétence afin que le renouvellement ne réduise pas artificiellement le montant.
Le transfert symétrique commence au tour suivant, dure 3 tours, ne se cumule pas, et reste bloqué par les esquives, l'intangibilité et Purification.
Les anciens effets déjà enregistrés conservent leur montant et leur échéance ; les nouveaux lancers utilisent le pourcentage.
Aucun changement de coefficient de dégâts (Force ×1,0), coût (5 énergie), statistiques ou autres sorts. Descriptions et affichages actualisés.
Un test dédié `tests/tests/v15_19_percent_steal.test.js` couvre différents niveaux de Force, la relance, l'IA, les bonus de collection, l'esquive, Purification et l'affichage.
