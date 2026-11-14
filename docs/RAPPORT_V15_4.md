# BELLYMON V15.4 — Compétences spéciales

V15.4 — QUATRE COMPÉTENCES SPÉCIALES REVISITÉES
==================================================
- Maudite : Malédiction du sang devient une attaque Force ×1,0. Si elle touche,
  l'ennemie attaquante perd 10 % de SES PV maximum par attaque offensive tentée
  pendant les trois tours APRÈS le lancement (T+1, T+2, T+3). Elle n'agit
  donc pas au tour d'incantation. Esquive et critique ordinaires conservés.
- Envoûteuse : Vol de puissance devient une attaque Force ×1,0. Si elle touche,
  elle transfère jusqu'à 20 points réels de Force de la cible à la lanceuse
  durant les trois tours SUIVANTS (T+1 à T+3), sans cumul. Esquive et critique
  ordinaires conservés. Purification bloque le transfert, pas les dégâts.
- Némésis : Miroir magique renvoie toujours 40 % des dégâts réellement subis,
  mais pendant 5 tours, tour de lancement inclus (T à T+4).
- Exorciste : Purification retire les malus immédiatement et protège contre
  les nouveaux malus pendant 5 tours, tour de lancement inclus (T à T+4).
- Les deux protections immédiates prennent effet au tour du lancement,
  indépendamment de l'ordre des actions. En revanche, les deux nouvelles
  attaques offensives doivent TOUCHER pour appliquer leur malus.
- Même règles pour les combattantes joueuses et les PNJ. Coût des spéciales
  inchangé (20 EN). Bonus de collection, sorts non concernés, attaques,
  statistiques, tarif ascenseur de V15.3 et sauvegardes inchangés.

## Tests
Voir `tests/v15_4_skills.test.js` et les tests de non-régression.

## Validation exécutée

- 21 suites de tests JavaScript réussies, y compris 208 vérifications nouvelles propres à V15.4.
- 49 vérifications du jeu complet dans Chromium sur PC/mobile, reprises d’anciennes sauvegardes incluses.
- 84 vérifications navigateur supplémentaires de non-régression des raccourcis payants, sur largeurs 320, 390 et 1440 px.
- Vérification des 180 sprites PNG et de la structure séparée HTML/CSS/JS.
- Compatibilité des anciens effets enregistrés : leurs dates originales sont conservées lors du chargement.

Note : les anciennes campagnes de tests portant sur la Maudite ou les durées des effets ont été actualisées pour les règles approuvées en V15.4 ; les règles des autres versions restent documentées dans le README.
