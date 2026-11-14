# BELLYMON V15.3 — Prix de l’ascenseur

Nouvelle courbe : `P(n)=Math.max(1,Math.round(n*n/12))` en steaks. La formule exponentielle V14.4 est remplacée.

Le tarif réduit reste `halfEven(P(n−5))`. Les raccourcis restent réservés au niveau 1, sans bonus, sans soin, sans autres changements de combat ou d’économie.

## Contrôles
- 20 suites JavaScript réussies, incluant 2 103 vérifications ciblées sur les raccourcis V15.3.
- 84 contrôles navigateur Chromium réussis (320, 390 et 1 440 px), dont annulation, fonds insuffisants, débit transactionnel, sauvegarde et reprise.
- Intégralité des 180 sprites conservée.
