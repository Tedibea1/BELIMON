BELLYMON — V16.1.2 TEST — NE PAS PUBLIER

Cette archive est une copie privée de la version en ligne V15.19 enrichie d’une couche d’animations.
Aucune modification n’a été publiée sur GitHub.

Lancement : extraire tout le dossier, puis ouvrir index.html dans un navigateur récent (Chrome/Edge/Firefox). Pour des sauvegardes IndexedDB et certains sons, il est conseillé de servir le dossier en local : « python -m http.server 8080 », puis http://localhost:8080/.
La musique et tous les sprites sont inclus et utilisables hors ligne.

V16 : roulette visuelle des pièges (4 malus actuels), un rouleau de coffre (icône + quantité), puis un deuxième si un bonus permanent est réellement obtenu, animations de récompenses, nouvelle capture, progression des étages et bonus, effets de combat, animations de nourrissage/évolution, transitions générales, cartes de collection plus réactives, boutique et progression des lits de l’hôpital.

NOUVEAU : trois sons courts de rot cartoon, joués après un vrai nourrissage (une seule fois par action), avec un petit « BUURP ! » visuel. Les rots sonores suivent l’option SFX et le volume des effets sonores, et ne se déclenchent ni pour les soins ni pour les achats.

Réglages : bouton « 🎞️ Effets » dans l’en-tête pour désactiver la couche d’animations ; bouton « 🎵 Son » pour les volumes et le son. Les roulettes ont un bouton « Passer l’animation ». Les préférences de mouvement réduit du système sont respectées.

IMPORTANT : les récompenses, pièges et captures sont calculés et sauvegardés AVANT l’animation. Les roues ne changent JAMAIS les probabilités, les statistiques ou les ressources.

La sauvegarde reste compatible avec la V15.19, mais pour tester séparément sans toucher aux sauvegardes de la version publiée, utiliser un profil de navigateur ou un dossier de données distinct.

V16.1.2 — CORRECTION DE LA MACHINE À BUTIN
Un rouleau par récompense réelle : steak ou gigot et quantité ensemble (ex. 🥩 ×3).
Un deuxième rouleau ne se révèle qu'après le premier si le coffre contient un bonus de collection (💪 +1, ⚡ +1 ou 🛡️ +1).
Fin des cases BONUS / QUANTITÉ / AUCUN, des captions et du butin affiché deux fois : le résultat n'apparaît QUE dans les rouleaux.
Le bouton « Passer » et l'option « Effets : OFF » affichent directement le ou les résultats.
Toutes les récompenses et probabilités sont strictement celles du jeu V15.19 : aucune modification du moteur de butin.

V16.1.2 : fenêtre de fiche recentrée même après nourrissage, 6 rots variés après chaque repas, bouton de test du volume déclenchant un rot aléatoire.
