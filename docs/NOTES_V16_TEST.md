# BELLYMON V16.0 LAB — Refonte des animations (ZIP uniquement)

**Base :** édition du site GitHub Pages correspondant à BELLYMON V15.19, commit `cdb199138f3f41c2abb98ef6e762bf1818d7622a`.

**Livraison :** projet ZIP complet, **aucun push GitHub**.

## Principes

- Couche de présentation ajoutée via `js/v16-motion.js` et `css/v16.css` ; points d'accroche réduits dans `js/game.js`, plus le chargement de ces nouveaux fichiers dans `index.html`.
- Le tirage des coffres est toujours effectué par `BellymonRewards.chestReward()` et appliqué une seule fois par `REWARDS.grant()` après sauvegarde. Trois rouleaux illustrent **type, quantité et bonus** du résultat existant.
- Le type de piège est toujours choisi par `BellymonTraps.select()` et appliqué par `TRAPS.apply()` ; la roue à quatre segments représente les types existants et est orientée vers le **type sauvegardé**.
- Toutes les animations sont purement décoratives. Les scripts de moteur `combat.js`, `traps.js`, `rewards.js`, `evolution.js`, `capture.js`, `shop.js`, `hospital.js`, `auto.js`, `bonuses.js` et `audio.js` sont **identiques** à la V15.19.
- « Passer l'animation » termine la présentation en montrant les valeurs obtenues sans déclencher de nouveau calcul ou octroi ; la fermeture du résultat suit toujours le fonctionnement existant.
- Pendant les révélations, AUTO attend leur fin ; animations AUTO raccourcies. Option individuelle ON/OFF mémorisée, plus gestion de `prefers-reduced-motion`.

## Effets ajoutés

1. Coffres : trois rouleaux animés, arrêts successifs, lueur bonus.
2. Pièges : roue circulaire des quatre malus, flèche fixe, arrêt sur type réel.
3. Tour : signal de changement d'étage, mise en valeur de paliers.
4. Collection : reflets et élévation des cartes, mise en valeur de l'active.
5. Hôpital : progression visuelle par lit et notification de fin de soin.
6. Boutique : effet d'achat confirmé.
7. Nourrissage / évolution : réactions du portrait et de la jauge.
8. Combat / capture : éclats de compétence et anneau de capture.
9. Bonus / menus : animations des niveaux, onglets, fenêtres.

## Tests

- `node tests/tests/v16_motion.test.js` : 37 contrôles ciblés, dont butin prédéterminé, arrêt sur 4 types de pièges, skip, AUTO et désactivation des effets.
- Régressions ciblées : récompenses, évolution, compétences V15.16, hôpital V15.17, malédiction V15.18, vol de Force V15.19, classes V15.4.
- Tous les fichiers référencés localement par `index.html` ont été vérifiés présents ; assets inclus.
- Blocage administratif de navigation locale du navigateur de validation : tests visuels manuels à réaliser sur PC.

## Compatibilité

- Sauvegardes et règles de la V15.19 inchangées. Les parties du domaine GitHub Pages et celles de `localhost` / `file://` ne partagent pas nécessairement la même zone de stockage ; utiliser import/export JSON.
- Un ancien résultat non acquitté peut réafficher une animation lors de la reprise de la sauvegarde, mais ne génère ni nouveau butin ni nouvelle pénalité.
