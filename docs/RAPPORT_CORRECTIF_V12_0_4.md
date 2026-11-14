# BELLYMON V12.0.4 — Coins des illustrations plus arrondis

## Demande
Masquer les petites zones blanches présentes aux quatre coins des illustrations de waifus, notamment sur l’Occultiste S obèse. Ces pixels appartiennent aux PNG originaux ; il ne s’agit pas d’un bord ajouté par le navigateur.

## Correction
- CSS `css/v12.css` : coins des cadres de portraits arrondis à 14 % de leur taille, avec `overflow: hidden` et image découpée dans le même arrondi.
- Arrondi harmonisé sur les miniatures de collection, la fiche de waifu, les sélections de combattantes et l’aperçu de capture.
- Aucune image source modifiée, aucun changement des combats ou de la sauvegarde ; tous les correctifs V12.0.1 à V12.0.3 sont conservés.

## Vérifications
- Chromium : 20 contrôles ciblés sur quatre largeurs de fenêtre (320, 390, 430, 1440 px), notamment visibilité, arrondi CSS appliqué, absence de débordement et absence d’erreur de page.
- Capture réelle de l’Occultiste obèse rang S dans l’écran de la tour, sur mobile et PC.
- Tests Node réussis : messages du combat (20 assertions), règles V12 (34), combat (44), évolutions (500), captures (33), bonus (949), pièges (894), récompenses (21), mode AUTO (23 049).
- Contrôle SHA-256 : les 84 sprites sont strictement identiques à ceux de V12.0.3.

**Limite :** les vérifications Chromium utilisent un chargement en mémoire et un stockage simulé. Le fonctionnement du stockage réel dans le navigateur de l’utilisateur n’a pas été réévalué ici.
