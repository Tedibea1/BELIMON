# BELLYMON — V5 : rapport de tests

Date : 10 novembre 2026.

## Fonctions ajoutées

- Renommage visible du jeu en **BELLYMON** dans l'onglet du navigateur, le bandeau, le pied de page et les noms des fichiers exportés.
- Attribution automatique des récompenses **après KO de l'ennemie** : E=1 petit gigot, D=2, C=3, B=4, A=5, S=2 petits +2 gros.
- Coffres : **60 %** de chance de 2–4 petits gigots ou **40 %** de 1–2 gros gigots, tirage uniforme à l'intérieur de chaque catégorie.
- **25 %** de chance indépendante qu'un coffre normal contienne également un bonus permanent de collection (Force, Rapidité, Constitution équiprobables). +1 niveau = +2 points pour toutes les waifus présentes et futures. Les détails de la collection de bonus pourront encore être enrichis à la V8.
- Coffres piégés toujours indiscernables avant ouverture, sans récompense. Effets des pièges différés à V9.
- Pop-up de butin visuelle, avec icônes, quantités et bouton **RÉCUPÉRER**.
- Butin accordé **une seule fois** dans la même opération de sauvegarde que l'ouverture/la victoire ; un rechargement ne peut pas distribuer le gain une seconde fois.
- Pop-up non encore validée réaffichée au retour, mais gains déjà enregistrés.
- Compatibilité avec les sauvegardes V1–V4 et leurs clés de stockage historiques ; événements V4 déjà achevés ne donnent pas rétroactivement de butin.

## Tests effectués

| Ensemble | Vérifications | Résultat |
|---|---:|---|
| `node tests/rewards.test.js` | 21 | Réussies |
| `node tests/combat_rules.test.js` | 44 | Réussies |
| `test_v5.py` (Playwright Chromium) | 68 | Réussies |
| `test_v5_regression.py` (parcours V4 adaptés à V5) | 62 | Réussies |
| **Total** | **195** | **Réussies** |

### Exemples de scénarios vérifiés

1. Un coffre ouvert crédite exactement 2 gros gigots, puis affiche une fenêtre centrale.
2. Fermer/recharger le jeu **avant** de confirmer la fenêtre n'accorde pas le butin de nouveau.
3. Confirmer « RÉCUPÉRER » marque uniquement la récompense comme lue.
4. Un coffre normal contenant des petits gigots et un bonus permanent augmente bien les niveaux de collection ; la fiche de waifu affiche le bonus correspondant.
5. Un coffre piégé ne donne aucun objet et annonce le piège après l'ouverture.
6. Une victoire de rang E accorde 1 petit gigot, une victoire de rang S 2 gros et 2 petits.
7. Les victoires affichent leur pop-up, restaurée après rechargement si non confirmée.
8. Un ancien coffre déjà ouvert dans une sauvegarde V4 ne produit aucun butin rétroactif.
9. Le relais en combat, la convalescence et la guérison après 18 secondes, la défaite et les anciennes sauvegardes fonctionnent toujours.
10. Affichage contrôlé à 320, 375, 390, 430, 768 et 1440 pixels sans débordement horizontal.
11. **0 erreur JavaScript** dans les parcours testés.
12. Les 84 PNG de sprites sont présents et mesurent 512 × 512 pixels.

## Limites des tests

Le navigateur de test ne peut pas naviguer sur les fichiers locaux ni sur un serveur de test local. Le DOM/JS/CSS ont donc été chargés dans un document Chromium en mémoire, avec une simulation de `localStorage` ; la persistance réelle via IndexedDB ou `file://` doit être vérifiée sur le PC/téléphone de l'utilisateur. Les probabilités des coffres ont également été vérifiées par 60 000 tirages dans le test unitaire. Les contrôles testent le comportement implémenté, mais n'assurent pas à eux seuls l'absence de tout bug.

## À venir

V6 capture, V7 nourrissage et évolutions, V8 enrichissement du système de collection de bonus, V9 malus de pièges, V10 mode AUTO. Les anciennes fonctionnalités de V1 à V4 sont conservées.
