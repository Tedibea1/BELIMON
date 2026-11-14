# Tour des Waifus — Rapport de vérification V1

10 novembre 2026.

## Vérifications réussies

- Syntaxe de `js/game.js` : `node --check` réussi.
- 84/84 sprites de l'archive fournie présents ; les 84 images PNG font 512 × 512 pixels et s'ouvrent.
- Parcours automatisé Chromium exécuté en mémoire : **24 vérifications réussies**.
- Création d'une partie avec une des six héroïnes.
- Calcul initial des PV de rang E (Bagarreuse : 160 × 0,68 = 109 PV arrondis) et énergie 100.
- Plusieurs parties indépendantes et rechargement simulé depuis le stockage persistant.
- Sauvegarde manuelle, menu des parties, reprise d'une partie.
- Export JSON et vérification du contenu exporté.
- Import JSON par copier-coller, création d'un nouvel emplacement sans écraser les existants.
- Confirmation et annulation de suppression ; suppression durable dans le stockage simulé.
- Rejet d'une sauvegarde de format incompatible.
- Interface de création et de jeu testées sur viewport PC 1280 × 900 et mobile 390 × 844.
- Deux cartes côte à côte même sur mobile ; aucun débordement horizontal détecté.
- Aucune erreur JavaScript pendant ces parcours.
- Navigation de tour volontairement désactivée en V1, conforme à la feuille de route.

## Limite honnête du banc de test

Le navigateur Chromium disponible dans l'environnement d'exécution bloque les
navigations vers `http://localhost` et `file://` (erreur administrateur).
Les tests utilisent donc le vrai HTML/CSS et le vrai code JS chargés **en
mémoire**, avec les images de rang E intégrées pour l'affichage et un
`localStorage` simulé. **La persistance réelle IndexedDB/LocalStorage sur
l'ordinateur du joueur n'a pas pu être vérifiée depuis cet environnement.**
La V1 propose IndexedDB et une voie de secours localStorage.

À vérifier par l'utilisateur après installation : créer une partie, fermer
le navigateur, rouvrir le même fichier à la même adresse, puis la recharger.
Tester l'export JSON comme filet de sécurité avant tout changement de dossier
ou de navigateur.

## Respect de la feuille de route

La V1 ne prétend pas implémenter les combats, la capture, l'alimentation,
les pièges, les récompenses, ni la navigation dans la tour. Ces systèmes
arriveront dans les versions validées correspondantes.
