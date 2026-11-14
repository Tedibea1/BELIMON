# Tour des Waifus — V4 : rapport de vérification

Date : 10 novembre 2026.

## Contenu de la mise à jour

- Relais manuel après KO, réservé à un combat en cours, et uniquement vers une waifu disponible.
- Le chronomètre de 15 secondes et le siphon sont suspendus pendant le choix.
- Les PV, l'énergie et les effets déjà subis par l'ennemie sont conservés lors du relais.
- Les affaiblissements de la waifu KO ne sont pas transmis à sa remplaçante.
- Les waifus KO pendant le combat restent indisponibles **jusqu'à sa conclusion**.
- Après une victoire : les survivantes disponibles récupèrent immédiatement leurs PV et leur énergie ; les waifus KO débutent 18 secondes de convalescence.
- Après 18 secondes réelles, récupération complète des waifus blessées, y compris si l'application a été fermée entre-temps.
- En cas de défaite de toutes les combattantes disponibles : retour à l'étage 1, guérison immédiate, record/collection/nourriture/bonus conservés.
- Indicateur de convalescence dans la collection, sélection d'une blessée interdite.
- Sauvegardes V1–V3.1 prises en charge sans changement de format.
- Fichier `tests/DEMO_RELAIS_V4.json` optionnel pour essayer le relais avant la capture (V6).

## Contrôles automatisés

- **44** contrôles des calculs de combat V3.1 existants : succès.
- **62** contrôles V4 dans Chromium via Playwright : succès.
- **21** contrôles de régression V3.1 adaptés à la V4 : succès.
- **10** contrôles additionnels : import de la démo, guérison au chargement après fermeture, indisponibilité des blessées, sélection d'une autre waifu, succès.
- **Total : 137 vérifications réussies**, aucune erreur JavaScript déclenchée dans les parcours testés.
- Écrans testés à 320, 375, 390, 430 et 1440 px ; absence de débordement horizontal aux tailles explicitement contrôlées.
- **84 images PNG 512×512** : présence et dimensions vérifiées. Règle chétive maintenue : D=C et B=A pour les illustrations.
- Contrôles de syntaxe Node (`node --check`) sur `js/game.js` et `js/combat.js` : réussis.

## Tests particuliers

1. Une épéiste KO déclenche un relais sans démarrer les 18 secondes.
2. La malédiction persistante sur l'adversaire reste en place lors du relais.
3. L'ennemie conserve ses PV et EN ; la combattante suivante conserve ses propres statistiques.
4. Une deuxième KO ne peut pas être réutilisée dans le même combat.
5. La popup de relais se réouvre après chargement de la partie.
6. La dernière waifu gagne : les deux KO commencent leur convalescence simultanément.
7. Les 18 secondes sont terminées : les deux retrouvent PV et EN, même si le joueur est resté sur l'écran de victoire.
8. Plus de combattantes disponibles : fin d'ascension et guérison complète, sans perte de ressources ou de record.
9. Une sauvegarde V3.1 sans `knockedOutIds` ni `injuredUntil` reste lisible.
10. Les coffres V2, l'interface, les bonus et la création/gestion des sauvegardes restent accessibles.

## Limites des vérifications

L'environnement Chromium a bloqué la navigation directe vers des fichiers locaux et un serveur de test local (`ERR_BLOCKED_BY_ADMINISTRATOR`). Les tests de navigateur ont donc été exécutés avec les vrais scripts HTML/CSS/JS chargés en mémoire, avec un **stockage local simulé**. Le fonctionnement des sauvegardes avec le stockage réel sur l'appareil de l'utilisateur doit encore être constaté lors de l'essai manuel.

## Éléments volontairement absents

La capture (V6), les récompenses (V5), le nourrissage (V7), les bonus obtenables (V8), les effets des pièges (V9) et le mode AUTO (V10) ne sont pas ajoutés prématurément.

La V4 conserve le code source séparé, sans emprunt au code de Bellyverse.
