# BELLYMON V12.0.18 — Refonte des combats et Hôpital

## Changements effectifs

- **Ordre des actions :** Défense prépare sa réduction de 50 % des dégâts en premier ; les autres actions sont ordonnées par Rapidité effective en combat. Si la Rapidité est égale, l'ordre est aléatoire, sans avantage systématique au joueur. Une combattante mise KO avant son action ne peut pas attaquer et ne paie pas le coût d'une action non exécutée. Les comptes rendus restent présentés en deux lignes « joueur » puis « adversaire ».
- **Énergie :** légère 15 EN ; lourde 15 EN ; spéciale 20 EN ; Défense 0 EN ; capture inchangée 2 EN. La légère inflige Force ×1,0 (au lieu de ×0,8). Autres pouvoirs inchangés.
- **PV persistants :** les pertes de vie survivent à la victoire, à la capture, à l'abandon et à la défaite. Les waifus KO restent à 0 PV. L'énergie des waifus revient à 100 après les combats ; la santé ne se recharge plus automatiquement. La limite de trois combattantes par duel est conservée.
- **Hôpital :** onglet dédié, accessible à l'étage 1. Hors de l'étage 1, il affiche un panneau bloqué indiquant comment revenir. Trois lits maximum en parallèle ; chaque admission restaure la vie après 18 secondes réelles, y compris hors ligne. Les lits sont libérés automatiquement à la fin du soin, sans intervention supplémentaire.
- **Barres de PV :** en collection, sous les informations de chaque waifu, et sur la fiche au-dessus des statistiques. Indicateurs verts, jaunes ou rouges selon le ratio PV restants / PV maximum. Les waifus en cours de soin ne peuvent pas rejoindre un combat.
- **Compatibilité :** stockage IndexedDB/localStorage historique conservé. Les anciennes données sans objet `hospital` sont acceptées ; les convalescences anciennes sont converties dans les trois premiers lits disponibles. Les waifus supplémentaires conservent leur blessure, sans guérison gratuite.
- **Aucun ajout de PV calculés depuis la Constitution** dans cette version : il s'agissait d'une idée toujours à discuter.

## Vérifications

- Contrôles de syntaxe `node --check` de `js/game.js`, `js/combat.js`, `js/hospital.js` et `js/audio.js` : OK.
- **Sept suites JavaScript courantes** : réussite (`bonuses`, `capture_rules`, `evolution`, `message_linebreak`, `rewards`, `v12_0_8_siphon`, `v12_0_18_rules`). La suite V12.0.18 teste 11 groupes couvrant les nouveaux coûts, la légère à ×1,0, les KO selon la vitesse, la priorité Défense, le départage des vitesses égales, les trois lits, les 18 secondes, la migration et les soins sans connexion.
- **37 vérifications ciblées dans Chromium headless**, sur PC (1440 px) et mobile (390 px) : interface, 4 onglets, 3 lits, blocage du 4e, accès interdit aux autres étages, confirmation de retour à l'étage 1, PV conservés après victoire, 3 KO après une défaite avec 2 réservistes indemnes. Aucune erreur JavaScript.
- **Les tests historiques de valeurs antérieures** ont été conservés sous `tests/legacy_before_v12_0_18/`. Ils expriment volontairement d'anciennes règles d'énergie et d'ordre des actions ; ils ne doivent pas être exécutés tels quels pour la V12.0.18.

## Points à garder en tête

- Aucun système de récupération d'énergie *pendant* le combat n'a été ajouté. Avec des attaques coûtant 15 à 20 EN, il peut devenir difficile d'agir lorsqu'un duel dure longtemps ; l'épuisement réciproque produit toujours des dommages de fatigue comme précédemment. Cet équilibrage mérite des tests de jeu réels.
- Pour atteindre l'Hôpital depuis l'étage 2+, le joueur peut abandonner l'ascension en utilisant **Quitter la tour**. Les meilleures performances, waifus, rangs, nourriture et bonus permanents sont conservés ; la blessure aussi.
- Les sauvegardes sont locales au navigateur. Avant le changement de dossier/version, il reste conseillé d'exporter la partie JSON puis de l'importer dans la nouvelle version.
