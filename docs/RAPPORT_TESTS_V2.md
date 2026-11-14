# Tour des Waifus — rapport de tests V2

Testée dans Chromium headless avec Playwright, en injectant les fichiers HTML, CSS et JS dans une page mémoire (navigation HTTP locale bloquée par l'environnement). Les sprites E ont été chargés en images incorporées pour les captures de test ; toutes les images réelles sont fournies par le ZIP.

**Résultat : 123 contrôles réussis, aucune erreur JavaScript de page.**

## Vérifications réalisées

- Rendu sur **PC 1500 × 920**, mobile **390 × 844** et petit mobile **320 × 700** ; absence de défilement horizontal sur ces trois résolutions.
- Création de partie et six classes initiales ; sauvegarde du personnage.
- Passage repos → événement → repos de l'étage suivant.
- Rencontre de combat : titre, rang ennemi E, sprite et PV d'une ennemie, bouton d'aperçu provisoire.
- Sauvegarde et rechargement en plein événement : même ennemie conservée, sans nouveau tirage.
- Coffre normal : annonce, ouverture, fenêtre, poursuite de l'ascension.
- Coffre piégé : strictement indiscernable avant ouverture ; annonce « PIÈGE » et résultat après ouverture.
- Pas de récompense, blessure ni malus attribué par erreur dans cette V2.
- Quitter la tour : confirmation, annulation, retour à l'étage 1, record et collection préservés.
- Collection et bonus V1.1 toujours accessibles ; sauvegarde de la partie dans le menu.
- Contrôle des rangs des ennemies aux étages **20, 21, 40, 41, 60, 61, 80, 81, 100, 101 et 199**.
- Vérification de l'absence d'augmentation artificielle des PV entre les étages 101 et 199, à classe/morphologie identiques.
- Compatibilité d'une sauvegarde V1.1 sans historique des événements.
- Piège resté caché après fermeture puis reprise.
- Vérification sur disque de toutes les **108 combinaisons classe × morphologie × rang**, pointant vers **84 fichiers PNG existants** ; rang E commun, branche chétive partagée D/C et B/A.

## Restrictions de la validation

- Le stockage durable réel IndexedDB/localStorage a été remplacé par un faux stockage en mémoire pendant les tests de navigateur ; le rechargement a été simulé en fermant et recréant la page avec les données conservées. La persistance réelle sur le navigateur de l'utilisateur doit donc être vérifiée manuellement.
- Le chargement des sprites au-delà du rang E a été vérifié par correspondance de chemins et présence sur disque, mais pas par une ouverture visuelle automatisée de chaque image dans Chromium.
- Les tests ne constituent pas un équilibrage de combats : le moteur de combat démarre en V3.
