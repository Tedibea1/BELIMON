# BELLYMON V14.5 — Ascension AUTO et commandes réorganisées

- AUTO unique : activable pendant les combats et dans la tour, avançant entre salles, lançant les combats, ouvrant les coffres et confirmant les résultats après pause lisible.
- Respect de la visibilité : onglets de jeu, fenêtres modales, annonces et onglet navigateur suspendent l'ascension ; aucun paiement de raccourci ni capture automatiques.
- Défaite : AUTO désactivé ; KO avec relais : AUTO désactivé, choix du relais laissé au joueur.
- L'action « Quitter la tour » désactive AUTO.
- Barre Commandes à l'étage 1 : bouton Avancer pleine largeur, les deux raccourcis côte à côte sur PC/mobile, solde lisible.
- V14.4 conservée : calculs exponentiels, soins, captures, butins et sauvegardes inchangés.

## Tests exécutés
- 15 suites unitaires JavaScript : réussies.
- 84 contrôles Chromium des raccourcis (320, 390, 1440 px) : réussis.
- Parcours AUTO sur les trois largeurs (combat, passage à l’étage 2, arrêt manuel, absence de dépenses) : réussis.
- Suspension quand on consulte une autre section : réussie.
- Coffre, piège et arrêt à la défaite : réussis.
- Aucune erreur JavaScript détectée dans ces scénarios.
