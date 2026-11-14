# BELLYMON V14.3 — Tarifs dégressifs de la boutique

Base : V14.2, dont tous les comportements et sauvegardes sont conservés.

| Potion | Soin max. | Coût en steaks | Coût en gigots | Coût par 100 % de soin en steaks |
|---|---:|---:|---:|---:|
| Petite | 30 % | 9 | 3 | 30 |
| Grande | 60 % | 15 | 5 | 25 |
| Suprême | 90 % | 21 | 7 | 23,33 |

Les coûts en steaks sont multiples de trois. La grande et la suprême sont proportionnellement plus rentables. Les prix en gigots sont égaux à un tiers du prix en steaks. Ces ressources conservent leur valeur de nutrition distincte.

L'inventaire déjà acquis reste valable sans conversion ; seuls les prix des nouveaux achats changent.

## Tests exécutés

- 46 assertions Node.js sur les prix, les ressources débitées et l'absence d'achat en cas de fonds insuffisants.
- 11 tests unitaires de la boutique existants (mis à jour pour les tarifs approuvés).
- 92 assertions navigateur Chromium (écrans 320, 390 et 1440 px, affichage des 6 prix, achats, utilisation dans la fiche, sauvegarde, étage 50 et restrictions de combat).
- 43 validations des compétences V14.
- 108 contrôles des évolutions V14.
- 42 validations du cooldown de Récupération V14.1.
- 144 combats automatiques simulés, sans exception JavaScript (143 combats terminés pendant la durée du test).
- 33 tests unitaires de capture réussis.

Les anciens tests navigateur ciblant explicitement l'interface V13 ou le titre V14.2 restent conservés comme historiques ; pour la version actuelle, utiliser le test `v14_3_boutique_waifu_browser.py`.
