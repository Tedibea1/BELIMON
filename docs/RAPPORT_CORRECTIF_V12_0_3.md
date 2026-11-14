# BELLYMON V12.0.3 — Messages de combat sur deux lignes

## Correction
- Le compte-rendu du joueur et les effets supplémentaires de sa compétence restent dans le premier bloc.
- La riposte adverse (ou l’état KO) débute sur la ligne suivante, grâce à un séparateur `\n` explicite.
- Le bandeau affiche les retours à la ligne (`white-space: pre-line`).
- Une capture ratée affiche sa tentative sur la première ligne et la riposte sur la deuxième.
- Aucune formule, statistique, probabilité ou clé de sauvegarde modifiée.

## Tests
- `node tests/message_linebreak.test.js` : 20 assertions réussies (attaque, spéciale, défense, KO, capture réussie/ratée).
- Régression : tous les fichiers `tests/*.test.js` existants passent sous Node.js.
- `python tests/message_linebreak_browser.py` : 14 vérifications réussies dans Chromium sur 390 px et 1440 px, avec un combat réellement déroulé dans l’interface, sans erreur JavaScript ni débordement horizontal.
- Vérification visuelle effectuée sur deux captures d’écran.

## Limites
- Les essais Chromium utilisent une interface chargée en mémoire avec un stockage simulé ; la persistance physique sur le navigateur du joueur n’est pas vérifiée par ce test ciblé.
- Les anciennes sauvegardes sont compatibles : le message de combat existant reste du texte ordinaire et les nouveaux tours sont enregistrés avec le retour à la ligne.
