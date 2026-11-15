# BELLYMON V15.16 — échange validé des compétences de l’Épéiste et de l’Archère

## Changement de gameplay
- **Épéiste — Frappe dévastatrice** : Force ×2,0, critique ordinaire possible ; ne pose plus le malus de Constitution.
- **Archère arcanique — Flèche perforante** : Force ×1,7, puis −15 % de Constitution adverse jusqu’à la fin du combat si l’attaque touche ; le malus est bloqué par Purification.
- Les deux multiplicateurs d’origine sont **échangés**, sans créer de nouvelles valeurs. Les attaques ordinaires, les statistiques de base, les PV, le prix des sorts (5 EN), les critiques et les autres classes sont inchangés.
- Le champ interne historique `swordCons` est conservé pour la compatibilité des sauvegardes déjà en cours ; l’affichage de l’effet indique désormais Flèche perforante.
- Textes, descriptions et Guide actualisés. Version visible : V15.16.

## Tests
- Mise à jour du test des coefficients V15.10 pour refléter l’échange.
- Nouveau test `v15_16_skill_exchange.test.js` : noms, coefficients, dégâts de chaque camp, critique ordinaire, malus au toucher, esquive, Purification, affichage des effets et Guide.
