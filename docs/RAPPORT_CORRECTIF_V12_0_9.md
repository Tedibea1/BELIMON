# BELLYMON V12.0.9 — Griffes fatales renforcées

**Origine :** modification demandée pour rendre la compétence spéciale de la Griffeuse plus marquante face à la puissance de l'Archère arcanique.

## Règle modifiée

- **Avant (V12.0.8) :** Griffes fatales = Force ×0,8 ; coup critique garanti ×2.
- **Maintenant (V12.0.9) :** Griffes fatales = **Force ×1,0 ; coup critique garanti ×3**.
- **Coût inchangé :** 5 énergie.
- **Important :** il s'agit toujours d'une seule attaque, dont les dégâts sont calculés puis multipliés par 3 lorsqu'elle touche. Les protections (Constitution, Défense −50 %) et l'esquive agissent toujours.
- **Portée :** Griffeuses du joueur ET ennemies. Les autres attaques, y compris les critiques ordinaires ×2 et Flèche du cataclysme, sont inchangées.

## Comparaison chiffrée — rang S, aucun bonus externe

Attaquante : Griffeuse musclée S (Force 79, Rapidité 84, Constitution 45, 270 PV). Cible : Bagarreuse obèse S (Force 69, Rapidité 35, Constitution 104, 392 PV).

| Attaque | Sans Défense | Avec Défense |
|---|---:|---:|
| Griffes fatales V12.0.8 | 62 | 31 |
| Griffes fatales V12.0.9 | **117** | **59** |
| Flèche du cataclysme de l'Archère musclée S, non critique | 107 | 54 |
| Flèche du cataclysme de l'Archère musclée S, critique ×2 | 214 | 107 |

Le renforcement théorique brut est de ×1,875 (+87,5 %) avant les arrondis. En pratique, il passe de 31 à 59 dégâts contre la Défense de ce Tank.

## Tests exécutés

- `node tests/v12_0_9_griffes.test.js` — **18 assertions réussies** : défense, esquive, critique garanti, attaque légère normale et critique ×2, Flèche du cataclysme inchangée, compétence ennemie, coût, Siphon conservé.
- `python tests/v12_0_9_griffes_browser.py` — **2 véritables combats Chromium**, 390 px (mobile) et 1 440 px (PC), avec calcul et sauvegarde persistée vérifiés : **59 dégâts**, cible à **333/392 PV**, attaquante à **270/270 PV**, **95 EN**, aucune erreur JavaScript.
- Toutes les **11 suites de tests Node** `tests/*.test.js` passent.
- `python tests/v12_0_8_browser.py` — 4 scénarios Chromium (menu musical et reprise coffre/piège).
- `python tests/audio_banner_browser.py` — **69 contrôles Chromium** aux largeurs 320, 390 et 1440 px, lecture audio réelle et compatibilité du bandeau.

## Ce qui reste inchangé

Aucune modification des statistiques de classe, des rangs, des évolutions, du seuil de 3 waifus en combat, des musiques, du système de sauvegarde ou des 84 sprites PNG. La modification d'une compétence n'exige pas de conversion des sauvegardes.

**Conseil de sauvegarde :** exporter les parties au format JSON avant de changer de version et décompresser toute l'archive (pas seulement `index.html`).
