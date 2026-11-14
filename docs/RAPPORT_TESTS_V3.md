# Tour des Waifus — Rapport de tests V3

Date : 10 novembre 2026
Jalon : V3 — combats manuels (attaques, défense, énergie, IA, esquive, critiques).

## Résultat

**132 contrôles automatisés réussis, aucune erreur JavaScript détectée.**

Tests via Chromium headless/Playwright avec stockage local simulé ; rendu et interactions contrôlés sur :

- PC : 1440 × 900
- Mobile : 390 × 844
- Petit mobile : 320 × 700

## Parcours fonctionnels vérifiés

- Gestion des parties, choix de classe et PV de rang E.
- Tour infinie V2, rencontre affichée et annonce COMBAT.
- Prévisualisation avant COMBATTRE, aucun saut de rencontre possible.
- Grille de six commandes ; **légère, lourde et défense actives** ;
  spéciale, capture et AUTO volontairement désactivées.
- Enregistrement de l'énergie consommée et des PV après les tours.
- Enregistrement de l'ennemie, de son énergie et du compteur de tours.
- Reprise d'un combat interrompu après rechargement simulé du navigateur.
- Victoire par KO, annulation de l'attaque ennemie, récupération de la
  combattante, puis passage à l'étage suivant.
- Défaite par KO : retour à l'étage 1, soins et énergie restaurés,
  record et collection conservés, fenêtre de résultat.
- Ouverture des coffres conservée ; récompenses V5 non inventées.
- Collection et onglet Bonus préservés.
- Aucun débordement horizontal sur les résolutions testées.

## Calculs unitaires vérifiés

- Coûts EN : légère 1, lourde 3, défense 0.
- Plafonds : esquive 30 %, critique 30 %.
- Bonus permanents : +2 par niveau sans coefficient multiplicateur.
- IA : répartition légère/lourde/défense selon les poids V3,
  et exclusion des coups impossibles faute d'énergie.
- Dégâts : légère ×0,8 ; lourde ×1,3.
- Précision lourde 80 % et gestion des échecs.
- Défense : division des dégâts reçus par 2 après Constitution.
- Critique : multiplication des dégâts par 2.
- KO avant la riposte : aucune dépense d'énergie pour l'attaque annulée.

## Limites de la vérification

- Ces tests utilisent un **stockage simulé** dans Chromium, avec rechargement
  reproduit en recréant une page et en réinjectant les données : ils ne
  garantissent pas le comportement IndexedDB ou file:// sur chaque appareil.
- Les 84 images présentes dans l'archive sont celles fournies pour le
  projet ; les captures automatiques utilisent les sprites E intégrés
  directement à la page de test en raison des restrictions de chargement
  local de l'environnement.
- La V3 n'inclut pas encore les compétences spéciales, le chrono 15 s,
  le remplacement après KO, la capture, les gains de butin ni le mode AUTO.

Ce rapport ne représente pas une validation visuelle par l'utilisateur ;
le ressenti et l'ergonomie restent à confirmer dans le navigateur réel.
