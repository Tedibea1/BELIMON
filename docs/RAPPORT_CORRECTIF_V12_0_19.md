# BELLYMON V12.0.19 — Récupération sans supprimer AUTO

## Modifications apportées

- Ajout d'une septième commande de combat **⚡ Récupération** (0 énergie). Les six commandes précédentes, y compris **AUTO**, restent disponibles.
- Récupération restaure **2/3 de l'énergie maximale**, arrondis vers le haut : **+67 EN** pour une jauge à 100, sans jamais dépasser 100.
- Durant le tour où elle est choisie, la combattante reçoit **30 % de dégâts supplémentaires** si elle est attaquée, **indépendamment de l'ordre des actions**. Le bonus de vulnérabilité n'est pas permanent : il disparaît au tour suivant.
- L'adversaire peut choisir Récupération, et y recourt impérativement lorsqu'il possède moins de 15 EN, afin de ne pas se limiter indéfiniment à Défense.
- Le mode AUTO choisit également Récupération lorsqu'il n'a plus assez d'énergie pour attaquer.
- Suppression de l'ancienne pénalité d'épuisement qui retirait des PV aux deux combattantes à zéro énergie. La nouvelle action constitue la solution normale à l'impasse.
- Conservation des coûts précédents : légère 15 EN, lourde 15 EN, spéciale 20 EN, Défense 0 EN, capture 2 EN ; des malus/aptitudes inchangés, et des sauvegardes existantes compatibles.

## Tests réalisés

- **7 suites de tests JavaScript** réussies (dont 11 vérifications ciblées Récupération et 11 scénarios de la V12.0.18).
- **42 contrôles ciblés de Chromium réussis**, sur des écrans de **320, 390 et 1 440 px**.
- Cas de deux combattantes à 0 EN : les deux choisissent Récupération, passent à **67/100 EN**, les PV restent inchangés.
- AUTO activé à 0 EN : utilise Récupération, la partie continue et le bouton AUTO reste présent.
- Augmentation de 30 % des dégâts vérifiée dans le moteur et dans Chromium, y compris lorsque l'adversaire est plus rapide.
- Fichage des coûts, absence de débordements horizontaux et absence d'erreurs JavaScript dans ces scénarios.
- La suite historique étendue de l’hôpital n’a pas abouti dans le temps imparti lors de la régression ; ses scénarios de base (3 lits/18 secondes, restrictions étage 1) ont toutefois passé les tests du moteur. Ce rapport ne la présente pas comme réussie.

## Fichiers modifiés

- `js/combat.js` : règles et choix IA.
- `js/auto.js` : décision AUTO.
- `js/game.js` : interface de combat et bruitage.
- `index.html` et `css/v12_0_19.css` : septième commande.
- `tests/v12_0_19_recovery.test.js` et `tests/v12_0_19_browser.py` : nouveaux tests.

## Installation

Décompresser l'archive complète, puis ouvrir `BELLYMON_V12.0.19/index.html`. Exporter les sauvegardes JSON de l'ancienne version par précaution avant de changer de dossier.
