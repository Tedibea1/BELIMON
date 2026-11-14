# BELLYMON V10 — Rapport de tests

Date : 10 novembre 2026
Base : BELLYMON V9, code modifié uniquement pour AUTO et MAX (plus version affichée).

## Tests unitaires (Node.js)

| Module | Vérifications réussies |
|---|---:|
| AUTO V10 (choix de classe, PV, énergie, délais) | 23 049 |
| Bonus permanents V8 | 949 |
| Pièges V9 | 894 |
| Évolutions V7 | 500 |
| Capture V6 | 33 |
| Combat V3.1 | 44 |
| Récompenses V5 | 21 |
| **Total** | **25 490** |

## Tests dans Chromium (Playwright)

- **52 vérifications V10 réussies** : activation/désactivation, plusieurs tours automatiques,
  désactivation des actions manuelles pendant AUTO, aucune capture automatique,
  aucune avancée automatique de la tour, pas de chronomètre actif en AUTO,
  chrono revenu en manuel, sauvegarde et reprise d'AUTO après rechargement,
  arrêt lors de la consultation de la collection, reprise au retour dans Tour,
  relais obligatoire après KO (sans remplacement automatique).
- **MAX** : sélection de tout le stock de petits ou gros gigots, conservation
  des gigots non consommés, progression D→C et choix obligatoire de morphologie E→D.
- **Interface** : tests à 320, 360, 390, 430, 768 et 1 440 pixels ; pas de
  débordement horizontal sur les écrans principaux / fiches testées.
- **83 vérifications de non-régression V9 réussies** : pièges, combat sous malus,
  sauvegarde, durée de deux étages, anciennes sauvegardes, passage d'étages,
  coffres et interface responsive.
- **Aucune exception JavaScript** détectée lors de ces parcours.

**Total général : 25 625 vérifications automatisées réussies**
(unitaires et navigateur ; des vérifications répétées font partie des
parcours combinatoires, pas 25 625 scénarios uniques).

## Méthode et limites

- Test exécuté en navigateur Chromium headless avec feuille CSS et scripts
  assemblés en mémoire. Les images ont été remplacées par des versions
  réduites uniquement pendant ces tests pour accélérer l'exécution.
- Stockage local simulé dans les tests du navigateur pour pouvoir contrôler
  les sauvegardes et les rechargements. La persistance réelle, selon le chemin
  `file://` du navigateur de l'utilisateur, reste à vérifier manuellement.
- Le flux réel d'intégration a été vérifié, mais tous les choix aléatoires
  possibles ne peuvent pas être épuisés par ces essais.
- Avec la règle validée « aucune régénération d'énergie en combat », un
  combat où les deux personnages n'ont plus d'énergie peut rester bloqué.
  AUTO se met alors en pause et affiche une information, plutôt que d'écrire
  indéfiniment de nouveaux tours. Le comportement du combat lui-même n'a pas
  été modifié sans validation.

## Compatibilité

- Structure et format des sauvegardes précédentes inchangés.
- `data.autoCombat` est facultatif sur les anciens JSON ; quand il est absent,
  AUTO est désactivé.
- Les règles de nourrissage, capture, bonus et pièges ont été préservées.
