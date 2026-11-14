# BELLYMON V12.0.5 — Gestion de la collection

## Modifications

- Suppression des suffixes automatiques `n°1`, `n°2`, etc. Les doublons conservent leur identifiant unique dans la sauvegarde.
- Noms personnalisés de 1 à 24 caractères, non uniques, modifiables depuis la fiche de waifu.
- Affichage du nom personnalisé dans la collection, la fiche, la carte principale, les fenêtres de choix et le menu de sauvegarde. La classe du personnage reste immuable.
- Tri automatique, purement visuel, par rang décroissant S, A, B, C, D, E, et ordre d'obtention conservé à égalité.
- Bouton Supprimer dans la fiche avec fenêtre de confirmation et bouton Annuler.
- Protection : impossible de supprimer la dernière waifu, de supprimer pendant un combat ou de retirer une capture en attente de validation.
- Si la waifu active est supprimée, sélection d'une autre waifu disponible du rang le plus élevé; aucune waifu inventée.
- Fichiers de sauvegarde précédents compatibles : le champ `nickname` est facultatif; les identifiants historiques, règles et formules du jeu sont conservés.

## Vérifications effectuées

- 40 assertions d'interface Chromium réussies sur PC 1440 px et mobile 390 px. Aucune erreur JavaScript.
- Cas vérifiés : import d'une ancienne structure de sauvegarde, doublons de même classe avec nom identique, renommage et persistance locale simulée, tri décroissant, annulation de suppression, suppression et réaffectation du personnage actif, refus de suppression de la dernière waifu, absence de débordement horizontal.
- Régressions unitaires réussies : combat (44), capture (33), évolution (500), récompenses (21), pièges (894), bonus (949), AUTO (23049), règles V12 (34), retours à la ligne (20).
- Limite : stockage réel IndexedDB de l'appareil de l'utilisateur non testé; l'interface Chromium utilisait un stockage local simulé. Le test supplémentaire sur petit écran de 320 px n'a pas abouti à cause d'un blocage de démarrage Chromium dans la session; non considéré comme validé.

## Installation

Décompresser BELLYMON_V12.0.5.zip et ouvrir `BELLYMON_V12.0.5/index.html` dans un navigateur. Exporter les anciennes parties en JSON puis les importer au besoin. Ne pas effacer une version antérieure sans sauvegarde exportée.
