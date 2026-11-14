# BELLYMON V12.0.6 — Quota des combats et descriptions simplifiées

## Modifications

- 3 waifus différentes maximum **par combat**, première choisie avant le combat comprise.
- Relais uniquement après KO : deux remplaçantes supplémentaires au maximum.
- KO de la troisième participante : défaite immédiate, retour étage 1 avec collection intégralement soignée, même s'il reste des personnages en réserve.
- Un petit indicateur `👩 1/3`, `2/3`, `3/3` apparaît durant le duel ; la fenêtre de relais rappelle le nombre déjà engagé.
- Le quota est sauvegardé dans `tower.combat.usedHeroIds`, y compris après rechargement. Les anciennes sauvegardes en combat sans ce champ sont compatibles : l'historique des KO et la combattante active reconstituent le compteur.
- Création de personnage : seulement **DPS, Tank, Healer, Soutien** sous les six classes. Les valeurs numériques de statistiques restent cachées à ce stade ; les mécaniques n'ont pas été changées.
- Choix de la morphologie E→D : remplacer `+6/+4/+2` par des indices qualitatifs :
  - Musclée : *Très forte, bonne résistance, mais lente.*
  - Obèse : *Très résistante, forte, mais lente.*
  - Chétive : *Très rapide, assez forte, mais fragile.*
- Aucune modification des statistiques réelles, des bonus, des sprites ou des règles des soins et captures.

## Tests

- 28 vérifications ciblées dans Chromium : six waifus possédées, trois participantes exactement, deux relais, troisième KO et défaite, combattante initiale choisie librement, interruption/reprise, compatibilité d'une sauvegarde V4 sans compteur, capture ratée entraînant un KO, noms des rôles et textes de morphologie. **Tous réussis**, aucune erreur JavaScript.
- Fenêtre d'évolution testée en Chromium à 320, 390 et 1440 px, sans débordement horizontal.
- Tests de régression JavaScript : `auto`, `bonuses`, `capture_rules`, `combat_rules`, `evolution`, `message_linebreak`, `rewards`, `traps`, `v12_rules`. **9 suites réussies.**
- Chromium utilise ici un stockage local simulé ; la persistance réelle sur l'appareil du joueur n'a pas été testée.

## Installation

Décompresser le ZIP et ouvrir `BELLYMON_V12.0.6/index.html`. Exporter les parties JSON depuis l'ancienne version avant de changer de dossier, puis les réimporter si nécessaire.
