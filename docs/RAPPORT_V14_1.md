# BELLYMON V14.1 — Cooldown de l'action Récupération

## Modification validée
- L'action **⚡ Récupération** rend toujours jusqu'à **67 EN**, ne coûte **0 EN**, et laisse le personnage subir **+30 % de dégâts** au tour d'activation.
- Une fois utilisée au tour `t`, elle est indisponible pendant les **5 tours complets** `t+1` à `t+5` ; elle redevient disponible au tour `t+6` (ex. récupération T1 → réutilisable T7).
- Le bouton indique les tours de recharge restants ; il est désactivé tant que l'action est indisponible ou que l'énergie est déjà au maximum.
- L'adversaire et le mode AUTO sont soumis à la même limite ; à 0 EN pendant le cooldown, ils privilégient Défense au lieu de tenter une récupération illégale.
- La recharge est stockée avec les effets du combat et persiste après sauvegarde/rechargement. Les anciennes sauvegardes dépourvues de ce champ restent compatibles.
- Les compétences spéciales, le soin de la Prêtresse, les dégâts, l'énergie des attaques, la boutique et les sprites sont inchangés.

## Contrôles réalisés
- `node tests/v14_1_recovery_cooldown.test.js` : 42 vérifications ciblées validées.
- `python tests/v14_1_recovery_browser.py` : 21 vérifications en navigateur validées, dont compteur, reprise de sauvegarde, mode AUTO.
- `python tests/v14_browser.py` : 168 vérifications générales validées, sans erreur JS.
- `python tests/v14_capture_browser.py` : 30 vérifications de capture validées, sans erreur JS.
- Tests Node existants : bonus, capture, évolution, récompenses, soins, boutique, six nouvelles compétences et simulations AUTO validés.
- Un ancien long test de régression sur la récupération a dépassé le délai d'exécution et n'est pas considéré comme validé.

## Remarque d'équilibrage
Le cooldown limite les récupérations répétées. Il n'implique pas que tous les duels Soigneuse contre Soigneuse seront nécessairement courts : le comportement des sorts de soin n'a pas été modifié dans cette mise à jour.
