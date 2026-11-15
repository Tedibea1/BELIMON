# BELLYMON V15.14 — Nettoyage des textes visibles avant le partage public

Objectif : supprimer les commentaires destinés au développeur de l'**interface du jeu**, sans supprimer d'informations utiles aux joueuses et joueurs.

### Textes retirés ou remplacés
- Écran **Mes parties** : suppression de la mention des projets indépendants « FEASTBORN » et « Chronicles ». L'avertissement important sur l'export des sauvegardes avant de changer de navigateur ou d'appareil est **conservé** et clarifié.
- Écran **Guide** : suppression de phrases éditoriales sur le fait de cacher les statistiques, les coefficients ou les probabilités ; les textes sont réécrits pour expliquer directement comment comparer les classes et morphologies.
- Panneau **Tour** et **Journal PC** : suppression de formulations techniques de migration telles que « Coffre ouvert avant la V5 », « Ancien piège découvert » et « Piège déjà découvert dans une ancienne version ». Remplacement par des messages neutres adaptés au joueur.

### Ce qui ne change pas
- Règles de capture V15.13 (55 % à 11–30 % PV, 85 % à 1–10 % PV), combats, IA, AUTO, évolution, économie, récompenses, hôpital, interface et stockage.
- Avertissements utiles sur la sauvegarde et textes expliquant le fonctionnement du jeu.
- **Les commentaires techniques du code, documents de développement et anciens fichiers de test** restent conservés : ils ne sont pas affichés dans l'interface.

Test ciblé : `node tests/tests/v15_14_public_copy.test.js`.
