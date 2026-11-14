# BELLYMON V7 — Rapport de vérification

Date : 10 novembre 2026.

## Fonctionnalités ajoutées

- Fiche de waifu : choix du gigot, quantité, aperçu de ce qui sera dépensé, nourrissage.
- Barres d'évolution E à S avec seuils 100/180/260/380/520.
- Consommation minimale des gigots entiers demandés, retour des gigots non utilisés ; report des points excédentaires d'un gigot.
- Une seule évolution par validation.
- Passage E→D : choix de spécialisation musclée, obèse ou chétive avec aperçu graphique ; annulation sans dépenser.
- Statistiques de classe × coefficient de rang, puis cumul des bonus morphologiques. Aucun coefficient appliqué aux bonus permanents.
- PV maximum par rang, conservation du pourcentage de PV (pas de soins gratuits), maintien EN et des blessures.
- Sprites C et A chétifs = D et B, respectivement.
- Rang S bloque le nourrissage. Sauvegardes au format antérieur, sans changement de clé ou migration destructive.

## Vérifications

| Série | Contrôles | Résultat |
|---|---:|---|
| Module d'évolution V7 (`node tests/evolution.test.js`) | 500 | Réussi |
| Module de capture V6 | 33 | Réussi |
| Module de récompenses V5 | 21 | Réussi |
| Moteur de combat V3.1 | 44 | Réussi |
| Scénarios de navigateur V7 dans Chromium | 75 | Réussi |
| Compatibilité V4 / import de la démo V7 | 8 | Réussi |
| **Total compté** | **681** | **Réussi** |

Contrôles navigateur : achats E→D et D→C, C→B, B→A, A→S, remboursement 7 gigots sur 10, report 15 points de gros gigot, choix/cancel de morphologie, mise à jour des sprites/stats, persistance après rechargement, blocage du rang S, usage des sprites chétifs partagés, ouverture de la tour et des combats à 320, 375, 390, 430, 768 et 1440 px. Aucune erreur JavaScript de page détectée.

84 ressources PNG en 512×512 ont été contrôlées séparément. Une ancienne partie V4 contenant trois waifus a été chargée ; la nouvelle démo V7 s’importe comme partie indépendante.

## Limites

La navigation vers les fichiers locaux et localhost est bloquée dans le navigateur de test ; les scénarios automatiques chargent le HTML, le CSS et les scripts réels en mémoire, avec stockage local simulé. Cela teste les parcours et la logique mais **ne remplace pas une validation manuelle du stockage réel** dans votre navigateur.

Une seule montée de rang par validation : la nourriture destinée à plusieurs rangs n'est pas consommée automatiquement.

Le jeu ne change aucune mécanique antérieure (captures, combats, coffres, KO). Le contenu V8–V12 n'est pas anticipé.
