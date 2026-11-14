# BELLYMON V15.2 — Griffes fatales façon Assassinat de Furry RPG V21

- **Test 1 — précision propre à Griffes fatales** : `clamp(50 + 100 × (RAP_attaquant - RAP_cible) / RAP_attaquant, 0, 100)` ; RAP effective (bonus de collection + malus). À RAP=0 contre RAP=0, convention BELLYMON : 50 %, contre RAP>0 : 0 %.
- **Test 2 — esquive ordinaire adverse** : `clamp(floor(RAP_cible / 2), 0, 100)`.
- **Si les deux passent** : dégâts Force ×1,0 et **critique garanti ×2**. Énergie 20.
- Intangibilité du Spectre toujours prioritaire à l'application de dégâts ; pas de changement aux attaques lourdes (précision comparative, Force ×1,5), ni aux critiques/esquives ordinaires.
- Les taux de réussite du premier test et les taux de touche effectifs ne sont pas identiques.

| RAP Griffeuse | RAP cible | Test 1 | Esquive cible | Touche réelle |
|---:|---:|---:|---:|---:|
| 20 | 7 | 100 % | 3 % | 97 % |
| 20 | 10 | 100 % | 5 % | 95 % |
| 20 | 15 | 75 % | 7 % | 69,75 % |
| 20 | 20 | 50 % | 10 % | 45 % |
| 20 | 25 | 25 % | 12 % | 22 % |
| 20 | 30 | 0 % | 15 % | 0 % |

## Validation
- 19 suites de tests JavaScript réussies, dont 16 571 assertions ciblées sur la formule et ses effets, et 1 044 assertions sur les règles critiques/esquives RAP ÷ 2.
- 26 contrôles Chromium sur PC et mobile, zéro erreur JavaScript.
- Simulation automatique : 144 combats terminés sans exception.
- Archives V15.1 et plus anciennes non modifiées.
