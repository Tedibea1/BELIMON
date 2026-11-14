# BELLYMON V15.5 — GUIDE INTÉGRÉ

## Fonctionnalités livrées

- Bouton « 📖 Guide » dans l’en-tête, depuis le menu, la création et une partie.
- Barre : Retour au jeu / Classes / Morphologies / Compétences.
- Douze fiches de classes cliquables ; seules les illustrations officielles `assets/characters/<classe>/commun/E.png` sont utilisées.
- Profil de spécialisation FOR / RAP / CONS au format `+`, `++`, `+++`, `++++` calculé sur les profils de classe du moteur, sans révéler les valeurs numériques.
- Morphologies Musclée, Obèse, Chétive affichées uniquement sous forme qualitative, sans sprite avancé, profils calculés depuis les bonus de morphologie du moteur.
- Douze compétences spéciales : noms reliés au moteur pour éviter les écarts lors des renommages, descriptions qualitatives sans coefficients, pourcentages, probabilités ou formules.
- Responsive PC et téléphone, sans connexion web ni nouvelle dépendance.
- Consultation du Guide durant un combat : pause de l'horloge et des choix ennemis ; le retour reprend la partie et le combat.
- Retour sur le bon écran après consultation, avec conservation du formulaire et de l’état de la partie.
- Sauvegardes strictement inchangées ; aucun changement des mécaniques, des statistiques, des sorts ou des sprites existants.

## Tests

- 22 suites de tests JavaScript existantes réussies.
- 49 vérifications Chromium navigateur PC et mobile : navigation, 12 fiches, 3 morphologies, 12 sorts, rang E seulement, absence de chiffres techniques visibles, retour menu/création/jeu, aucune erreur JavaScript.
- 14 vérifications Chromium supplémentaires sur un combat actif : compteur figé pendant consultation, reprise, combat intact, aucune erreur JavaScript.

## Fichiers concernés

- `index.html` : bouton, section Guide, scripts et styles.
- `css/guide.css` : interface responsive du Guide.
- `js/guide.js` : fiches et navigation.
- `js/game.js` : intégration avec l'écran actif et la pause.
- `README.txt`, `RAPPORT_V15_5.md` : documentation.

