# BELLYMON V12.0.21 — Boutique de potions

Date : 11 novembre 2026. Base technique : **BELLYMON V12.0.20**, sans changement de combat.

## Réalisation

Nouvel onglet « 🧪 Boutique », avec affichage du stock de nourriture, trois offres de potion et un inventaire persistant. Chaque potion est achetable en steaks **ou** en gigots, sans conversion automatique ni paiement mixte. Les boutons sont bloqués si le stock est insuffisant.

| Potion | Soins | Steaks | Gigots |
|---|---:|---:|---:|
| Petite | +30 % des PV maximum | 9 | 3 |
| Grande | +60 % des PV maximum | 18 | 6 |
| Suprême | +90 % des PV maximum | 30 | 10 |

## Règles implémentées

- Achat exclusivement à l'étage 1 et hors combat.
- Utilisation depuis l'onglet Boutique, à n'importe quel étage hors combat, après sélection d'une waifu.
- La potion augmente les PV en fonction du maximum et sans dépasser ce maximum.
- Un personnage KO, en bonne santé ou déjà hospitalisé ne peut pas recevoir une potion ; impossible de gaspiller un consommable par ces voies.
- L'Hôpital gratuit (trois lits, 18 s), les récompenses, l'AUTO, l'énergie et les combats ne changent pas.
- Stock sauvegardé dans `data.potions`, avec trois propriétés `petite`, `grande`, `supreme` ; absence de cette propriété autorisée pour les anciennes parties V1–V12.0.20. Le module ajoute un stock initial vide lors du premier achat ou à l'import d'une ancienne partie.
- Une même opération achat/soin écrit une seule sauvegarde avec la protection anti-conflit existante. Aucun décompte n'est appliqué si le stockage refuse la sauvegarde.

**Note de conception :** les prix et soins étaient explicitement validés par l'utilisateur. Les restrictions d'accès et d'utilisation viennent des règles précédemment proposées ; elles pourront être discutées et modifiées.

## Tests effectués

- `node tests/v12_0_21_shop.test.js` : **11 groupes réussis** (prix, coût, vol de nourriture interdit, panne de stock, étage, combat, plafonnement des soins, KO, compatibilité anciennes parties).
- `python tests/v12_0_21_shop_browser.py` : **59 assertions Chromium réussies** sur **320, 390, 1440 px**, avec anciennes sauvegardes, achats en deux monnaies, soins de plusieurs waifus, reprise de sauvegarde, restrictions des étages et des combats.
- 9 suites Node.js existantes + nouvelles passées, dont les suites récompenses, évolutions, combat/récupération et capture.
- Captures réalisées à 320, 390 et 1440 px ; aucune erreur de page JavaScript observée lors des tests ciblés.

Ces tests navigateur utilisent un stockage local simulé. Le test sur une véritable origine HTTP/HTTPS a été bloqué par les restrictions réseau de l’environnement de test : **le stockage IndexedDB réel sur l’ordinateur du joueur n’a pas pu être confirmé ici**. Par précaution, exporter les sauvegardes JSON avant d’essayer une nouvelle version.
