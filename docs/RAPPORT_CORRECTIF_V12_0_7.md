# BELLYMON — Rapport de correctif V12.0.7

Date : 10 novembre 2026  
Base : V12.0.6 (correctifs 12.0.1–12.0.6 conservés).  
Portée : interface des comptes rendus de combat et ajout de l'audio.

## 1. Bandeau de combat

- Le titre d'ennemie « ⚔️ Archère arcanique · Rang S » à gauche du résumé du tour est retiré pour tous les combats en cours.
- Seul le texte `lastMessage` est rendu, avec son véritable séparateur `\n` entre l'action du joueur et celle de l'adversaire.
- Les panneaux de salle de repos, trésor, piège, victoire, capture et relais gardent leurs titres habituels.
- Aucun changement dans les statistiques, actions, probabilités ou récompenses.

## 2. Bande-son originale

- `assets/audio/exploration.mp3` : composition originale de 42,67 secondes, boucle douce pour l'exploration et les menus.
- `assets/audio/combat.mp3` : composition originale de 27,83 secondes, boucle plus vive pour les combats.
- Les fichiers sont embarqués et restent disponibles sans connexion Internet. Le script de génération reproductible est dans `tools/generate_music.py`.
- `js/audio.js` gère les pistes, fondus, les effets sonores Web Audio, et un démarrage autorisé après interaction du joueur.
- Les sons événementiels incluent actions légère/lourde/spéciale, défense, coups, critiques, captures, pièges, coffres, nourrissage, évolution, remplacement, victoire et défaite.
- Le bouton « 🎵 Son » ouvre des réglages distincts pour musique et bruitages, chacun avec activation et volume. Le stockage des préférences audio est séparé des sauvegardes de parties.
- Pause de la musique lorsque l'onglet devient invisible.

## 3. Tests automatiques

### Chromium — nouveaux scénarios V12.0.7

**69 vérifications réussies** sur les largeurs 320, 390 et 1440 pixels :
- affichage du bouton et panneau de réglages audio ;
- activation au premier geste ;
- volumes et préférences mémorisés entre deux chargements du jeu ;
- changement automatique de piste entre exploration et combat ;
- MP3 réellement décodés dans Chromium (`readyState = 4`, aucune erreur, piste de combat en lecture, musique d'exploration en pause) ;
- nom/rang de l'ennemie retirés du bandeau en combat ;
- conservation des deux lignes d'actions ;
- absence de débordement horizontal ;
- aucune erreur JavaScript dans les scénarios testés.

### Non-régression

- 9 tests JavaScript Node.js (combat, auto, bonus, capture, évolution, messages, récompenses, pièges, V12) : réussis.
- Quota de 3 waifus en combat : 28 contrôles Chromium réussis.
- Renommage, tri et suppression : 40 contrôles Chromium réussis.
- Fermeture des annonces : 7 scénarios Chromium réussis.
- Bandeau sur deux lignes : 14 contrôles Chromium réussis.

Une ancienne suite exhaustive d'interface V12 a dépassé le délai d'exécution lors de sa relance ; elle n'est **pas** comptée comme réussie pour cette version. Les scénarios ciblés et les suites citées ci-dessus ont été exécutés avec succès.

### Limites

Les tests automatisés utilisent Chromium injecté en mémoire et un stockage local simulé, car l'ouverture locale `file://` est restreinte dans l'environnement de test. La persistance réelle dans Brave/Chrome sur le PC de l'utilisateur doit être vérifiée après installation. L'audio est embarqué et sa lecture a été confirmée avec les vrais fichiers MP3 dans Chromium.

## 4. Compatibilité

- Identifiants des parties, formats d'export JSON et noms de stockage inchangés.
- Aucun sprite modifié (84 illustrations conservées).
- Ne pas remplacer seulement `index.html` : décompresser l'archive intégralement.
- Conseillé : exporter les sauvegardes JSON avant un changement de version/dossier.
