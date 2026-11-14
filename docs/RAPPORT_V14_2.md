# BELLYMON V14.2 — Interface boutique et potions

Base: BELLYMON V14.1 avec ses douze classes, 96 sprites supplémentaires et recharge de Récupération.

## Modifications

- Au-dessus de l'étage 1, la boutique affiche un panneau verrouillé et un bouton « Retourner à l'étage 1 », identiques dans leur principe à l'hôpital.
- À l'étage 1, la boutique vend les trois potions, mais n'affiche plus le menu « Mes potions » ni de choix de waifu à soigner.
- Dans la fiche individuelle d'une waifu, les trois potions rejoignent Steak et Gigot, avec quantités en stock.
- Lorsqu'une potion est choisie, le bouton « Nourrir » devient « Utiliser », les contrôles de quantité disparaissent (une potion par utilisation), et l'aperçu indique les PV récupérés.
- Les potions restent consommables hors combat à n'importe quel étage ; aucune utilisation sur waifu KO, hospitalisée ou à PV pleins. Elles ne modifient pas les points d'évolution.
- Les prix, les % de soin, les sauvegardes et l'ensemble des règles de combat restent identiques à V14.1.

## Vérifications

- 74 assertions navigateur Chromium : achats, trois écrans (320/390/1440), fiche, soins, nourriture, sauvegardes et bouton de retour à l'étage 1.
- 21 assertions navigateur Chromium du cooldown de Récupération.
- 11 tests unitaires Boutique, 43 vérifications des compétences V14, 42 tests du cooldown, 108 contrôles des évolutions : réussis.
- Test historique `v12_0_21_shop_browser.py` et sa copie `v14_shop_regression_browser.py` décrivent volontairement l'ancienne interface ; utiliser `tests/v14_2_boutique_waifu_browser.py` pour l'interface actuelle.
