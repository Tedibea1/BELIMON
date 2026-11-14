BELLYMON V15.6 — coûts historiques et suppression de la récupération en combat.
Voir NOTES_V15_6.md.

BELLYMON — VERSION 15.5
====================
Jeu de collection, capture, combat et évolution de waifus, sur une tour infinie.
Code original HTML / CSS / JavaScript, prévu pour ordinateur et téléphone.

INSTALLATION
------------
1. Décompresser l'archive BELLYMON_V15.5.zip.
2. Ouvrir BELLYMON_V15.5/index.html dans Brave, Chrome ou un navigateur récent.
3. Créer une partie ou reprendre une sauvegarde BELLYMON antérieure.

Ne pas déplacer index.html seul : les illustrations et les modules du jeu
sont dans les dossiers assets/, css/ et js/.

V15.5 — GUIDE INTÉGRÉ (WIKI)
==============================
- Nouveau bouton « 📖 Guide » dans l'en-tête, visible depuis le menu, la création de partie et le jeu.
- Page Guide avec quatre boutons : « Retour au jeu », « Classes », « Morphologies », « Compétences ».
- 12 fiches de classe illustrées EXCLUSIVEMENT avec les sprites officiels communs de rang E.
- Indications qualitatives FOR / RAP / CONS sous forme de +, ++, +++, ++++ ; aucun nombre statistique, aucune formule, aucun coefficient révélé au joueur.
- 3 morphologies décrites qualitativement, sans montrer leurs formes évoluées ni les autres sprites.
- Noms et descriptions compréhensibles des 12 compétences spéciales ; descriptions sans chiffres techniques.
- Ouverture et fermeture sans quitter la partie ; combat, chrono et exploration automatique sont suspendus pendant la consultation.
- Conservation du formulaire de création et des sauvegardes existantes.
- Aucune règle de combat, statistique, prix ni durée de compétence modifiée.
- CSS et JavaScript du Guide séparés dans css/guide.css et js/guide.js.

V15.4.1 — RENOMMAGE DE FRAPPE SPECTRALE
------------------------------------------------
- La compétence de la Spectre s'appelle désormais « Frappe spectrale »
  partout dans l'interface (action, bonus, journal des combats).
- Les valeurs, les effets, le cooldown et l'intangibilité ne changent pas.
- Les sauvegardes utilisent toujours l'identifiant stable « spectre ».

V15.4 — QUATRE COMPÉTENCES SPÉCIALES REVISITÉES
==================================================
- Maudite : Malédiction du sang devient une attaque Force ×1,0. Si elle touche,
  l'ennemie attaquante perd 10 % de SES PV maximum par attaque offensive tentée
  pendant les trois tours APRÈS le lancement (T+1, T+2, T+3). Elle n'agit
  donc pas au tour d'incantation. Esquive et critique ordinaires conservés.
- Envoûteuse : Vol de puissance devient une attaque Force ×1,0. Si elle touche,
  elle transfère jusqu'à 20 points réels de Force de la cible à la lanceuse
  durant les trois tours SUIVANTS (T+1 à T+3), sans cumul. Esquive et critique
  ordinaires conservés. Purification bloque le transfert, pas les dégâts.
- Némésis : Miroir magique renvoie toujours 40 % des dégâts réellement subis,
  mais pendant 5 tours, tour de lancement inclus (T à T+4).
- Exorciste : Purification retire les malus immédiatement et protège contre
  les nouveaux malus pendant 5 tours, tour de lancement inclus (T à T+4).
- Les deux protections immédiates prennent effet au tour du lancement,
  indépendamment de l'ordre des actions. En revanche, les deux nouvelles
  attaques offensives doivent TOUCHER pour appliquer leur malus.
- Même règles pour les combattantes joueuses et les PNJ. Coût des spéciales
  inchangé (20 EN). Bonus de collection, sorts non concernés, attaques,
  statistiques, tarif ascenseur de V15.3 et sauvegardes inchangés.

V15.3 — ASCENSEUR : TARIFS PLUS ACCESSIBLES
===============================================
- Nouvelle formule pour l'étage n : prix(n) = max(1, arrondi(n² / 12)) steaks.
- Exemples : étage 15 = 19 steaks (avant 230), étage 30 = 75 (avant 300),
  étage 60 = 300 (avant 512), étage 100 = 833 (avant 1 046),
  étage 226 = 4 256 (avant 9 901).
- Le raccourci vers n−5 conserve 50 % du tarif calculé pour cet étage,
  avec l'arrondi au pair existant.
- Achat uniquement depuis la salle de repos de l'étage 1 ; aucun raccourci
  automatique, soin ou butin gratuit ; record et sauvegardes conservés.
- Les autres mécaniques de combat, compétences, monnaie, butins et bonus de
  collection ne changent pas.
- Tests : node tests/v15_3_shortcuts.test.js ; python tests/v15_3_shortcuts_browser.py.

