# BELLYMON V14 — Intégration des six classes

## Périmètre
- Nouveau contenu : 6 nouvelles classes + 96 sprites, rencontres dès l’étage 21 et aux étages suivants.
- Rangs : E étages 1 à 20 (6 anciennes uniquement), D 21–40, C 41–60, B 61–80, A 81–100, S 101+.
- Les 6 anciennes classes sont les seuls choix de départ ; les 12 classes sont présentes dans la tour à partir de D.
- Statistiques de base validées, 1 « + » = 10 points, coefficient de rang et morphologies inchangés.
- Les coûts d’énergie restent 20 pour toute spéciale.
- Seul le Spectre a un tour d’indisponibilité avant sa nouvelle frappe.
- Les effets ne se cumulent pas, mais peuvent être renouvelés.
- Les protections immédiates s’appliquent au début du tour commun, même lorsque la waifu est plus lente.

## Coefficients et règles
| Classe | Puissance | Effet |
| --- | --- | --- |
| Vampire | Force ×1,0 | Rend 35 % des dégâts réellement infligés en PV. |
| Spectre | Force ×1,5 | Intangibilité tours d’activation et suivant ; cooldown au 3e tour, revient au 4e. |
| Némésis | — | 40 % des dégâts directs reçus sont renvoyés, pendant 3 tours. |
| Maudite | — | La cible subit 5 % de ses PV max à chaque attaque offensive, pendant 3 tours. |
| Envoûteuse | — | Transfère 20 % de la Force de l'ennemi, pendant 3 tours dès le prochain. |
| Exorciste | — | Retire les malus dissipables ; immunité 2 tours. |

## Vérifications techniques
- 43 assertions unitaires nouvelles compétences ; 108 assertions sur l’évolution des nouveaux personnages ; 144 affrontements simulés avec AUTO.
- 168 contrôles navigateur sur créations, étages 20 / 21 / 41 / 61 / 81 / 101 et 96 assets, ainsi que boutons de spéciales.
- 30 contrôles capture/sauvegarde des six classes.
- 59 assertions navigateur boutique existante et 45 nutrition ; 42 contrôles d’un navigateur pour la récupération.
- Tests unitaires historiques exécutés : bonus, capture, évolution, récompenses, soins, nutrition et boutique.

## Précautions
- Les tests automatisés ne remplacent pas les essais de sensations et équilibre sur parties longues.
- Les points de vie de base de nouvelles classes restent un paramètre à ajuster après retours.
- Les originaux ne sont pas modifiés ni leurs compétences ni leurs chiffres.
