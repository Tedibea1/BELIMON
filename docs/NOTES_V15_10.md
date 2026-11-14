# BELLYMON V15.10 — Coefficients des compétences offensives

| Compétence | Avant | Maintenant |
|---|---:|---:|
| Griffes fatales | ×1,0 | **×1,5** |
| Punition frénétique | ×1,4 | **×1,7** |
| Absorption | ×0,8 | **×0,5** |
| Flèche du cataclysme | ×1,7 | **×2,0** |
| Malédiction abyssale | ×0,8 | **×1,0** |
| Frappe spectrale | ×1,5 | **×1,3** |
| Vampirisation | ×1,0 | **×1,5** |
| Malédiction du sang | ×1,0 | **×0,5** |
| Vol de puissance | ×1,0 | **×1,0** (inchangé) |

- Dégâts et descriptions de `js/combat.js` synchronisés ; valeurs identiques pour les joueuses et les PNJ.
- **Griffes fatales** conserve son critique garanti ×2 : coup réussi = ×3 de base avant Défense et Constitution.
- **Vampirisation** soigne toujours 35 % des dégâts réellement infligés.
- Drainage d'énergie, malédictions, vol de Force, intangibilité, coûts en énergie, critiques et esquives inchangés.
- Pas de modification des statistiques ni des sauvegardes ; le nouveau calcul s'applique aux parties existantes.
- Nouveau test ciblé : `node tests/tests/v15_10_special_coefficients.test.js`.
- Certains tests anciens d'archive peuvent encore comporter les anciennes attentes de dégâts.
