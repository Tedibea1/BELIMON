# Tour des Waifus — Rapport de vérification V1.1

Date : 10 novembre 2026.

## Contrôles validés

- Syntaxe de `js/game.js` : `node --check`, OK.
- **83 vérifications automatisées réussies** par Playwright / Chromium.
- **1 scénario complémentaire réussi** pour une sauvegarde à plusieurs waifus
  (sélection d'une autre héroïne, sauvegarde, rechargement, PV inchangés).
- Création, chargement, suppression et plusieurs parties indépendantes : OK.
- Export JSON et import d'une sauvegarde au format V1 : OK.
- Confirmation de suppression et absence d'écrasement à l'import : OK.
- Trois onglets Tour / Waifus / Bonus actifs et navigables au clavier : OK.
- Onglet Collection, ouverture de fiche, statistiques et inventaire de gigots : OK.
- Vue agrandie du sprite et fermeture des fenêtres par Échap : OK.
- Onglet Bonus calculant `+2 × niveau` : OK.
- 84/84 PNG présents, tous **512 × 512**, lisibles, six classes complètes.
- Contrôle responsive aux largeurs **320, 360, 390, 430, 768 et 1024 px**,
  plus **1470 px** sur ordinateur : pas de débordement horizontal détecté.
- Deux cartes Tour côte à côte aux largeurs testées, y compris 320 px.
- Deux cartes de collection par rangée sur téléphone.
- Fenêtre de fiche intégralement contenue en largeur sur les écrans testés.
- Aucune erreur JavaScript lors des scénarios automatisés.
- Les boutons AVANCER (V2) et NOURRIR (V7) restent volontairement désactivés.

## Limite du banc d'essai

Le navigateur Chromium de cet environnement refuse les navigations directes
vers `file://` et `http://localhost`. Les tests injectent **le vrai HTML, les
vraies feuilles CSS et le vrai JavaScript** en mémoire, ainsi que des sprites
rang E encodés en images locales. Le stockage est simulé en localStorage
pour tester le cycle création → fermeture → reprise. L'API IndexedDB réelle
et la persistance native propre au navigateur de l'utilisateur ne sont donc
pas attestées par ces tests. L'export JSON reste recommandé avant une mise
à niveau du dossier.

L'interface n'implémente PAS encore l'exploration ni les combats : la V1.1
est une étape validable visuellement, pas une version complète du RPG.
