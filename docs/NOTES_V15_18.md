# BELLYMON V15.18 — Malédiction du sang inesquivable

## Règle validée
**Maudite — Malédiction du sang** conserve sa frappe initiale **Force ×0,5** : le coup peut être esquivé ou évité par intangibilité, et ses dégâts directs sont alors annulés. En revanche, **la malédiction est appliquée même si l'attaque ne touche pas**, dès lors que la Maudite a effectivement lancé sa compétence.

Effet inchangé : **−10 % des PV maximum** à chaque action offensive de la cible pendant les trois tours suivant l'activation (T+1 à T+3), y compris si l'attaque de la cible rate, sans cumul si le sort est relancé.

**Purification reste le contre naturel** : elle bloque la pose d'un nouveau malus et peut dissiper un malus existant. Les autres classes n'acquièrent aucune nouvelle propriété inesquivable.

Les dégâts directs, le coefficient ×0,5, le coût de 5 énergie, les rangs, les statistiques, les protections et la durée de la malédiction restent inchangés.

## Interface et tests
- Description de la compétence mise à jour dans le moteur et le Guide.
- Détail du statut de combat actualisé.
- Version visible V15.18.
- Nouveau test `v15_18_inesquivable_blood_curse.test.js` : coups esquivés, toucher direct, intangibilité, Purification immédiate et préalable, Maudite PNJ, durée et renouvellement, élimination avant d'agir et isolation des autres classes.
- Libellés des tests historiques actualisés pour ne pas revendiquer une règle abrogée.
