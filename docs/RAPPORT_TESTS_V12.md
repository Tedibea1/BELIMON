# BELLYMON V12 — Rapport de tests

**Date :** 10 novembre 2026  
**Base :** BELLYMON V11.  
**Objectif :** finition visuelle des combats, suivi des effets, suppression du blocage à 0 énergie, optimisations sans refonte des mécaniques.

## Changements vérifiés

1. Indicateur « TOUR N » durant les combats, avec animation à chaque nouveau tour.
2. Les deux cartes réagissent aux dégâts par une secousse, un flash et un nombre flottant ; soins en vert. Ce feedback est transitoire et ne touche pas aux sauvegardes.
3. Les malus sont visibles sur les cartes ; la fenêtre « Effets » détaille séparément les effets de la waifu, de l'ennemie et les pièges de la tour.
4. Durée et intensité : malédiction progressive de −10 % à −50 %, siphon en tours restants, malus de l'Épéiste jusqu'à la fin du combat et pièges sur deux étages.
5. La fenêtre d'effets suspend le chronomètre et AUTO, sans laisser le combat avancer en arrière-plan.
6. Déblocage d'un duel dont les **deux** protagonistes ont épuisé leur énergie : perte simultanée de **15 % des PV maximum par tour**, sans récupération d'énergie, puis résultat déterminé normalement. Le KO simultané vaut défaite.
7. Économie des rafraîchissements DOM sur les longues collections et les statistiques permanentes, sans modifier le contenu enregistré.
8. Titre, en-tête et pied de page « BELLYMON V12 ».

## Tests automatisés réellement exécutés

| Groupe | Vérifications réussies |
|---|---:|
| Anciennes règles AUTO V10 | 23 049 |
| Bonus V8 | 949 |
| Pièges V9 | 894 |
| Évolutions V7 | 500 |
| Captures V6 | 33 |
| Combats V3.1 | 44 |
| Récompenses V5 | 21 |
| **Anciennes règles — sous-total** | **25 490** |
| Nouveaux tests V12 : épuisement, affichage des durées et effets | 34 |
| Tests navigateur V12 : création, coups, malus, AUTO, six résolutions | 91 |
| **Total de vérifications réussies** | **25 615** |

**Attention :** les milliers d'assertions des anciennes suites comportent de nombreuses variations combinatoires ; ce nombre n'est pas le nombre de scénarios indépendants.

### Parcours de navigateur V12

- Chromium headless aux résolutions **320, 360, 390, 430, 768 et 1440 px** : aucune erreur JS ni débordement horizontal détecté.
- Création de partie, rencontre ennemie, combat et compétence spéciale de l'Épéiste.
- Tour 1 → tour 2 ; diminution des PV, chiffres d'impact et animation de carte.
- Puce de Constitution −15 % ; ouverture, lecture et fermeture de la fenêtre « Effets ».
- Import d'une ancienne sauvegarde de pièges ; force −20 % et toutes statistiques −10 % visibles simultanément.
- Combat AUTO démarré avec les deux combattantes à 0 énergie : le duel se termine au lieu de rester bloqué.
- Vérification des 84 illustrations PNG présentes.

**Limites des tests :** la navigation Chromium directe vers `file://` a été bloquée par l'environnement. Les scripts de la page ont été chargés en mémoire ; `localStorage` et l'absence d'IndexedDB ont été simulés. Il n'est donc pas possible d'affirmer que le stockage réel de votre navigateur personnel a été testé. Les animations sont contrôlées par inspection DOM et captures d'écran ; les sensations visuelles doivent aussi être vérifiées manuellement.

## Compatibilité

- Schémas et clés des parties V1–V11 conservés.
- Archive groupée `bellymon-v11-archive` toujours prise en charge (nom historique volontaire).
- Aucun sprite de rang supplémentaire créé, aucune classe ou capacité redéfinie.
- Les nombres de points de nourrissage, les chances de capture, les taux de coffres, la durée des blessures et les trois bonus permanents restent inchangés.

## Note d'équilibrage

L'épuisement à 0 énergie des deux côtés est **la seule nouvelle règle de combat** de la V12. Elle corrige une impasse connue de la V11 ; si le rythme de ce mécanisme ne convient pas après essai, son pourcentage pourra être ajusté dans une mise à jour ultérieure. Aucun coefficient général ou statistique de classe n'a été retouché sans validation.
