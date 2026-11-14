# BELLYMON V9 — Rapport de vérification

Date : 10 novembre 2026.

## Changements réalisés

- V8 conservée : aucune modification des règles de capture, des gigots, de l'évolution E → S ni des récompenses normales.
- Les coffres mystérieux sont indistinguables avant ouverture ; les pièges ne distribuent ni nourriture ni bonus de collection.
- Chaque piège tire un type parmi : **Force −20 %, Rapidité −20 %, Constitution −20 %, Toutes stats −10 %**.
- Le malus commence immédiatement, affecte **toutes les waifus**, et reste actif pour **deux étages, étage d'obtention inclus**.
- Pièges différents cumulés ; deux pièges identiques **non cumulables**, avec échéance rafraîchie à deux étages depuis le nouveau piège.
- Les malus s'appliquent aux statistiques **personnelles**, avant l'ajout des bonus permanents. Les bonus de collection ne sont jamais réduits.
- La fiche de waifu montre les statistiques effectives, un tooltip explique la diminution, et une puce très discrète indique les pièges actifs avec leur durée.
- Le piège est attribué **une seule fois à l'ouverture**, enregistré dans la même sauvegarde que son effet ; la fenêtre de révélation peut être récupérée après rechargement si elle n'a pas été validée.
- Les pièges expirent au changement d'étage ; ils sont effacés en cas de défaite totale ou d'abandon confirmé.
- Sauvegardes précédentes V7/V8 importées sans modification de leurs données ; les anciens pièges révélés avant V9 ne sont pas appliqués rétroactivement.
- Nouveau `js/traps.js` et `css/v9.css`, fichiers source séparés ; titre BELLYMON V9 et ensemble de sprites conservés.

## Résultats des tests exécutés

| Série | Vérifications réussies |
|---|---:|
| Règles de pièges V9 (durée, cumul, dégâts, bonus, capture, classes, rangs) | 894 |
| Bonus permanents V8 | 949 |
| Récompenses V5 | 21 |
| Nourrissage et évolutions V7 | 500 |
| Capture V6 | 33 |
| Compétences et combats V3.1 | 44 |
| Parcours de navigateur Chromium V9 (révélation, popup, sauvegarde, combat sous malus, expiration, affichage 320–1440 px, ancienne partie V8, import démo) | 83 |
| Régression navigateur V8 (coffres, captures, bonus, affichage) | 44 |
| Régression navigateur V7 (nourrissage, transformations, visuels, combats, responsive) | 75 |
| **TOTAL** | **2 643** |

Tous les scénarios ci-dessus ont réussi. Aucun événement `pageerror` JavaScript détecté dans les trois séries de tests navigateur.

## Limites connues

- Les tests Chromium s'exécutent avec le **vrai HTML, CSS et JavaScript**, mais des sprites miniaturisés et un **stockage local simulé**, car le navigateur automatisé bloque la navigation directe vers une URL locale/serveur dans cet environnement. L'enregistrement effectif sur l'appareil de l'utilisateur doit être testé manuellement.
- Les dégâts, les durées et les probabilités ont été vérifiés automatiquement mais l'équilibrage final demandera des parties jouées.
- Le mode AUTO n'a **pas** été anticipé : il reste réservé à la V10 conformément à la feuille de route.
