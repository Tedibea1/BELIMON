# BELLYMON V15.1 — Rééquilibrage des critiques et esquives

## Règles actives

- **Critique** : `clamp(Math.floor(RAP_effective / 2), 0, 100)` %.
- **Esquive** : même formule, propre à la **cible**, sans comparaison des deux RAP.
- **Attaque légère** : précision intrinsèque 100 % ; esquive de la cible ; puis critique ordinaire si elle touche.
- **Attaque lourde** : **inchangée de V15** : précision comparative `clamp(50+(RAP_attaquant−RAP_cible)/2,0,100)` %, sans deuxième esquive, dégâts Force ×1,5 puis critique ordinaire ×2 si le critique est tiré.
- **Griffes fatales** : retour à la résolution de V14.8 (précision 100 % puis esquive ordinaire), critique garanti **×2** si elle touche. Ce n'est PAS un coup inévitable. Coût de 20 EN conservé.
- **Autres compétences** : leurs effets, durées, coûts et règles d'esquive préservés.
- **Bonus de collection** : toujours inclus dans la RAP effective du joueur.
- **Joueur et PNJ** : mêmes calculs.

Aucune migration de sauvegarde nécessaire : mêmes données et identifiants.

## Remarque historique
Les rapports V14.9/V15 restent disponibles comme archives des anciennes règles. `tests/archives_v15` contient les tests historiques qui vérifient intentionnellement les anciens comportements et qui ne s'appliquent plus à cette version.

## Tests effectués

- 18 suites de tests JavaScript réussies, dont 1 062 contrôles spécifiques V15.1.
- Tests Chromium PC (1440 px) et mobile (390 px) : 26 contrôles, aucune erreur JavaScript.
- Scénarios vérifiés : Griffes fatales restaurée, critique garanti ×2, lancement via interface, sauvegarde V15, bonus de collection, pièges, défense et intangibilité.
