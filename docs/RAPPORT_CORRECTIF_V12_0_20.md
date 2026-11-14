# BELLYMON V12.0.20 — Noms et valeurs des aliments

**Date : 11 novembre 2026.**

## Nouveautés validées

- **🥩 Steak** : 5 points de nutrition (remplace le petit gigot à 10 points).
- **🍖 Gigot** : 25 points de nutrition (remplace le nom « gros gigot », sans modifier la valeur).
- Les nouveaux noms et émojis apparaissent dans le choix des aliments, les coffres, les récompenses de combat et les notifications de nourrissage.
- Les seuils des rangs, la fréquence et les quantités des récompenses n’ont pas été changés.
- Les anciens stocks et points d’évolution demeurent inchangés ; seuls les futurs nourrissages de steaks rapportent 5 points.
- Le stockage `food.small` / `food.large` est conservé pour les sauvegardes existantes.

## Boutique : idée, pas encore codée

L’idée n° 007 propose d’acheter plus tard des potions de soin avec une valeur commerciale de **3 steaks pour 1 gigot**. Exemple théorique d’une potion à 9 steaks ou 3 gigots : dépense d’aliments représentant **45** ou **75** points d’évolution. Les prix définitifs et les effets de soin restent à discuter.

## Non modifié

- Combat V12.0.19, AUTO, Récupération, classes, PV persistants et hôpital.
- Illustrations, musiques, rangs et sauvegardes.

## Vérifications

- `node tests/evolution.test.js` et les autres suites JS actuelles.
- `python tests/v12_0_20_nutrition_browser.py` : rendu sur 320, 390 et 1440 px, ancienne sauvegarde, quantités et nourrissage.
- Régressions de l’hôpital et du combat.

### Résultats de cette passe de vérification
- **45 assertions Chromium réussies** pour la nutrition et la compatibilité des stocks sur trois largeurs d’écran (320 / 390 / 1440 px).
- **37 vérifications Chromium réussies** pour l’hôpital et les blessures persistantes.
- **8 suites Node.js actuelles réussies**, dont évolution (500 assertions) et récupération d’énergie.
- Une ancienne suite navigateur AUTO a dépassé son délai de test lors de cette passe ; aucun nouvel échec fonctionnel démontré. Le moteur AUTO / Récupération n’a pas été modifié depuis V12.0.19.

### Résultats de cette passe de vérification
- **45 assertions Chromium réussies** pour la nutrition et la compatibilité des stocks sur trois largeurs d’écran (320 / 390 / 1440 px).
- **37 vérifications Chromium réussies** pour l’hôpital et les blessures persistantes.
- **8 suites Node.js actuelles réussies**, dont évolution (500 assertions) et récupération d’énergie.
- Une ancienne suite navigateur AUTO a dépassé son délai de test lors de cette passe ; aucun nouvel échec fonctionnel démontré. Le moteur AUTO / Récupération n’a pas été modifié depuis V12.0.19.
