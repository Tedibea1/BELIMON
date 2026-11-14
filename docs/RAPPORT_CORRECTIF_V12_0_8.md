# BELLYMON — Rapport de correctif V12.0.8

Date : 10 novembre 2026  
Base : BELLYMON V12.0.7 — conservation de tous les correctifs précédents.

## Modifications demandées

### 1. Bagarreuse — Siphon d’énergie : 4 tours

- La durée passe **de 3 à 4 tours**, **tour de lancement compris**.
- Le siphon continue à retirer **1 point d’énergie par seconde réelle active** à la victime, pendant les tours concernés.
- Le sort reste **relançable** pour remettre la durée à 4 tours, sans cumuler deux drainages.
- Seuls la durée et les textes descriptifs de cette compétence ont été changés ; les autres dégâts, effets et classes restent identiques.
- La reprise d'une partie ne décompte pas les secondes passées avec l'onglet fermé ou masqué (règle déjà présente).

### 2. Musique sur « Mes parties »

- L'écran de sélection des sauvegardes utilise la **musique d'exploration**, comme les écrans non-combat.
- La musique peut se lancer après la première interaction souris/clavier/toucher, conformément aux restrictions d'autoplay des navigateurs.
- Le bouton **« ▶ Écouter l’ambiance musicale »** permet de la démarrer directement depuis cet écran sans ouvrir une partie. Il se masque lorsque l'ambiance est en cours de lecture.
- Retour de la tour vers « Mes parties » : l’ambiance continue sans coupure inutile.
- Les réglages musicaux et les MP3 originaux de V12.0.7 sont conservés.

### 3. Coffres et pièges — ouverture automatique

**Nouveau déroulement :** annonce « COFFRE » (1,8 seconde, toujours passable au toucher/clic) → ouverture automatique → fenêtre affichant le **butin** ou le **malus du piège**.

- Le bouton « OUVRIR » **n’est plus nécessaire dans le parcours normal**.
- Pas de deuxième annonce bloquante « PIÈGE » : le résultat est révélé dans la fenêtre de malus.
- Les coffres piégés restent indistinguables des coffres normaux avant leur ouverture.
- Les récompenses et les pièges sont appliqués **dans une transaction de sauvegarde unique**, avec vérification de l’état `pending`. Un deuxième déclenchement n’applique pas à nouveau le résultat.
- La reprise d’une ancienne sauvegarde avec un coffre en attente lance aussi l’annonce, puis son ouverture automatique.
- Un bouton « RÉESSAYER » n’est présenté qu’en cas d’échec de sauvegarde pendant l'ouverture, pour ne pas bloquer la progression.
- Aucune modification des probabilités de génération, des valeurs des récompenses ou des pièges.

## Tests effectués

- **10 suites unitaires JavaScript réussies**, dont une nouvelle suite dédiée aux 4 tours du Siphon (expiration et renouvellement sans cumul).
- **7 scénarios Chromium** (PC/mobile) : annonces COMBAT, COFFRE, piège, fermeture automatique en environ 1,8 seconde, bouton « OUVRIR » masqué, fenêtres de résultats directement visibles, clics répétés sans double gain ni double malus, annonce facultativement passable au toucher. **Aucune erreur JS**.
- **4 scénarios Chromium** : musique jouée depuis « Mes parties » et continuant après retour du jeu, reprise d'un coffre ou piège en attente sur 390 et 1440 px. **Aucune erreur JS**.
- **69 contrôles audio et interface Chromium** réussis sur 320, 390 et 1440 px : MP3 décodés et lus réellement, volumes mémorisés, bascule musicale en combat, résumé de combat.
- **28 vérifications Chromium** du quota de trois combattantes par duel réussies.
- **40 vérifications Chromium** de la collection (renommage, tri, suppression, sauvegarde) réussies.
- **14 vérifications Chromium** du bandeau des actions sur deux lignes réussies.
- Interface de choix des morphologies contrôlée sur 320, 390 et 1440 px.

## Compatibilité et installation

- Répertoire complet HTML, CSS, JS, **84 illustrations PNG** et deux MP3 originaux.
- Structure et identifiants de sauvegarde inchangés ; pas d’import ou migration spéciale requis.
- Les tests navigateur ont utilisé Chromium et une simulation de stockage local ; la persistance dans Brave via fichier `file://` n'a pas été vérifiée directement sur la machine de l’utilisateur.
- **Avant installation : exporter les sauvegardes JSON**. Décompresser le ZIP en entier et ouvrir `index.html` depuis le dossier extrait (ne pas copier seulement le fichier HTML).
