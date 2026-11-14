# BELLYMON — Cahier d'idées

**Créé le :** 10 novembre 2026  
**Mis à jour le :** 11 novembre 2026  
**État :** dix idées suivies : idées 002 et 006 mises en œuvre ; huit pistes encore non implémentées. Les idées 008 et 009 sont des propositions de contenu et de création de partie, non approuvées pour codage ; indicateur de décision adverse réalisé en V12.0.13  
**Version du jeu au moment de la création :** V12.0.6

---

## Idée 001 — Phase 2 des adversaires : les enchaînements du joueur

**Une seule idée, avec deux parties indissociables :** lorsqu'une waifu ennemie atteint **50 % de ses PV ou moins**, elle passe en **phase 2** et commence à se battre selon **un enchaînement précis fourni par le joueur pour sa classe**.

- Avant le seuil, l'adversaire conserve son comportement de combat habituel.
- Dès que ses PV atteignent **50 % ou moins**, la phase 2 se déclenche.
- **En phase 2, chaque classe ennemie suit le combo / la séquence d'actions que le joueur expliquera à Edith** : dans l'ordre et selon la logique qu'il utilise lui-même lorsqu'il joue cette classe.
- Le but est de rendre l'adversaire plus difficile à combattre **par ses choix d'actions et son enchaînement**, et non par un bonus de statistiques arbitraire (aucun bonus chiffré n'a été demandé ni décidé).
- Le joueur expliquera séparément sa manière de jouer **pour chacune des six classes** (Épéiste, Bagarreuse, Archère arcanique, Occultiste, Prêtresse et Griffeuse). Les séquences seront alors transcrites dans le comportement de leur IA en phase 2.
- **Aucun apprentissage automatique :** l'IA ne doit **pas** surveiller, enregistrer ou analyser les habitudes du joueur, ni chercher à le contrer. Elle exécute simplement **les séquences prédéfinies que le joueur aura enseignées**.
- Il ne s'agit **pas** d'une IA qui devine les coups de l'adversaire, ni d'une IA adaptative.

**À définir ensemble avant de coder :** les six enchaînements exacts ; leur éventuelle répétition ; le comportement à adopter si une action est impossible (énergie insuffisante, compétence indisponible, etc.) ; la façon d'annoncer visuellement la phase 2. Ne rien supposer ni inventer en attendant les explications du joueur.

**Statut :** idée désormais prioritaire à discuter ; **la phase 2 et les combos ne sont pas encore implémentés**. Les six séquences précises restent indispensables.

**Interface liée, livrée en V12.0.13 :** pendant la courte décision adverse, BELLYMON affiche « L’adversaire choisit son action… » avec un indicateur tournant. Cela ne constitue **pas** la phase 2 et ne change pas le comportement de l’IA. Aucun apprentissage automatique.

## Idée 002 — Malédiction abyssale : progression en secondes et renouvellement (Occultiste)

**Statut : RÉALISÉE dans BELLYMON V12.0.10, le 10 novembre 2026.**

Le joueur a précisé puis validé les règles suivantes, maintenant codées :

- **−2 % par seconde de combat active** sur les trois statistiques (Force, Rapidité, Constitution), jusqu’à **−50 % maximum**.
- **Durée : 5 tours**, en comptant le tour d’incantation (durée de la compétence avant la mise à jour).
- **Aucun cooldown** : relançable dès que les 5 points d’énergie nécessaires sont disponibles.
- **Non cumulable avec elle-même :** la relance renouvelle la durée à 5 tours sans ajouter de malédiction supplémentaire et **sans perdre l’affaiblissement déjà accumulé**.
- Le temps ne progresse pas lorsque le combat est suspendu (fenêtre d’effets ouverte, onglet masqué, jeu fermé), comme pour le Siphon de la Bagarreuse.
- La réduction repart à 0 % seulement lorsque l’ancienne malédiction a expiré et qu’une nouvelle est lancée.

**Également modifié dans V12.0.10 :** le Siphon d’énergie de la Bagarreuse passe de **−1 à −2 énergies par seconde active**. Sa durée reste de 4 tours, avec relance sans cumul.

Les anciennes pistes de cadence par paliers de −10 % toutes les 5 ou 10 secondes ont été **remplacées** par la décision explicite de **−2 % toutes les secondes** ; elles ne sont plus en attente de choix.

## Idée 003 — Ajouter des husbandos et choisir le type de personnages à la création d’une partie

**Proposition du joueur :** enrichir BELLYMON avec des **husbandos** (personnages masculins), en plus des **waifus** (personnages féminins), puis proposer à la création d’une nouvelle partie un choix entre **trois préférences** :

- **Waifus** : jouer avec des personnages féminins.
- **Husbandos** : jouer avec des personnages masculins.
- **Les deux** : permettre la présence de waifus et d’husbandos dans une même partie, pour les joueurs qui apprécient les deux.

**Intention :** laisser chacun choisir le type de personnages qu’il souhaite collectionner et utiliser, sans imposer une seule option à tout le monde.

**À définir ensemble avant de coder :** les visuels et les personnages masculins ; leur éventuel lien avec les six classes existantes ; la composition de la sélection de départ ; la présence de waifus et/ou husbandos chez les adversaires et dans les captures selon l’option choisie ; la manière dont ce choix est conservé dans les sauvegardes ; la compatibilité des anciennes parties. Aucun de ces détails n’est encore arrêté.

**Statut :** idée ajoutée au carnet ; **aucune modification du jeu pour l’instant**.

## Idée 004 — La Constitution pourrait augmenter les PV maximum

**Proposition à étudier, non validée :** actuellement, la Constitution réduit les dégâts subis même lorsque la waifu ne choisit pas « Défense », mais ne contribue pas à ses PV maximum. Le joueur trouve que les Tanks peuvent perdre leurs PV trop rapidement face aux gros dégâts (en particulier Flèche du cataclysme) et propose **d'intégrer la Constitution dans le calcul des PV maximum**.

- À discuter : coefficient exact / formule, pour que les Tanks résistent davantage sans rendre toutes les classes trop robustes.
- Une hausse de PV liée à la Constitution s'ajouterait à la réduction de dégâts déjà assurée par cette stat : vérifier le double effet sur l'équilibrage.
- Penser aux bonus permanents de Constitution, aux rangs, aux malus temporaires et aux anciennes sauvegardes si une formule est approuvée.
- **Aucune formule ni valeur numérique n'est encore approuvée. Aucun changement des PV en V12.0.12.**

**Statut :** idée à discuter, **pas à coder sans décision explicite**.

---

## Idée 005 — Cooldowns sur les sorts spéciaux : piste alternative ou complémentaire à la phase 2

**Nouvelle réflexion du joueur (11 novembre 2026), non validée pour le code :** envisager des **temps de recharge (cooldowns)** sur les compétences spéciales afin de limiter le spam des sorts.

- Le joueur hésite : **chaque classe ne dispose que d’un seul sort qui lui est propre**. Un cooldown pourrait donc retirer beaucoup de personnalité ou de choix aux personnages, sans apporter à lui seul plus de profondeur.
- Les ennemies utilisent encore leur IA ordinaire, perçue comme peu stratégique. **La phase 2 à 50 % des PV avec les enchaînements prédéfinis du joueur** reste une autre piste forte pour rendre les combats plus vivants.
- **Aucune décision prise** entre cooldowns, phase 2, ou combinaison des deux. Ne pas supprimer ni remplacer la phase 2 dans le cahier tant que le joueur n'a pas choisi.
- À discuter : quels sorts seraient concernés, durée éventuelle des cooldowns, impact sur les relances des effets comme Absorption et Malédiction abyssale, et sur les choix disponibles lorsque l’énergie manque.

**Statut :** à discuter lors de la prochaine séance ; **aucune modification du jeu**.

## Idée 006 — Ordre des actions : avantage de la première attaque

**Mise à jour : réalisée en V12.0.18.** Le passage ci-dessous conserve l’observation historique qui avait motivé ce changement.

**Observation du joueur (11 novembre 2026) :** les actions du personnage joueur semblent se résoudre **avant celles de l’ennemie** ; le joueur peut ainsi mettre l’ennemie KO en un coup avant qu’elle ne puisse agir, même si elle avait choisi une attaque.

- Le moteur actuel applique effectivement l’action du joueur avant celle de l’ennemie pendant la résolution du tour. Il faut étudier si cet avantage est souhaitable.
- À discuter : priorité basée sur la Rapidité, départage en cas d’égalité, ou autre règle ; conséquences sur la Défense, les soins, les KO et les combos de phase 2.
- **Aucune nouvelle règle d’initiative n’est validée.** Ne rien changer sans accord.

**Statut actuel :** **implémentée en V12.0.18** : la Rapidité décide de l’ordre des attaques ; la Défense passe en priorité ; égalité de Rapidité départagée aléatoirement.

## Idée 007 — Boutique de potions de soin contre des steaks et des gigots

**Proposition du joueur (11 novembre 2026), boutique implémentée en V12.0.21.** Ajouter une **boutique** dans BELLYMON où le joueur pourrait obtenir des **potions de soin** contre sa nourriture, au lieu de consacrer tous ses aliments à l'évolution des waifus.

**Économie alimentaire revue et codée en V12.0.20 :**
- **🥩 Steak** (ancien « petit gigot ») : **5 points d'évolution** par unité. Nourriture relativement courante.
- **🍖 Gigot** (ancien « gros gigot ») : **25 points d'évolution** par unité. Nourriture rare.
- Les quantités d'aliments récoltées, les seuils d'évolution E→S et les probabilités de butin **ne changent pas** dans cette mise à jour.
- Les identifiants de sauvegarde `food.small` et `food.large` restent inchangés, pour reprendre les anciennes parties sans perdre la nourriture acquise. La nouvelle valeur d'un steak s'applique aux futurs nourrissages, pas rétroactivement aux points déjà gagnés.

**Équivalence commerciale validée via la grille de prix des potions :** **1 gigot paie comme 3 steaks** en boutique (et non en nutrition, où il vaut 5 steaks). Exemple avec une petite potion :
- **9 steaks** : 9 × 5 = **45 points d'évolution sacrifiés** ;
- **3 gigots** : 3 × 25 = **75 points d'évolution sacrifiés**.

**Dilemme visé :** comme le gigot est rare et vaut **cinq steaks en nourrissage**, mais seulement **trois steaks en boutique**, le joueur doit réfléchir avant d'en dépenser. Garder ses aliments accélère l'évolution ; les échanger contre des soins permet de prolonger une ascension difficile.

### 🧪 Boutique : trois potions de soin — prix et puissances VALIDÉS par le joueur le 11 novembre 2026

**La boutique ne vend que des potions**, pas d’armes, d’équipement ni d’autres marchandises, pour cette première version.

| Potion | Restauration de PV | Prix en 🥩 steaks | Prix en 🍖 gigots |
|---|---:|---:|---:|
| 🧪 **Petite potion** | **+30 % des PV maximum** | **9** | **3** |
| 🧪 **Grande potion** | **+60 % des PV maximum** | **18** | **6** |
| 💎 **Potion suprême** | **+90 % des PV maximum** | **30** | **10** |

**Important :** le joueur a validé expressément les trois prix ci-dessus, puis corrigé la potion suprême de 100 % à **90 %**. Ces potions **rendent** un pourcentage des PV maximum, sans pouvoir dépasser le maximum. Une suprême peut ainsi aboutir à la vie pleine sur un personnage déjà partiellement soigné ; elle ne restaure pas systématiquement 100 % depuis 0 PV. Ne pas confondre soin de +90 % avec « définir les PV actuels à 90 % ».

**Sacrifice de nourriture (nutrition perdue) :** petite = 45 pts si payée en steaks / 75 pts si payée en gigots ; grande = 90 / 150 ; suprême = 150 / 250. Il s’agit de valeurs stratégiques, non d’une conversion librement négociable de gigots en steaks. **Tarifs de paiement fixes** selon chaque potion ; paiement mixte éventuel non décidé.

**Choix techniques réalisés en V12.0.21 (modifiables plus tard) :** acheter uniquement à l’étage 1 et hors combat ; utiliser hors combat à tous les étages ; stock de potions persistant par sauvegarde ; soin d’une waifu consciente et non hospitalisée uniquement ; aucun paiement mixte ; hôpital gratuit à trois lits inchangé. Ces modalités suivent les propositions précédentes mais seul le tarif et le pourcentage de soin ont fait l’objet d’une validation chiffrée explicite.


**Statut :** nourritures implémentées en V12.0.20, **boutique de trois potions codée et testée en V12.0.21**. Les règles d’accès et d’utilisation pourront être réajustées après retour de jeu.

## Idée 008 — Passer de 6 à au moins 18 personnages : variantes de classes et nouveaux pouvoirs

**Précision du joueur (11 novembre 2026), non implémentée :** atteindre **au moins 18 personnages collectionnables**. Le joueur **accepte tout à fait le recyclage et les variantes d’une même classe**, y compris les mélanges de spécialités déjà existantes : **il ne demande pas 18 archétypes complètement inédits**. Son problème de conception est surtout de savoir comment donner suffisamment de capacités à chaque variante, car chaque waifu n'a actuellement **qu'une seule compétence spéciale active**. Copier des statistiques, costumes, classe et morphologies pour créer des déclinaisons est envisageable si l'identité de gameplay est compréhensible.

### Correspondance exacte des six personnages actuels

- **Griffeuse = Assassine.**
- **Épéiste = Guerrière.**
- **Bagarreuse = Tank.** Sa capacité **Absorption** draine l'énergie adverse et lui permet de gagner à l'usure.
- **Occultiste = Sorcière** (malédictions / malus).
- **Archère arcanique = Mage** (dégâts magiques).
- **Prêtresse = Healer / soigneuse**.

Il s'agit de **rôles et sous-spécialités** ; les morphologies **musclée, obèse et chétive** forment un autre axe de progression et ne remplacent pas ces profils. Plusieurs waifus peuvent appartenir à une même classe avec une répartition différente de Force, Rapidité, Constitution et capacités.

### Déclinaisons souhaitées ou envisagées

- **Assassine Force :** grosses frappes, moins rapide. La Force n'est pas un sort ; ses statistiques et coefficients devraient exprimer le profil.
- **Assassine Rapidité :** frappe moins fort, mais bénéficie d'une meilleure initiative, de plus d'esquives et/ou de critiques. Équilibrage des esquives à étudier car le jeu a déjà des probabilités de combat.
- **Assassine Berserk :** sans domination innée en Force ni Rapidité, mais se blesse en attaquant (exemple du joueur : **environ 10 % de PV perdus**, valeur non validée) et **gagne de la puissance** à mesure qu'elle perd de la vie. À décider : coût en PV sur les attaques ou sur la seule spéciale ; bonus selon la vie manquante ou cumul de blessures ; risque de KO ; prévention des abus avec les PV persistants.
- **Guerrière Force :** spécialiste des dégâts élevés, variante possible de l'Épéiste.
- **Guerrière Berserk :** guerrière plus dangereuse à faible PV, selon une règle à définir.
- **Tank classique :** Bagarreuse actuelle, encaisse et affaiblit l'ennemi en lui vidant progressivement son énergie.
- **Tank Berserk :** tank offensif qui inflige davantage de dégâts lorsqu'il a perdu des PV, plutôt que de drainer l'énergie.
- **Mage Puissance :** profil proche de l'Archère arcanique actuelle ; forts dégâts magiques.
- **Mage Rapidité :** dégâts plus modestes, mais plus rapide et/ou plus difficile à toucher.
- **Mage à malus :** proposition de mélange Mage / Sorcière, avec dégâts plus modestes contre un affaiblissement adverse.
- **Sorcière aux clones :** invoque un double pour encaisser les coups ; malédiction différente ou moins puissante que l'Occultiste actuelle. Le clonage peut aussi concerner d'autres classes.
- **Healer aux clones :** soigneuse capable de produire un clone protecteur tout en gardant une possibilité de se soigner. Problème majeur : cela semble réclamer **deux capacités distinctes**, à moins qu'une seule capacité ait plusieurs effets ou qu'un effet soit passif.
- **Healer drainante :** combinaison soins et vol d'énergie, en prenant soin de ne pas donner gratuitement toutes les forces de la Prêtresse et de la Bagarreuse.
- **Vampire :** personnage qui **vole des PV**, se soigne lorsqu'il inflige des dégâts. À distinguer de l'Absorption qui vole de l'**énergie**.
- **Autres variantes de Guerrière / Mage / Sorcière / Soigneuse :** à inventer plus tard. La liste ci-dessus **n'est ni le roster final ni une commande de création de 12 personnages**.

### Vrai problème à résoudre : un seul emplacement de compétence spéciale

Le joueur **ne rejette pas les personnages recyclés ou hybrides**. Il veut savoir **comment combiner deux effets actifs** quand un personnage a besoin, par exemple, de **créer un clone ET de se soigner**. Il a envisagé de **remplacer l'Attaque lourde par une autre technique** ou de disposer de **plus d'une compétence spéciale**, mais n'a validé aucune de ces modifications. Créer un clone à chaque tour pourrait être beaucoup trop fort : une limitation devra être prévue.

**Solutions possibles à discuter (suggestions, aucune approuvée) :**

1. **Une spéciale + une mécanique passive** : ex. les PV manquants augmentent naturellement les dégâts du Berserk ; sa spéciale reste un coup particulier. Ainsi l'effet berserk ne consomme pas un deuxième bouton.
2. **Une spéciale à plusieurs effets** : ex. invoquer un clone qui protège immédiatement et permet de récupérer un peu de vie au fil des tours. Les effets seraient unifiés et équilibrés, pas deux actions gratuites indépendantes.
3. **Deux compétences actives pour certaines variantes**, par exemple en remplaçant l'Attaque lourde par une **Technique** propre au personnage, tout en conservant l'Attaque légère, Défense, Récupération, Capture et AUTO. Attention : ce changement est structurel et doit être débattu avant tout codage.
4. **Deux compétences spéciales accessibles séparément**, avec chacune un coût en énergie, sans pouvoir en utiliser deux dans un même tour. Possibilité à comparer avec l'option 3 ; aucun nouveau bouton n'est approuvé.

**Référence comparative :** *Loomian Legacy* permet à chaque Loomian d'avoir jusqu'à **quatre capacités équipées** (attaque physique, attaque à distance ou soutien), plus les actions génériques d'attente et de récupération d'énergie. Les catégories de capacités ne correspondent pas au sens « une ultime par personnage » de BELLYMON. À discuter si cette inspiration est utile ; il ne s'agit pas de recopier son interface ni son équilibrage.

**Questions avant codage :** spécialités exactes, coûts/risques, règles du clone, fonctionnement de l'esquive, capacités passives, différence entre variantes et morphologies, nombre de compétences accessibles, incidence sur AUTO et l'IA adverse, équilibrage des soins et PV persistants, illustrations et progression des nouvelles waifus.

**Statut :** projet d'extension à 18 personnages avec **réutilisation des six classes et des mécaniques acceptée et même souhaitée**. **Aucune nouvelle classe, personnage, spéciale ou touche de combat n'est validée pour le code.**

## Idée 009 — Choix des personnages de départ : 3 ou 6 propositions

**Proposition du joueur (11 novembre 2026), à trancher ultérieurement.** Quand une nouvelle partie commence, le joueur choisit actuellement l'une des six héroïnes/classes existantes. Avec l'objectif d'au moins 18 personnages collectionnables, envisager deux formats pour les **starters** :

- **Option A : trois personnages proposés au début**, à la manière d'un choix de starters Pokémon. L'intérêt serait de donner un choix lisible, faire découvrir les autres spécialités par la capture et rendre les parties initiales différentes. Les **trois profils exacts ne sont pas sélectionnés** ; aucun système de types Feu/Eau/Plante imposé.
- **Option B : conserver les six personnages de départ au choix**, pour laisser immédiatement chaque joueur démarrer avec sa classe favorite. Les nouvelles waifus supplémentaires pourraient ensuite être rencontrées et capturées.

**Indépendant de l'idée 003 :** la sélection du nombre de starters ne tranche pas le choix futur entre « waifus », « husbandos » et « les deux ». Ces deux décisions doivent rester compatibles si les personnages masculins sont ajoutés.

**Questions ouvertes :** trois ou six choix ; les trois seraient-ils fixes ou variables ; faut-il réserver certains personnages à la capture ; comment garantir l'équilibre entre DPS, Tank et soin ; préserver le choix actuel pour les anciennes sauvegardes ; présentation des starters et tutoriel ; liens avec les classes et morphologies.

**Statut :** **aucune préférence ni liste officielle validée**. Le joueur a demandé de conserver **les deux options** pour en reparler ; aucun changement du menu de création.

## Idée 010 — Trois qualités de personnages selon leurs compétences spéciales

**Concept proposé par le joueur (11 novembre 2026), à approfondir — NON implémenté.** Répartir les waifus en **trois qualités**, sans confondre qualité, classe, rang E→S et branche morphologique. Une qualité supérieure peut donner **davantage de possibilités ou de potentiel** : toutes les waifus n'ont pas besoin d'être équivalentes à rang identique. Le joueur accepte le **recyclage des classes et des mécaniques** pour créer des variantes, y compris des personnages plus puissants rencontrés et capturés plus haut dans la tour.

### Répartition envisagée des trois emplacements offensifs/techniques

| Qualité provisoire | Attaque légère | Attaque lourde | Compétence spéciale | Total de spéciales |
|---|---|---|---|---:|
| **Classique** | Conservée | Conservée | 1 spéciale propre au personnage | **1** |
| **Avancée** | Conservée | **Remplacée par une 2ᵉ spéciale** | 1ʳᵉ spéciale | **2** |
| **Supérieure** | **Remplacée par une 3ᵉ spéciale** | **Remplacée par une 2ᵉ spéciale** | 1ʳᵉ spéciale | **3** |

- **Défense, Récupération d'énergie, Capture et AUTO** restent les commandes communes hors de ces trois emplacements ; le projet vise à **recycler l'interface existante**, sans multiplier les boutons.
- Les **six héroïnes actuelles** constitueraient la référence de la qualité **classique** et conserveraient leur seule compétence spéciale.
- Un personnage de qualité classique **peut aussi être capturable seulement dans la tour** : la qualité ne définit pas automatiquement l'accès au choix initial.
- Les nouvelles waifus avancées/supérieures pourraient apparaître davantage vers les étages élevés, encourageant la collection et le renouvellement de l'équipe, **sans que les fréquences exactes soient fixées**.
- Une meilleure qualité **n'est pas automatiquement un rang S**, ni une garantie de battre un personnage classique de rang S : les trois axes **qualité / rang / classe-morphologie** restent distincts.
- Davantage de spéciales **n'implique pas plusieurs actions par tour**. Chaque capacité aurait son propre coût/risque, à définir ; il faudrait étudier la perte de l'attaque légère ou lourde et le comportement d'AUTO et de l'IA.

### Exemples de personnages envisagés : notes du joueur, sans validation des chiffres

- **Sorcière avancée (2 spéciales)** : **Clone d'ombre**, qui reçoit des dégâts à la place de la sorcière ; **Malédiction / malus**, suivant le principe de l'Occultiste existante. Le sort exact de malus n'est pas encore choisi.
- **Sorcière supérieure (3 spéciales)** : **Clone d'ombre + deux sorts distincts d'affaiblissement**. Les deux malus, leur cumul et leur puissance sont encore à inventer.
- **Assassine furtive (qualité non tranchée)** : attaque immédiatement lors de l'activation d'une **invisibilité temporaire** ; pendant un temps envisagé de **1 à 3 tours**, l'ennemi ne pourrait pas la toucher alors qu'elle peut continuer à attaquer. **Concept à équilibrer impérativement** : trois tours d'immunité totale aux attaques sans contrepartie risquent d'être trop puissants ; durée, ciblage, coût, limite de réutilisation, attaques de zone ou autres contre-mesures restent ouverts. Ne pas coder l'invulnérabilité telle quelle avant validation.
- **Mage mobile (qualité non tranchée)** : combine une **forte attaque magique** et des capacités d'**esquive/rapidité** ; la manière de l'exprimer (statistiques, passive ou compétence active) est à choisir.
- **Vampire classique, non proposée au départ** : **une seule compétence spéciale « Vampirisation »** ; attaque et **récupère une fraction des dégâts réellement infligés sous forme de PV**. Personnage **accessible par capture**, pas dans la sélection initiale. Pourcentage de vol de vie, stats, classe exacte et interaction avec les PV persistants restent à définir.
- Les profils déjà évoqués dans l'idée 008 (**Assassine Force/Rapidité/Berserk, Guerrière Force/Berserk, Tank Berserk, variantes de soigneur/mage**) restent des **brouillons ouverts**, pas des personnages finalisés.

### Priorité du projet explicitement fixée par le joueur

**D'abord terminer, stabiliser et équilibrer les mécaniques actuelles de BELLYMON** (combats, progression, capture, soins, économie, IA, etc.). **Ensuite seulement** passer à la création des nouvelles waifus, à leurs compétences, statistiques, sprites et éventuelles qualités. Ne pas commencer une refonte du système de combat ou la production des 18 personnages sur la base de ces seules notes.

**Statut :** piste de conception documentée ; **aucune mécanique ni nouveau personnage validé pour codage**. Les termes « classique », « avancée » et « supérieure » sont provisoires.

## Idée 011 — Banque de compétences spéciales (30 propositions, sans attribution)

**Séance d’idéation du 11 novembre 2026 — aucun effet ni chiffre approuvé pour le code.** Avant d’attribuer des sorts aux futures waifus (classiques à une spéciale, avancées à deux, supérieures à trois), inventer **un catalogue de mécaniques spéciales**. Ces capacités pourront ensuite être affectées à une classe, à un nouveau personnage ou combinées pour créer des profils hybrides. Le « recyclage » de compétences est **autorisé et même souhaité**. Une compétence spéciale n’a pas besoin d’infliger des dégâts.

**Les six spéciales actuelles servent de référence et restent inchangées :** coup critique garanti de la Griffeuse, Punition frénétique de l’Épéiste, Absorption de la Bagarreuse, grande attaque magique de l’Archère, Malédiction de l’Occultiste, Soin de la Prêtresse. N’ajouter aucune des capacités ci-dessous dans les six personnages existants sans nouvelle décision.

### 30 pistes nouvelles (noms de travail)

| # | Compétence | Mécanique à explorer |
|---:|---|---|
| 1 | **Sacrifice sanglant** | Sacrifie une fraction des PV maximum pour porter une attaque particulièrement puissante. |
| 2 | **Vampirisation** | Inflige des dégâts et récupère une fraction des dégâts réellement infligés en PV. |
| 3 | **Clone d’ombre** | Invoque un clone qui encaisse des attaques à la place du porteur, jusqu’à disparition. |
| 4 | **Frappe spectrale** | Inflige des dégâts immédiatement puis offre une protection temporaire par esquives limitées (charges et durée à équilibrer). |
| 5 | **Surpuissance** | Augmente temporairement les dégâts infligés, par exemple pendant trois tours. |
| 6 | **Accélération** | Augmente temporairement Rapidité et chance d’esquive. |
| 7 | **Brûlure** | Inflige des dégâts puis des dégâts supplémentaires sur plusieurs tours. |
| 8 | **Empoisonnement** | Applique des dégâts périodiques à l’adversaire. |
| 9 | **Barrière magique** | Absorbe une quantité limitée de dégâts via un bouclier. |
| 10 | **Miroir magique** | Renvoie temporairement une partie des dégâts subis. |
| 11 | **Contre-attaque** | Adopte une garde et riposte si l’adversaire attaque. |
| 12 | **Brise-armure** | Frappe et diminue temporairement la Résistance de la cible. |
| 13 | **Désorientation** | Diminue temporairement la précision de la cible. |
| 14 | **Gel** | Ralentit temporairement l’adversaire. |
| 15 | **Silence** | Empêche temporairement les compétences spéciales adverses, sous réserve d’équilibrage. |
| 16 | **Régénération** | Rend des PV sur plusieurs tours. |
| 17 | **Exécution** | Inflige davantage de dégâts aux cibles déjà gravement blessées. |
| 18 | **Dernier souffle** | Plus le porteur est blessé, plus cette compétence frappe fort. |
| 19 | **Surcharge énergétique** | Dépense beaucoup d’énergie pour une attaque de forte puissance. |
| 20 | **Malédiction du sang** | Pénalise les attaques offensives adverses par une perte de PV. |
| 21 | **Marque du chasseur** | Marque l’ennemi pour augmenter les dégâts des prochaines attaques. |
| 22 | **Vol de puissance** | Affaiblit temporairement la Force de la cible et renforce celle du porteur. |
| 23 | **Purification** | Supprime certains effets négatifs subis par le porteur. |
| 24 | **Forteresse** | Réduit fortement les dégâts reçus, au prix d’une baisse des dégâts infligés. |
| 25 | **Frénésie** | Augmente progressivement les dégâts sur une série d’attaques réussies, jusqu’à un plafond. |
| 26 | **Double frappe** | Enchaîne deux frappes plus faibles, avec deux occasions de toucher. |
| 27 | **Parade parfaite** | Bloque ou réduit une attaque et rend éventuellement de l’énergie. |
| 28 | **Pacte interdit** | Transforme une fraction des PV du porteur en énergie. |
| 29 | **Prémonition** | Aide à éviter une prochaine attaque ciblée. |
| 30 | **Résurrection** | Une fois par combat, résiste à un coup fatal en conservant quelques PV, si la règle est validée. |

**Compétences particulièrement demandées par le joueur :** sacrifice de PV pour frapper/accroître la puissance ; vampirisation et soin proportionnel aux dégâts ; clone encaissant les coups ; furtivité avec attaque immédiate et esquives sur plusieurs coups/tours ; bonus de Force d’environ 20 % pendant environ trois tours. Tous ces chiffres ne sont **que des illustrations**.

**Précautions d’équilibrage avant toute implémentation :** distinguer bonus passif et action active ; définir coût en énergie, coût en PV, durée, cumul et fin des effets, esquives garanties ou probabilistes, risque des immunités longues, soin après KO, effets de silence, précision, éléments et statut dans la formule de combat actuelle. Les futures combinaisons ne doivent pas permettre des boucles de soins ou de protection infinies. **On ne touche pas aux mécaniques validées du jeu avant de les finir et de les tester.**

**Statut :** bibliothèque de **propositions**, zéro compétence ajoutée au jeu ; affectation aux waifus et fusions à travailler plus tard, après stabilisation du gameplay.

## Notes de suivi

- **Onze idées consignées :** 001 phase 2 avec enchaînements propres à chaque classe ; 002 Malédiction abyssale (réalisée) ; 003 choix waifus/husbandos ; 004 hypothèse Constitution et PV ; 005 cooldowns éventuels ; 006 initiative selon Rapidité (réalisée en V12.0.18) ; 007 boutique exclusivement de trois potions (réalisée en V12.0.21, prix et soins approuvés le 11/11/2026) ; 008 au moins 18 personnages, dont des variantes/recyclages assumés des six classes, avec débat sur le nombre de spéciales (à concevoir) ; 009 trois ou six starters (à décider) ; 010 trois qualités à 1/2/3 spéciales et concepts Sorcières à clones, Assassine furtive, Mage mobile, Vampire classique capturable (à concevoir, après stabilisation du jeu) ; 011 banque de 30 compétences spéciales proposées, sans attribution ni codage.
- **Implémenté depuis les premières notes :** depuis V12.0.18, la waifu la plus rapide agit d'abord (égalité départagée aléatoirement), et Défense est prioritaire ; l'Hôpital à trois lits a aussi été ajouté. Depuis V12.0.19, l'action Récupération d'énergie existe. Les anciennes observations de l'idée 006 décrivaient une version antérieure du jeu, et non le fonctionnement actuel.
- **Le Siphon d'énergie a été renommé « Absorption » en V12.0.17**, et son drainage actuel est **−3 EN/seconde** pour quatre tours. Les coûts actuels des attaques légères, lourdes et spéciales sont respectivement 15, 15 et 20 EN.
- Les idées encore en discussion restent **non approuvées pour le codage**. La boutique est intégrée en V12.0.21 avec les soins approuvés (30/60/90 %) et les prix approuvés (9/18/30 steaks ou 3/6/10 gigots). Les détails d’utilisation peuvent être révisés. **Priorité : terminer et équilibrer BELLYMON avant de créer de nouveaux personnages. Aucun développement des nouvelles héroïnes, de leurs compétences, du système de qualités ou du menu de starters avant validation des mécaniques.** Depuis V12.0.20, le steak 🥩 rapporte 5 pts et le gigot 🍖 25 pts ; les seuils et chances d'obtention restent inchangés.

### Tarifs validés — BELLYMON V14.3 (13 novembre 2026)
La tarification des potions remplace les **anciens prix V13** : petite +30 % PV = **9 steaks ou 3 gigots** ; grande +60 % PV = **15 steaks ou 5 gigots** ; suprême +90 % PV = **21 steaks ou 7 gigots**. Chaque prix en steaks est divisible par trois, et le prix rapporté à 100 % de soin baisse progressivement (30, 25, 23,33 steaks). Les effets et restrictions des potions restent inchangés. Les anciennes mentions de 9/18/30 steaks et 3/6/10 gigots documentent uniquement l'historique de la V13.


### Mise à jour V14.7 — Envoûteuse : Vol de puissance (13 novembre 2026)

Modification validée : le Vol de puissance de l’Envoûteuse transfère **jusqu’à 20 points fixes de Force**, et non plus 20 % de la Force ennemie. Le transfert est limité à la Force réellement disponible de la cible, sans valeurs négatives. Conservation du coût de 20 EN, de la durée de trois tours à partir du tour suivant, de l’absence de cumul et de cooldown. Les autres compétences ne changent pas.

### Mise à jour V14.8 — Maudite : Malédiction du sang (13 novembre 2026)

Modification validée : le malus de la Maudite passe de **5 % à 10 % des PV maximum** de l'adversaire **par attaque offensive tentée**, y compris quand l'attaque échoue. La durée est inchangée (**3 tours, activation comprise**), ainsi que le coût (**20 EN**), l'absence de cumul et de cooldown. Les autres sorts restent inchangés.


### Mise à jour V15 — Rapidité comparative (13 novembre 2026)

Mécanique codée et validée : les chances de **critique**, d'**esquive** et la **précision des attaques lourdes et de Griffes fatales** utilisent le tableau de différence de Rapidité `P = max(0, min(100, 50 + (RAP lanceuse − RAP adversaire)/2))` : −100 RAP = 0 %, égalité = 50 %, +100 RAP = 100 %. Le point de vue est celui de la combattante concernée (attaque ou défense). Règle identique pour joueur et PNJ, avec bonus de collection conservés pour le joueur. L'attaque lourde passe de **Force ×1,3 à Force ×1,5**. Lourde et Griffes fatales : **un seul jet de précision**, sans deuxième esquive ordinaire. Griffes fatales conserve son critique garanti ×3 lorsqu'elle touche. Les attaques légères et les autres compétences offensives esquivables conservent leur précision propre et utilisent l'esquive comparative normale ; les soins et effets de soutien ne sont pas esquivables. Le Spectre intangible reste protégé. Voir `RAPPORT_V15.md`.
