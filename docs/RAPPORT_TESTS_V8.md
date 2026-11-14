# BELLYMON V8 — Rapport de vérification

Date : 10 novembre 2026.

## Périmètre et changements

La V5 avait déjà mis en place les bonus permanents attribués par certains coffres. La V8 consolide cette mécanique **sans changer ses règles ni rajouter de nouvel écran**.

- Trois catégories persistantes : Force, Rapidité, Constitution ; chaque niveau donne **+2** à toutes les héroïnes de la partie.
- Le calcul est centralisé dans `js/bonuses.js`. Les bonus s'ajoutent **après** les coefficients de rang et les bonus morphologiques et ne modifient pas la statistique personnelle sauvegardée.
- Une nouvelle capture bénéficie immédiatement des niveaux de bonus déjà acquis, même si elle possède le même type de classe qu'une héroïne existante.
- Les trois cartes de l'onglet **Bonus** affichent le niveau courant et la valeur totale ; aucune barre ou nouvel inventaire n'a été ajouté.
- La fiche d'une waifu affiche le total et précise uniquement les bonus de collection **non nuls**.
- Le popup d'un coffre avec bonus indique le **niveau total atteint** et son effet global ; cliquer sur « Récupérer » ne crédite pas une seconde fois le gain.
- La sauvegarde démo `tests/DEMO_BONUS_V8.json` peut être importée sans toucher aux vraies parties.
- Nom du jeu, version, sprites et menus mis à jour pour la V8 ; pas de changement aux combats, au nourrissage, aux taux de loot ni à la capture.

## Vérifications automatisées

| Ensemble de tests | Contrôles réussis |
|---|---:|
| Nouveau moteur des bonus V8 (niveau, stat, classe, rang, morphologie, capture) | 949 |
| Butins V5 | 21 |
| Évolutions et nourrissage V7 (moteur) | 500 |
| Capture V6 (moteur) | 33 |
| Combat V3.1 (moteur) | 44 |
| Parcours Chromium V8 (coffres, popup, sauvegarde simulée, capture, bonus, affichage 320–1440 px) | 44 |
| Régression Chromium V7 (évolutions, sprites, morphologies, combat, responsive) | 75 |
| Chargement/import des anciennes parties V4/V7 | 8 |
| Import de la démo V8 | 4 |
| **Total** | **1 678** |

**Résultat : tous les scénarios ci-dessus réussis ; aucune exception JavaScript de page détectée.**

La liste des 84 sprites PNG et le format de projet à fichiers séparés sont inchangés.

## Limites / vérification utilisateur

Le navigateur automatisé charge le HTML, le CSS et le JavaScript réels en mémoire et **simule le stockage local**. Cela teste les parcours et la cohérence des sauvegardes, mais ne prouve pas la persistance sur le navigateur et le chemin `file://` de l'utilisateur. Une validation manuelle sur son ordinateur ou son téléphone reste à faire.

La V9 concernant les effets des coffres piégés, et la V10 concernant le mode AUTO, **ne sont pas anticipées**.
