# BELLYMON V12.0.14 — Chronomètre partagé, décisions indépendantes

**10 novembre 2026 — Correctif de la V12.0.13.**

## Comportement corrigé

Le joueur et la waifu ennemie disposent **du même délai de 15 secondes**, qui démarre au début du tour. La décision de l'IA est préparée indépendamment du moment où le joueur appuie sur une commande.

- **Joueur plus rapide** : son action est verrouillée ; un cercle animé et « L’adversaire choisit son action… » s'affichent. Le chronomètre continue jusqu'à ce que l'IA ait choisi ; résolution immédiate ensuite.
- **IA plus rapide** : le joueur continue de réfléchir avec le reste du même chrono. Dès son clic, les deux actions se résolvent sans pause ajoutée.
- **Aucun choix du joueur à 15 secondes** : son action est sautée, puis l'action de l'IA est appliquée.
- **Combat AUTO** : décisions accélérées, sans dépendance à un clic manuel.
- **Fenêtre de détail des effets / onglet masqué** : les deux décisions sont suspendues ensemble ; cela correspond à la politique de pause préexistante du jeu.
- **Captures** : la décision ennemie est conservée pour la riposte lors d'une tentative ratée.

L'IA continue de sélectionner parmi légère, lourde, spéciale et défense avec ses probabilités habituelles. Aucune phase 2 ni séquence personnelle par classe n'a été codée à ce stade.

## Modifications du code

- `js/game.js` : horloge commune de 15 s, délai indépendant de choix ennemi, attente conditionnelle, résolution lorsque les deux décisions existent, maintien du chrono et des effets chronométrés pendant l'attente.
- `js/combat.js` : le moteur accepte une action ennemie présélectionnée (contexte `enemyAction`), avec repli si l'action n'est plus payable ; les anciens appels sans contexte restent compatibles.
- `tests/chrono_commun_browser.py` : scénarios de décision avant/après, timeout, capture, AUTO et tailles d'écran.

## Vérifications effectuées

- **7 scénarios Chromium** réussis : action du joueur avant l'IA sur 320/390/1440 px ; IA avant le joueur ; délai dépassé (action passée) ; combat AUTO ; capture avec riposte.
- Pendant l'attente, chrono observé passer de **15 s à 14 s** ; résolutions des tours vérifiées et aucune erreur JavaScript détectée.
- **12 suites Node.js** passées sans échec (combats, capture, évolution, bonus, pièges, AUTO, siphon, malédiction, Griffes fatales, messages et HUD).
- `node --check` sur les deux modules modifiés : valide.

## Compatibilité

Aucune modification du format des sauvegardes ni des 84 sprites. Pour changer de dossier ou d'appareil, exporter puis importer la partie JSON. Les tests automatisés du navigateur reposent sur un stockage simulé : ils ne certifient pas l'IndexedDB propre au navigateur de chaque joueur.
