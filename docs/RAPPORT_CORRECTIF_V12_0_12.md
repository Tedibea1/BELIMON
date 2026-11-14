# BELLYMON V12.0.12 — compte rendu du correctif

10 novembre 2026 — basé sur le moteur stable **V12.0.11**.

## Modification réalisée

- Pendant un combat (tour actif), le bandeau violet présentant les actions du tour précédent est affiché **après** le panneau **COMMANDES**, sous tous les boutons, y compris « Quitter la tour ».
- Les deux phrases conservent un retour à la ligne (action du joueur puis action de l'adversaire).
- En dehors du combat (salle de repos, coffre, choix avant combat, victoire, défaite ou relais), le bandeau reste **avant** les commandes. L'ordre est rétabli automatiquement.
- Aucune modification du moteur de dégâts, des six classes, des compétences, des PV, de la Constitution ou du stockage.

## Analyse des captures du joueur — Bagarreuse S obèse contre Archère S musclée

- PV maximum Bagarreuse : **392** ; Archère : **245**.
- Après le tour 1 : Bagarreuse **294 PV**, Archère **200 PV**. La Flèche du cataclysme a infligé **98 dégâts** et le Siphon **45 dégâts**.
- Au tour 4 : Bagarreuse **248 PV**, Archère **200 PV** après des tours de défense affichant **23 dégâts** par attaque légère.
- Au tour 5 : Bagarreuse **150 PV / 90 EN**, Archère **155 PV / 28 EN**. Le Siphon a fortement diminué les ressources de l'Archère.
- **Constitution toujours active**, même en dehors de l'action Défense : `arrondi(Force × puissance × 100 / (100 + Constitution))`, puis les critiques et la Défense sont appliqués selon le cas.

## Proposition de PV liés à la Constitution

Cette proposition reste **à discuter** et se trouve dans le cahier d'idées (idée n°004). La Constitution réduit déjà les dégâts ; les PV supplémentaires constitueraient donc un second avantage défensif. **Aucune modification de PV n'a été effectuée dans V12.0.12.**

## Tests

- **12 suites JavaScript Node.js passées** (combat, capture, effets chronométrés, évolution, bonus, AUTO, pièges, Siphon, Griffes fatales, etc.).
- **24 vérifications Chromium** sur 320, 390 et 1440 px : repos (ancien ordre), combat (nouvel ordre), texte sur deux lignes, aucune erreur JavaScript, aucun débordement horizontal.
- Les sprites (84 PNG) et musiques/sons de V12.0.11 sont conservés.
- Les tests navigateur fonctionnent avec stockage simulé ; sauvegardez toujours vos parties en JSON avant de changer de dossier.

## Test manuel

Décompresser le ZIP complet, ouvrir `index.html`, lancer un combat et constater que le panneau violet « Ta waifu… / L’adversaire… » est **sous COMMANDES**. Au repos, le bandeau d'information garde sa place précédente.
