/* BELLYMON V10 — Décisions du combat automatique.
   Aucune capture ni changement de waifu. La navigation AUTO est pilotée par game.js.
   Module pur pour tester les décisions indépendamment de l'interface. */
(() => {
  'use strict';
  const COMBAT = window.TDWCombat;
  if (!COMBAT) throw Error('Moteur de combat manquant pour AUTO.');
  // Une seule lecture aléatoire par décision évite les choix instables.
  function chooseAction(hero, enemy, turn, effects, rng = Math.random) {
    if (!hero || hero.hp <= 0 || !enemy || enemy.hp <= 0) return null;
    const effect = COMBAT.normalizeEffects(effects,turn);
    const allowedSpecial = COMBAT.canUseSpecial(hero, hero.energy, turn, effect.player);
    const canHeavy = COMBAT.canPay(hero.energy, 'heavy');
    const canLight = COMBAT.canPay(hero.energy, 'light');
    const roll = Math.min(.999999, Math.max(0, rng()));
    if(hero.energy < COMBAT.COST.light)return 'defend';

    // La Prêtresse soigne seulement en cas de blessure, jamais à PV pleins.
    if (hero.classId === 'pretresse' && allowedSpecial) {
      const hpRatio = hero.hp / Math.max(1, hero.maxHp);
      if (hpRatio <= .30 || (hpRatio <= .55 && roll < .78)) return 'special';
    }
    // Pour les effets non cumulables, priorité à l'application initiale.
    if (allowedSpecial) {
      const enemyFx = effect.enemy;
      if (hero.classId === 'occultiste' && (!enemyFx.curse || enemyFx.curse.expiresTurn-turn<=1) && roll < .76) return 'special';
      if (hero.classId === 'epeiste' && !enemyFx.swordCons && roll < .67) return 'special';
      if (hero.classId === 'bagarreuse' && !enemyFx.siphon && roll < .55) return 'special';
      if (['archere_arcanique','griffeuse'].includes(hero.classId) && roll < .38) return 'special';
      if(hero.classId==='vampire' && hero.hp<hero.maxHp*.8 && roll<.72)return 'special';
      if(hero.classId==='spectre' && (!effect.player.intangible || effect.player.intangible.expiresTurn<turn) && roll<.72)return 'special';
      if(hero.classId==='nemesis' && (!effect.player.mirror || effect.player.mirror.expiresTurn<turn) && roll<.62)return 'special';
      if(hero.classId==='maudite' && (!effect.enemy.bloodCurse || effect.enemy.bloodCurse.expiresTurn<turn) && roll<.66)return 'special';
      if(hero.classId==='envouteuse' && (!effect.player.powerGain || effect.player.powerGain.expiresTurn<turn+1) && roll<.70)return 'special';
      if(hero.classId==='exorciste' && !effect.player.purification && (effect.player.curse || effect.player.siphon || effect.player.swordCons || effect.player.bloodCurse || effect.player.powerLoss) && roll<.88)return 'special';
    }
    // Défense occasionnelle, plus fréquente quand les PV sont bas.
    const hpRatio = hero.hp / Math.max(1, hero.maxHp);
    if (roll >= .93 || (hpRatio <= .35 && roll >= .83)) return 'defend';
    if (canHeavy && roll < .53) return 'heavy';
    if (canLight) return 'light';
    // L'AUTO conserve la progression des étages ; seul le choix d'action change.
    return 'defend';
  }
  function deadlock(hero, enemy) {
    return !!hero && !!enemy && hero.energy === 0 && enemy.energy === 0;
  }
  window.BellymonAuto = Object.freeze({chooseAction,deadlock});
})();
