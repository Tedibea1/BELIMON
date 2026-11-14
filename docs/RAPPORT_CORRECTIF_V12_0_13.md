# BELLYMON V12.0.13 — Indicateur de décision de l’adversaire

10 novembre 2026 — depuis BELLYMON V12.0.12

## Modification réalisée

- Dans le panneau Commandes pendant les tours de combat, affichage d’un indicateur circulaire animé et de la phrase « L’adversaire choisit son action… ».
- Brève attente avant résolution du tour : environ 520 ms en manuel, 140 ms en AUTO. L’IA utilise toujours la logique historique ; la pause est seulement visuelle.
- Boutons de combat, AUTO et « Quitter la tour » désactivés pendant ce délai ; chrono du tour suspendu, avec reprise du bon compte à rebours ensuite.
- Les effets chronométrés (Siphon et Malédiction) ne progressent pas pendant cette pause.
- Respect du réglage « réduire les animations ».
- Aucune modification des calculs de dommages, taux de critique, capture, PV, Constitution, consommation d’énergie, six classes ou sauvegardes.

## Phase 2 (idée distincte, non codée)

La future phase 2 de l’adversaire démarrera à 50 % de ses PV et exécutera les combinaisons **prédéfinies par le joueur, classe par classe**. Les six séquences et les comportements de repli en cas d'énergie insuffisante ne sont pas encore fixés. Il n’y a ni apprentissage de la stratégie du joueur, ni IA qui anticipe ses coups. Cette phase 2 demeure un projet à définir, distinct de l’indicateur de décision livré.

## Vérifications effectuées

- 12 suites JavaScript (`node tests/*.test.js`) : toutes réussies.
- Chromium PC/mobile : 320, 390 et 1440 px. **33 assertions ciblées** : affichage du message, cercle présent, verrouillage des commandes, chrono figé pendant la décision, disparition de l’indicateur, avancée effective du tour, résumé multi-ligne, aucune erreur JavaScript, aucun débordement horizontal.
- Test Chromium AUTO : activation, passage au tour suivant et absence de blocage ou d’erreur JavaScript.
- Les 84 sprites de personnages sont inchangés, les musiques de la V12.0.12 sont conservées.

## Compatibilité

- Aucun changement du format des sauvegardes ; anciennes parties compatibles.
- Pour transférer des sauvegardes entre chemins `file:///` dans Brave, exporter/importer les fichiers JSON depuis « Mes parties ».
- Les essais Chromium utilisent un stockage simulé ; ils ne peuvent certifier le stockage individuel de chaque navigateur.
