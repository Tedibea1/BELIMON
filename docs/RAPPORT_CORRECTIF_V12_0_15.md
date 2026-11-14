# BELLYMON V12.0.15 — Équilibrage des coûts et du Siphon

## Modifications

- Attaque légère : **2 EN**, au lieu de 1. Puissance, précision et critique inchangés.
- Attaque lourde : **3 EN**, inchangé.
- Compétence spéciale : **5 EN**, inchangé (toutes les classes).
- Capture : **2 EN**, inchangé ; Défense : **0 EN**, inchangé.
- Siphon d’énergie de la Bagarreuse : **−5 EN par seconde de combat active**, au lieu de −2 EN/s ; durée de quatre tours inchangée, lancement compris ; relancer le Siphon renouvelle la durée, sans ajouter de second débit.
- Descriptions du sort, bandeau de combat, inspection des effets et bouton de l’attaque légère mis à jour.
- Modifications valables pour les waifus contrôlées par le joueur et les ennemies.
- Aucun changement de dégâts, de statistiques, de chances de capture, d’autres compétences, de sauvegardes ni d’illustrations.

## Cas limite protégé

Si le joueur choisit une action payante, puis perd toute son énergie **pendant que l’IA termine de choisir** (ex. Siphon adverse actif), l’action impossible est remplacée par **Défense** et un avertissement est affiché. Le combat ne bloque plus et ne génère pas d’erreur.

## Interprétation et équilibrage

- À raison de 5 EN/s, une cible ayant **100 EN** et n’utilisant aucune énergie est vidée en **20 secondes actives**, contre **50 secondes** à 2 EN/s.
- La cible peut être vidée encore plus vite si elle consomme de l’énergie en lançant ses actions.
- L’effet dépend toujours du **temps de combat réellement écoulé** : un joueur qui joue très vite peut encore connaître plusieurs tours avant que 20 secondes ne passent. Les pauses, changements d’onglet, fenêtres modales et le menu ne font pas avancer les secondes actives.
- Aucune récupération automatique d’énergie n’est ajoutée. Ce changement est une amélioration importante du Siphon qui pourrait rendre la Bagarreuse plus dominante : jouer et tester plusieurs duels reste utile.

## Tests effectués

**Règles JavaScript : 13 suites réussies**, y compris :
- coût de la légère à 2 EN (joueur, IA et AUTO), lourd 3, spéciale 5, Défense 0 ;
- débit exact 5 EN/s, plafond 0 EN, rechargement de durée sans cumul, affichage descriptif ;
- conservation des autres capacités, des combats, blessures, malus, bonus, captures, évolution, etc. ;
- **87 assertions ciblées** dans `tests/v12_0_15_balance.test.js`.

**Chromium headless : 10 scénarios réussis**, dont :
- combats réels à 390 px et 1 440 px : coût réelle de la légère et de la spéciale, diminution de l’énergie adverse par tranches de 5 EN, message de Siphon actualisé, absence d’erreurs JavaScript ;
- scénario critique : action devenue impayable pendant l’attente de l’IA, remplacée par Défense sans blocage ;
- sept scénarios de chrono commun à 320, 390 et 1 440 px : choix anticipé/tardif, compte à rebours continu, expiration à 15 s, AUTO et capture.

Scripts :

```bash
cd BELLYMON_V12.0.15
node tests/v12_0_15_balance.test.js
python tests/v12_0_15_browser.py
python tests/chrono_commun_browser.py
```

## Compatibilité

L’archive contient `index.html`, `css/`, `js/`, `assets/` (84 portraits et musiques) et `tests/`. Les formats de sauvegardes restent inchangés. **Exporter les parties en JSON avant une mise à jour** est recommandé, particulièrement lors d’un changement de dossier local ou de navigateur.

Les tests d’interface utilisent Chromium et un stockage simulé ; ils ne prouvent pas à eux seuls la persistance réelle sur le navigateur de l’utilisateur.
