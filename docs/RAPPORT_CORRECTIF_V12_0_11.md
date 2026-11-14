# BELLYMON V12.0.11 — Démarrage automatique de la musique

## Demande
Supprimer le bouton « ▶ Écouter l’ambiance musicale » sur l’écran « Mes parties » et essayer de jouer la musique d’exploration dès l’ouverture du jeu, sans avoir à lancer une partie ni à cliquer sur un bouton musical.

## Correction
- Suppression du bouton, de sa gestion JavaScript et de son style CSS.
- Démarrage direct par `BellymonAudio.start()` au chargement initial, avant la lecture asynchrone des sauvegardes.
- Tentative de lecture du MP3 même lorsqu’aucun geste n’a encore eu lieu, si l’option « Musique d’ambiance » est activée.
- En cas de refus par la politique autoplay du navigateur, nouvelle tentative au premier clic / toucher / appui clavier n’importe où sur la page.
- Préservation des réglages individuels musique/bruitages, de l’arrêt lorsque l’onglet est masqué, des musiques d’exploration et de combat, des sprites et des mécaniques V12.0.10.

## Limite technique
Un navigateur peut empêcher tout son audible jusqu’à une interaction de l’utilisateur. Le jeu tente la lecture dès l’ouverture mais ne peut pas contourner cette politique du navigateur. Aucun clic sur un bouton spécifique n’est exigé ; un clic normal (par exemple « Continuer ») suffit dans le cas bloqué.

## Tests
- **Chromium 390 et 1440 px**, autoplay autorisé : musique lue immédiatement sans geste, MP3 décodé et progression du temps de lecture, aucune erreur JS.
- **Chromium 390 et 1440 px**, politique de blocage d’autoplay **simulée** : la lecture est refusée avant interaction puis réussit au premier clic ordinaire.
- **Chromium 390 px**, préférence musicale désactivée : silence respecté, réactivation dans « 🎵 Son » fonctionnelle, dans les deux politiques.
- **Chromium 320, 390 et 1440 px** : 69 contrôles audio, transition de combat, bandeau et préférences passent.
- **Chromium 390 et 1440 px** : 4 contrôles de reprise de coffre / piège et continuité musicale passent.
- **Node.js** : 12 suites de tests de combat, collection, évolution, capture, bonus, pièges et compétences réussies.
- Les tests navigateur chargent la page et ses ressources dans Chromium via des assets routés et un stockage simulé ; le navigateur de test ne permettait pas l'ouverture directe `file://` (restriction administrative de l'environnement). Le comportement d'une installation personnelle de Brave dépend aussi de ses paramètres d'autoplay.

## Installation
1. Exporter ses sauvegardes JSON depuis l’ancienne version.
2. Décompresser **entièrement** `BELLYMON_V12.0.11.zip`.
3. Ouvrir `BELLYMON_V12.0.11/index.html`.
4. Le menu « Mes parties » apparaît sans bouton d’activation musicale. Si Brave empêche l’autoplay, la musique démarre lors du premier clic ou toucher ordinaire sur le jeu.