V15.2 — GRIFFES FATALES : LE TEST D'ASSASSINAT DE RPG FURRY
=============================================================
- Seule Griffes fatales change de fonctionnement par rapport à V15.1.
- Son jet de réussite reprend exactement la formule proportionnelle de
  l'Assassinat de RPG FURRY V21 :
  P (%) = borner(50 + 100 × (RAP_lanceuse - RAP_cible) / RAP_lanceuse, 0, 100).
- À Rapidité égale : 50 % de réussite au premier jet ; si la lanceuse a
  au moins deux fois la RAP adverse : 100 % au premier jet.
- Contrairement à l'ancienne V14.9, la cible PEUT ensuite esquiver
  normalement : ESQ (%) = min(100, plancher(RAP de la cible / 2)).
- Si les deux jets réussissent, le critique ×2 est garanti (Force ×1,0).
- Les deux jets sont indépendants ; le taux réel de toucher correspond à
  P_test × (1 - ESQ_cible/100), sauf immunités spéciales (Spectre).
- Même règle pour les Griffeuses joueuses et PNJ ; bonus de collection,
  pièges et malus déjà pris en compte par les stats effectives.
- Cas limite RAP lanceuse 0 : 0 % si la cible est plus rapide, 50 % si
  toutes deux sont à RAP 0 (Furry n'autorisait pas une RAP attaquante à 0).
- Toutes les autres mécaniques de V15.1 conservées : critiques/esquives
  ordinaires RAP/2, lourde ×1,5 et précision comparative, énergie 20,
  compétences, sauvegardes, sprites, protections et économie.
- Les notes V15.1 et antérieures ci-dessous décrivent leurs versions
  respectives et ne remplacent pas ces règles de Griffes fatales.

V15.1 — CRITIQUES ET ESQUIVES REPRIS DE RPG FURRY
=========================================================
- Critique ordinaire (%) = min(100, plancher(RAP effective / 2)).
- Esquive ordinaire (%) = min(100, plancher(RAP effective / 2)).
- Ces deux calculs ne comparent plus la RAP adverse.
- Légère et spéciales offensives esquivables : esquive adverse puis critique.
- Multiplicateur critique universel : ×2 (déjà appliqué aux critiques ordinaires).
- Griffes fatales : retour à l'ancienne précision normale (100 %) suivie de
  l'esquive ordinaire adverse, critique garanti ×2 quand l'attaque touche.
  Plus aucun jet de précision comparatif propre à Griffes fatales.
- Lourde INCHANGÉE : Force ×1,5 ; précision comparative de V15, un seul jet
  sans deuxième esquive ordinaire ; critique ordinaire RAP/2 si elle touche.
- Bonus de collection intégralement pris en compte dans les statistiques.
- Les règles historiques V15 et V14.9 ci-dessous sont conservées comme archives
  des versions précédentes, et NE décrivent PAS les règles actives de V15.1.
- Toutes les autres compétences, sauvegardes, classes et mécaniques conservées.

V15 — REFONTE DE LA RAPIDITÉ : CRITIQUES, ESQUIVE ET ATTAQUE LOURDE
===================================================================
- Formule commune pour toutes les combattantes (joueur et PNJ) :
  P(%) = limiter(50 + (RAP de la combattante − RAP adverse)/2, 0, 100).
  −100 RAP => 0 %, RAP égale => 50 %, +100 RAP => 100 %.
- Critiques ordinaires : calcul comparatif après une attaque réussie (×2).
- Esquive ordinaire : calcul comparatif du point de vue de la défenseure.
- Lourde : Force ×1,5, un seul jet de précision comparatif ; PAS de second
  jet d'esquive. La réussite peut ensuite déclencher un critique ordinaire.
- Griffes fatales : même jet de précision comparatif, puis critique garanti ×3.
- Attaques légères et autres spéciales : règles de précision conservées ;
  jet d'esquive adverse comparatif lorsqu'elles sont esquivables.
- Intangibilité du Spectre toujours capable de bloquer une attaque.
- Les bonus de collection sont pleinement conservés et comptés pour le joueur.
- Sauvegardes et autres fonctionnalités inchangées.
Voir RAPPORT_V15.md et tests/v15_rapidite.test.js.

V14.9 — GRIFFES FATALES : RÉUSSITE SELON L'ÉCART DE RAPIDITÉ
----------------------------------------------------------------
- Griffes fatales (Griffeuse) reste Force ×1,0 et critique garanti ×3
  lorsqu'elle touche l'adversaire.
- Un seul jet pour savoir si le coup réussit :
  chance = limiter(50 + (RAP_lanceuse − RAP_adversaire)/2, 0, 100) en %.
- Écart +100 : 100 % de réussite ; égalité : 50 % ; écart −100 : 0 %.
- Griffes fatales n'effectue PAS de second jet d'esquive classique :
  cela permet de respecter les probabilités ci-dessus.
- L'intangibilité du Spectre reste une protection spéciale : elle bloque
  Griffes fatales indépendamment du calcul de Rapidité.
- Les RAP sont calculées après les bonus de collection et les malus actuels.
- Aucun changement aux critiques, esquives et attaques lourdes ordinaires.
- Coût de la compétence et autres règles de V14.8 conservés.

V14.8 — MAUDITE : MALÉDICTION DU SANG RENFORCÉE
------------------------------------------------
- Malédiction du sang retire désormais 10 % des PV MAXIMUM de l'attaquant à
  chaque attaque offensive tentée, même si elle manque ou est esquivée.
- La malédiction reste active pendant 3 tours, activation comprise, sans cumul,
  sans cooldown, pour un coût de 20 EN.
- Les autres compétences, les captures et les sauvegardes restent inchangées.

V14.7 — ENVOÛTEUSE : VOL FIXE DE 20 POINTS DE FORCE
---------------------------------------------------
- Vol de puissance ne calcule plus 20 % de la Force de l’adversaire :
  il vole un maximum de 20 points de Force, valeur fixe.
- Si l’ennemie possède moins de 20 points disponibles, le montant transféré
  est réduit à sa Force disponible ; il n’y a ni perte de Force négative
  ni bonus créé artificiellement.
- Même coût (20 EN), même durée (3 tours à compter du tour suivant),
  aucun cumul et aucun cooldown.
- La description de la compétence dans l’interface et les tests sont actualisés.
- Compatible avec les sauvegardes V14.6 ; aucun autre équilibrage changé.

V14.6 — COLLECTION : COMBATTANTE ACTIVE EN PREMIER
-------------------------------------------------
- Dans « Mes waifus », la combattante sélectionnée apparaît en première
  position, y compris si elle est d'un rang inférieur aux autres.
- Lors du changement de combattante, la liste se réorganise immédiatement.
- Les autres waifus conservent le tri décroissant S → E.
- Il s'agit d'un tri d'affichage : les IDs, captures, stats et sauvegardes
  ne sont pas modifiés. Compatible avec les parties V14.5.

V14.5 — ASCENSION AUTOMATIQUE ET COMMANDES
-------------------------------------------
- Le bouton 🤖 AUTO fonctionne à présent pendant les salles de repos et les
  combats : la waifu avance, lance les combats, ouvre les coffres et
  reprend l’ascension après les résultats.
- Pour commencer en AUTO dès l’étage 1 : bouton AUTO dans « Commandes ».
  Pendant un combat, le bouton AUTO reste dans la grille des attaques.
- AUTO reste sans capture automatique, sans achat d'ascenseur, sans
  consommation automatique de potions et sans changement automatique de waifu.
- En cas de défaite ou de relais nécessaire, AUTO est désactivé.
- L’ascension se met en pause lorsque tu ouvres un autre onglet du jeu,
  une fenêtre de dialogue, ou masques l’onglet du navigateur.
- Sur PC et mobile, les commandes à l’étage 1 affichent d’abord « Avancer »
  sur une ligne, puis les deux raccourcis payants côte à côte.
- Prix exponentiels et sauvegardes V14.4 conservés.

V12 — FINITIONS ET ÉQUILIBRAGE
-----------------------------
- Tour courant bien visible au-dessus des cartes pendant les combats.
  L'indicateur s'anime au passage au tour suivant.
- Lorsqu'un personnage subit des dégâts, sa CARTE se secoue, clignote et
  montre brièvement la quantité de PV perdus. Un soin affiche le gain en vert.
- Petit rappel des effets sur chaque carte : baisse de Constitution, malédiction
  progressive et siphon d'énergie (avec tours restants).
- Bouton « ☠️ Effets » pendant le combat : détail des effets sur l'héroïne,
  l'adversaire et des pièges de tour, avec valeurs et durées ; le chrono et
  le mode AUTO se mettent en pause pendant la consultation.
- Déblocage des combats épuisés : si LES DEUX combattantes arrivent à 0 EN,
  chaque tour leur retire 15 % de leurs PV maximum (arrondi vers le haut).
  Aucune énergie n'est régénérée. En cas de KO simultané, la défaite est retenue.
  Ce mécanisme empêche l'impasse en manuel comme en AUTO.
- Performance : moins de reconstructions inutiles de la collection, des bonus
  et des images lors des tours AUTO et des effets de siphon.
- Respect du paramètre d'accessibilité « réduire les animations ».
- Les statistiques, les six capacités, les chances de capture, les rangs,
  le nourrissage et les récompenses validées n'ont pas été modifiés.

SAUVEGARDES
-----------
- Les sauvegardes précédentes restent lisibles : noms de format et clés de
  stockage historiques conservés volontairement.
- Les sauvegardes automatiques, les sauvegardes multiples et l'import/export
  JSON de V11 restent disponibles.
- En cas de changement de dossier, de navigateur ou d'appareil, utilisez un
  EXPORT JSON depuis « Mes parties » pour transférer les sauvegardes.
- Conservez les archives de vos anciennes versions si vous voulez revenir
  en arrière ; ne supprimez pas vos copies JSON.

TESTS
-----
- Consultez RAPPORT_TESTS_V12.md.
- Tests des règles Node.js : node tests/v12_rules.test.js ; node tests/*.test.js.
- Tests navigateur : python tests/v12_browser.py (requiert Playwright Chromium).
- Le navigateur automatisé a utilisé une page reconstituée en mémoire et un
  stockage simulé. La persistance réelle d'IndexedDB/localStorage dans votre
  navigateur personnel n'est donc pas certifiée par ces seuls tests.

La V12 conclut la feuille de route initiale ; des correctifs ultérieurs
restent possibles après des essais utilisateurs.

CORRECTIF V12.0.1 — 10 NOVEMBRE 2026
- Corrige le flash rouge qui réapparaissait après la secousse d’un dégât.
- Corrige le même défaut possible pour le flash vert des soins.
- Aucun changement dans les combats, chances de capture, rangs ou sauvegardes.
- Test ciblé : python tests/impact_regression.py
- Détails : RAPPORT_CORRECTIF_V12_0_1.md


CORRECTIF V12.0.2 — ANNONCES D’EVENEMENTS
- COMBAT / COFFRE / PIÈGE se ferment automatiquement après 1,8 seconde.
- Aucun clic ni toucher obligatoire, sur ordinateur ou téléphone.
- Toucher ou cliquer l’annonce permet toujours de la passer plus vite.
- Retrait du texte trompeur « TOUCHER POUR PASSER ».
- Conservation du correctif V12.0.1 et des anciennes sauvegardes.
- Test ciblé Chromium : python tests/announcement_auto_close.py
- Détails : RAPPORT_CORRECTIF_V12_0_2.md


CORRECTIF V12.0.3 — JOURNAL DE COMBAT PLUS LISIBLE
- Les messages du joueur et de son adversaire sont séparés par un retour
  à la ligne dans le bandeau violet sous les cartes.
- Les effets de compétence restent sur la même ligne que l'action concernée.
- Les captures échouées utilisent également deux lignes.
- Les sauvegardes et calculs de combat ne changent pas.
- Test ciblé : node tests/message_linebreak.test.js ;
  python tests/message_linebreak_browser.py

CORRECTIF V12.0.4 — COINS ARRONDIS DES ILLUSTRATIONS
Les angles des images de combat et de collection ont été arrondis davantage pour masquer les zones blanches présentes dans les coins des sprites PNG. Aucun sprite ni gameplay modifié.

V12.0.5 : noms personnalisés, doublons sans numérotation, collection triée du rang S à E, suppression sécurisée avec confirmation.

V12.0.6 : max. 3 waifus engagées par duel (titulaire comprise).
Les anciennes sauvegardes de combat sont compatibles : les personnages déjà KO comptent pour le quota.
Choix des classes : rôles simplifiés (DPS, Tank, Healer, Soutien).
Choix des morphologies : descriptions indicatives, sans valeurs numériques.


CORRECTIF V12.0.7 — BANDEAU ET AUDIO
-----------------------------------
- Suppression de l’intitulé de l’adversaire (classe et rang) placé avant
  les actions dans le bandeau violet PENDANT LE COMBAT.
  Chaque action du tour reste sur sa propre ligne. Les titres des coffres,
  des salles de repos, de la victoire et des captures sont préservés.
- Deux MUSIQUES ORIGINALES dans assets/audio/ :
  exploration.mp3 (ambiance de la tour), combat.mp3 (combat dynamique).
  Musique bouclée, transition automatique avec un léger fondu.
- Bruitages originaux générés par Web Audio : attaques légère/lourde,
  compétences spéciales, défense, impacts, coups critiques, captures,
  coffres, pièges, nourriture, évolutions, victoire et défaite.
- Bouton « 🎵 Son » dans l'en-tête : activation et volumes séparés pour
  musique et effets sonores. Réglages conservés dans le stockage local.
- Le navigateur exige un premier clic ou appui avant de jouer les sons.
- Si l'onglet est masqué, la musique se met en pause.
- Aucun téléchargement ni connexion Internet nécessaires pour la musique.
  Les compositions peuvent être régénérées avec tools/generate_music.py
  (numpy et ffmpeg requis uniquement pour régénérer les MP3).
- Pas de modification du gameplay, de la progression, des sauvegardes,
  des sprites, ni des idées du cahier.

TESTS V12.0.7
-------------
node tests/*.test.js
python tests/audio_banner_browser.py
python tests/three_waifus_browser.py
python tests/waifu_management_browser.py
python tests/announcement_auto_close.py
python tests/message_linebreak_browser.py

ATTENTION : N'OUVREZ PAS index.html SEUL. Conservez les sous-dossiers
assets/, css/ et js/ dans le même dossier après extraction.
Exporter ses sauvegardes JSON avant de changer de dossier/version.


CORRECTIF V12.0.8 — SIPHON, MUSIQUE DU MENU, COFFRES AUTOMATIQUES
-------------------------------------------------------------------
- Siphon d'énergie de la Bagarreuse : 4 tours au total, lancement compris.
  -1 énergie par seconde réelle active. Un nouveau lancer renouvelle les 4
  tours sans empiler les effets. Aucun autre sort modifié.
- L'ambiance d'exploration est disponible dès « Mes parties ». Elle démarre
  après une interaction du joueur (restriction normale des navigateurs).
  Bouton « ▶ Écouter l’ambiance musicale » si nécessaire pour la lancer.
  La musique se poursuit quand on revient du jeu au menu.
- Les coffres normaux ET les coffres piégés s'ouvrent automatiquement à la fin
  de l'annonce « COFFRE » (environ 1,8 s) : il n'y a plus d'étape « OUVRIR ».
  Le coffre normal affiche immédiatement son loot ; le coffre piégé affiche
  immédiatement son malus sans annonce supplémentaire. Le type reste caché
  jusqu'à l'ouverture. Cliquer l'annonce pour la passer reste possible.
- Le traitement du coffre s'enregistre en une transaction : aucun double gain
  ou double malus en cas de double clic. L'ancien bouton n'apparaît qu'en cas
  d'échec de sauvegarde, sous le libellé « RÉESSAYER ».
- Une sauvegarde antérieure quittée devant un coffre non ouvert reprend
  également par l'annonce et l'ouverture automatique.
- Les formats JSON de sauvegarde, règles de combat restantes et 84 PNG sont
  inchangés.

TESTS SPÉCIFIQUES V12.0.8
- node tests/v12_0_8_siphon.test.js
- python tests/announcement_auto_close.py
- python tests/v12_0_8_browser.py
- python tests/audio_banner_browser.py
- python tests/three_waifus_browser.py


CORRECTIF V12.0.9 — GRIFFES FATALES
---------------------------------------
- La spéciale Griffes fatales (Griffeuse) utilise désormais Force ×1,0,
  avec un critique GARANTI multiplié par 3 (au lieu de Force ×0,8 / ×2).
- Coût : 5 EN inchangé. Une seule attaque, pas deux coups séparés.
- Esquive adverse, Constitution et Défense conservent leurs effets.
- Les critiques des attaques légères, lourdes et des autres spéciales restent ×2.
- L'Archère arcanique (Flèche du cataclysme ×1,7) n'est pas modifiée.
- Fonctionne aussi pour une Griffeuse ennemie.
- Pas de modification des sauvegardes, objets, rangs et 84 portraits.

TESTS V12.0.9
-------------
node tests/v12_0_9_griffes.test.js
python tests/v12_0_9_griffes_browser.py
node tests/combat_rules.test.js

CORRECTIF V12.0.10 — MALEDICTION & SIPHON
--------------------------------------
- Siphon d’énergie (Bagarreuse) : −2 énergie par seconde de combat active,
  pendant 4 tours (lancement compris), relançable sans cumul.
- Malédiction abyssale (Occultiste) : −2 % Force/Rapidité/Constitution par
  seconde de combat active, jusqu’à −50 %, pendant 5 tours (lancement compris).
  Aucun cooldown. La relance conserve le pourcentage et le rythme atteints,
  et remet uniquement le compteur de durée à 5 tours.
- Les horloges s’arrêtent hors du combat visible (menu, changement d’onglet,
  fenêtres modales), comme la durée des tours. Le mode AUTO reste compatible.
- Conversion des anciennes malédictions des sauvegardes V12.0.9 en cours.
- Détails : RAPPORT_CORRECTIF_V12_0_10.md.

CORRECTIF V12.0.12 — MUSIQUE AUTOMATIQUE SUR « MES PARTIES »
---------------------------------------------------------------
- Suppression du bouton « Écouter l’ambiance musicale » sur le menu principal.
- Tentative de lecture immédiate de la musique d’exploration dès l’ouverture.
- Si le navigateur bloque le son sans interaction, la musique se lance au
  premier clic, toucher ou appui clavier N’IMPORTE OÙ, sans bouton dédié.
- Le réglage « Musique d’ambiance » et les volumes sont toujours respectés.
- Les musiques de combat, bruitages, sauvegardes et mécaniques sont inchangés.
- Aucune application web ne peut garantir un son audible avant toute
  interaction sur les navigateurs qui bloquent l’autoplay.

V12.0.12 — ORDRE DU BANDEAU DE COMBAT
------------------------------------
- Pendant un combat, le compte-rendu du tour precedent apparait sous le panneau
  COMMANDES. Les deux actions restent sur des lignes separees.
- Le bandeau d'information des salles, coffres, victoires et remplacements
  conserve sa position precedente, au-dessus des commandes.
- Les PV et la Constitution ne sont PAS modifies. La proposition de PV lies
  a la Constitution reste a discuter et equilibrer avec le joueur.


CORRECTIF V12.0.13 — PREMIER INDICATEUR DE DÉCISION ADVERSE
- Un indicateur animé avait été ajouté avec un délai artificiel après le
  clic du joueur. Ce comportement est corrigé et remplacé en V12.0.14.

V12.0.14 — CHRONOMÈTRE COMMUN ET DÉCISIONS SIMULTANÉES
---------------------------------------------------
- Joueur et IA prennent leur décision pendant LES MÊMES 15 secondes, à partir
  du début du tour. L’IA ne commence pas à choisir après le clic du joueur.
- Si le joueur choisit avant l'IA : « L’adversaire choisit son action… »
  apparaît, les commandes sont verrouillées, MAIS le chrono continue.
- Si l’IA a déjà choisi : le joueur peut encore réfléchir et son action
  déclenche la résolution immédiatement, sans délai artificiel.
- Si le joueur ne choisit rien au terme des 15 s, son action est passée.
- Seule une vraie pause (fenêtre modale, onglet masqué) suspend les deux délais.
- La capture et le mode AUTO restent compatibles. Les décisions ennemies sont
  calculées une seule fois par tour, indépendamment du choix du joueur.
- Aucun changement des dégâts, des compétences ni de la logique de l’IA.
- La phase 2 à 50 % PV reste dans le cahier d'idées, non implémentée.
- Test navigateur : python tests/chrono_commun_browser.py
- Détails : RAPPORT_CORRECTIF_V12_0_14.md.


V12.0.15 — ÉQUILIBRAGE DES COÛTS ET DU SIPHON
------------------------------------------------
- Attaque légère : coûte maintenant 2 points d'énergie (au lieu de 1).
- Attaque lourde : 3 EN, inchangé.
- Compétence spéciale : 5 EN, inchangé.
- Capture : 2 EN, inchangé. Défense : 0 EN, inchangé.
- Siphon d'énergie de la Bagarreuse : retire désormais 5 EN par
  seconde de combat actif (au lieu de 2 EN/s), pendant 4 tours.
  Un nouveau lancement renouvelle la durée, sans cumul du débit.
  Le siphon cesse hors combat, pendant les pauses, et ne fait jamais
  descendre l'énergie en dessous de zéro.
- Les nouveaux coûts valent pour les waifus du joueur ET les ennemies.
- Aucune régénération d'énergie ajoutée ; il faut surveiller l'effet
  d'un siphon accéléré sur les combats longs.
- La Malédiction abyssale conserve ses −2 %/seconde, 5 tours et le
  renouvellement sans cooldown ; les autres compétences sont inchangées.
- Aucun changement de format de sauvegarde, d'images ou de musique.

TESTS CIBLÉS :
node tests/v12_0_15_balance.test.js
python tests/v12_0_15_browser.py
Détails dans RAPPORT_CORRECTIF_V12_0_15.md.

V12.0.16 — RÉÉQUILIBRAGE DU SIPHON D’ÉNERGIE
- Bagarreuse : Siphon d’énergie retire désormais 3 EN par seconde active au lieu de 5.
- Durée inchangée : 4 tours ; relançable ; pas de cumul.
- Attaque légère 2 EN, lourde 3 EN, spéciale 5 EN : aucun changement.
- Affichages de la compétence, du statut et du journal mis à jour.
- Sauvegardes précédentes compatibles : les effets actifs utilisent la nouvelle valeur.

V12.0.17 — RENOMMAGE DE LA COMPÉTENCE DE BAGARREUSE
- Nom affiché : « Absorption » (anciennement « Siphon d’énergie »).
- Texte de combat, descriptions et étiquettes de statut renommés.
- Aucun changement de mécaniques : 3 EN/s pendant 4 tours, relançable sans cumul.
- Compatibilité : la clé technique « siphon » reste identique dans les sauvegardes.


============================================================
V12.0.18 — COMBATS ET HÔPITAL (NOUVELLES RÈGLES)
============================================================
- Une attaque légère coûte désormais 15 énergie et inflige Force ×1,0.
- Une attaque lourde coûte 15 énergie ; sa précision et sa puissance restent inchangées.
- Les compétences spéciales coûtent 20 énergie. La Défense reste à 0 énergie.
- À priorité égale, la plus grande RAPIDITÉ agit en premier ; égalité : tirage aléatoire.
- La Défense se prépare TOUJOURS avant les attaques adverses.
- Les PV perdus persistent après une victoire, une capture, une défaite et un abandon de tour.
- À la fin d'un combat, seule l'énergie des waifus remonte à 100.
- Après trois KO, la défaite ramène à l'étage 1 sans soigner les combattantes.
- Un onglet HÔPITAL est visible dans la barre de navigation. Il est ouvert uniquement à l'étage 1 ; au-delà, un panneau grisé explique comment y revenir.
- L'hôpital propose 3 lits : une waifu blessée (même non KO) occupe un lit pendant 18 s réelles puis récupère tous ses PV. Les soins continuent lorsque le navigateur est fermé. Pas de guérison hors de l'hôpital.
- Les barres de PV figurent sur les cartes de la collection et les fiches : vert, jaune, rouge selon le niveau de vie.
- Les anciennes sauvegardes sont acceptées : les trois premières anciennes convalescences sont reprises comme lits, les autres blessures restent à soigner.
- Le niveau de PV n'est PAS lié à la Constitution dans cette version, conformément à la décision de laisser ce réglage en réflexion.
- Tests actuels : tests/v12_0_18_rules.test.js, tests/v12_0_18_browser.py ; les tests pour anciennes valeurs sont archivés dans tests/legacy_before_v12_0_18.

Pour revenir à l'hôpital quand tu es déjà dans la tour, utilise « Quitter la tour » (confirmation). Tes waifus conserveront leurs blessures et tes acquisitions permanentes resteront sauvegardées.

V12.0.19 : ajout de Récupération (0 EN, +⅔ énergie maximale, +30 % dégâts reçus pour le tour en cours). AUTO conservé et compatible ; IA et AUTO utilisent Récupération pour éviter les impasses à 0 EN.

V12.0.20 — ÉCONOMIE DE NOURRITURE
- 🥩 Steak : ancien petit gigot, désormais 5 points d’évolution par unité.
- 🍖 Gigot : ancien gros gigot, conserve ses 25 points d’évolution.
- Les seuils d’évolution, la quantité de nourriture gagnée et les probabilités de butin sont inchangés.
- Stocks existants préservés (clés internes food.small / food.large inchangées).
- Dans la V12.0.20, la boutique était encore à l’état de proposition :
  potion coûtant 9 steaks ou 3 gigots ; 45 contre 75 points d’évolution sacrifiés.
  Fonctionnalité désormais intégrée en V13 (voir ci-dessous).
- Vérification navigateur : python tests/v12_0_20_nutrition_browser.py
- Détails : RAPPORT_CORRECTIF_V12_0_20.md


V13 — BOUTIQUE DE POTIONS (11 NOVEMBRE 2026)
--------------------------------------------------
- Nouvel onglet « 🧪 Boutique » accessible en jeu. Trois potions, aucune autre marchandise.
- Petite potion : soigne +30 % des PV maximum ; prix 9 steaks OU 3 gigots.
- Grande potion : soigne +60 % des PV maximum ; prix 18 steaks OU 6 gigots.
- Potion suprême : soigne +90 % des PV maximum ; prix 30 steaks OU 10 gigots.
- Les soins sont plafonnés aux PV maximum. Pas de gaspillage possible sur une waifu déjà en pleine santé.
- Les achats sont possibles uniquement à l’étage 1, hors combat.
- Les potions acquises sont utilisables depuis l’onglet Boutique à tous les étages, hors combat, sur une waifu blessée et consciente.
- Les potions ne ressuscitent pas les KO et ne perturbent pas les lits de l’hôpital.
- Les achats et utilisations sont sauvegardés par le système existant, sans nouveau format obligatoire : anciennes parties compatibles.
- Les règlements en steaks ou gigots sont indépendants ; pas de mélange automatique.
- Aucune modification des formules de combat, des nourritures, des gains ou des évolutions.
- Tests : node tests/v12_0_21_shop.test.js ; python tests/v12_0_21_shop_browser.py.
- Rapport : RAPPORT_CORRECTIF_V12_0_21.md.

REMARQUE : accès à la boutique, soins hors combat et interdiction de réveiller les KO
reprennent les règles proposées précédemment ; elles pourront être ajustées dans une mise à jour.


V14 — SIX NOUVELLES HÉROÏNES (13 NOVEMBRE 2026)
=================================================
- Les 6 classes de départ sont conservées et restent les seules proposées à la création.
- Les 6 classes capturables inédites apparaissent à partir du rang D (étage 21), puis restent présentes jusqu'au rang S :
  Vampire (FOR 20 / RAP 20 / CONS 20), Spectre (10 / 40 / 10),
  Némésis (20 / 10 / 30), Maudite (20 / 10 / 30),
  Envoûteuse (20 / 20 / 20), Exorciste (20 / 20 / 20).
- Tous les nouveaux sprites rangs D à S et morphologies sont inclus, 96 images en 512x512 px.
- Nouvelles compétences spéciales, toutes à 20 EN, sans cumul :
  Vampirisation = attaque Force ×1,0, soigne 35 % des dégâts infligés.
  Frappe spectrale = attaque Force ×1,5, intangibilité pendant les tours 1 et 2, vulnérable et indisponible tour 3, compétence réutilisable tour 4.
  Miroir magique = renvoie 40 % des dégâts reçus pendant 3 tours, activation comprise.
  Malédiction du sang = 10 % des PV maximum de l'attaquant retranchés par attaque offensive pendant 3 tours, même si elle manque sa cible.
  Vol de puissance = transfert fixe jusqu’à 20 points de Force adverse durant 3 tours à compter du tour suivant (valeur actualisée en V14.7).
  Purification = retire les malus et immunise contre de nouveaux malus pendant 2 tours, activation comprise.
- Aucun cooldown sauf Spectre. Réutiliser un pouvoir actif le renouvelle sans additionner ses effets.
- Les dégâts physiques/magiques restent une distinction de RP (pas de statistique de magie).
- Valeurs HP de référence proposées pour les nouvelles classes : 130 / 110 / 160 / 160 / 130 / 130 dans l'ordre ci-dessus.
- Les sauvegardes V13 sont conservées : identifiants de stockage, structure de sauvegarde et fonctions de capture/évolution inchangés.
- Fichiers de tests dédiés : tests/v14_skills.test.js, tests/v14_auto_simulation.test.js, tests/v14_browser.py, tests/v14_capture_browser.py.
- Note : les fichiers des nouvelles héroïnes étaient déjà présents dans V13_avec_96_sprites. V14 les branche sur le vrai gameplay.


V14.1 — RECHARGE DE RÉCUPÉRATION (13 NOVEMBRE 2026)
====================================================
- Action ⚡ Récupération : restaure toujours jusqu’à 67 EN et expose à +30 % dégâts reçus.
- Après utilisation, 5 tours complets sans récupération ; si utilisée au tour 1, réutilisable au tour 7.
- Indisponibilité affichée sur le bouton, y compris lorsque l'énergie est basse.
- Même limitation pour le joueur, AUTO et IA ennemie. À 0 EN pendant l'attente, Défense reste possible.
- Recharge enregistrée dans les effets de combat en cours, compatible avec les anciennes sauvegardes.
- Aucune modification des compétences spéciales, du soin de la Prêtresse, de la boutique ou des sprites.

V14.2 — BOUTIQUE ET POTIONS DANS LES FICHES (13 NOVEMBRE 2026)
- La boutique est uniquement accessible à l’étage 1 ; au-dessus, écran de retour identique à l’hôpital.
- La boutique propose uniquement l’achat des trois potions aux prix inchangés.
- Le soin par potion est accessible dans la fiche de chaque waifu, à côté de Steak et Gigot.
- Sélectionner une potion transforme « Nourrir » en « Utiliser » et soigne une fois la waifu sélectionnée.
- Une potion ne peut pas soigner pendant un combat, au-delà des PV max, une waifu KO ou hospitalisée.
- Les potions restent utilisables entre deux combats à n’importe quel étage.
- La sauvegarde et les autres mécaniques de V14.1 sont conservées.


V14.3 — TARIFS DÉGRESSIFS DES POTIONS (13 NOVEMBRE 2026)
========================================================
- Petite potion (+30 % PV max) : 9 steaks OU 3 gigots.
- Grande potion (+60 % PV max) : 15 steaks OU 5 gigots, au lieu de 18 / 6.
- Potion suprême (+90 % PV max) : 21 steaks OU 7 gigots, au lieu de 30 / 10.
- Coût en steaks rapporté à 100 % de soins : 30,00 / 25,00 / 23,33.
- Les montants s'affichent automatiquement sur les boutons d'achat et sont débités à l'achat.
- Aucun changement de pourcentage de soin, de nutrition, d'inventaire, de combat ou de sauvegarde.
- Prix V13 listés plus haut conservés uniquement comme historique de la V13.
- Vérifications : tests/v14_3_prices.test.js et tests/v14_3_boutique_waifu_browser.py.

V14.4 — RACCOURCIS D’ASCENSION
------------------------------
À l’étage 1, dans COMMANDES : Avancer (gratuit), reprendre à n−5 (prix
réduit) et reprendre au record n (plein tarif). Le meilleur étage déjà
atteint est requis. Paiement en steaks uniquement, jamais en gigots.
P(n) = arrondi(300 × 1,018^(n−30)) ; reprise n−5 = arrondi au pair(P(n−5)/2).
Les achats sont confirmés, débités une seule fois et sauvegardés avant
de déplacer la waifu. Aucun PV ni butin gratuit.
Voir RAPPORT_V14_4.md et tests/v14_4_shortcuts.test.js.

V14.5 : AUTO progresse entre les salles et combat jusqu’à interruption ; aucun raccourci payant ni capture automatique.
Disposition des commandes harmonisée sur ordinateur et mobile.
