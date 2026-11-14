/* BELLYMON — V7 : nourrissage et évolution (moteur testable, sans DOM).
   Une seule montée de rang par validation ; les aliments entiers en trop ne
   sont pas consommés et les points débordant du dernier aliment sont reportés.
*/
(() => {
  'use strict';
  const RANKS=Object.freeze(['E','D','C','B','A','S']);
  const TARGETS=Object.freeze({E:100,D:180,C:260,B:380,A:520});
  const MULTIPLIERS=Object.freeze({E:0.68,D:0.82,C:1,B:1.35,A:1.80,S:2.45});
  const MORPH_BONUSES=Object.freeze({
    musclee:{force:6,rapidite:2,constitution:4},
    obese:{force:4,rapidite:2,constitution:6},
    chetive:{force:4,rapidite:6,constitution:2}
  });
  const FOOD_POINTS=Object.freeze({small:5,large:25});
  const finiteInt=n=>Number.isSafeInteger(n)&&n>=0;
  function planFeed(hero,food,type,requested){
    if(!hero || !RANKS.includes(hero.rank) || hero.rank==='S')throw Error('Rang maximum atteint.');
    if(!Object.hasOwn(FOOD_POINTS,type))throw Error('Nourriture inconnue.');
    if(!finiteInt(requested)||requested<1)throw Error('Quantité invalide.');
    if(!food || !finiteInt(food.small) || !finiteInt(food.large) || requested>food[type])throw Error('Stock insuffisant.');
    if(!finiteInt(hero.evolutionPoints))throw Error('Points d’évolution invalides.');
    const threshold=TARGETS[hero.rank],pointsPer=FOOD_POINTS[type];
    // N’utilise que le minimum d’aliments entiers permettant une évolution.
    const count=Math.min(requested,Math.max(0,Math.ceil((threshold-hero.evolutionPoints)/pointsPer)));
    const total=hero.evolutionPoints+count*pointsPer;
    const evolves=total>=threshold;
    return Object.freeze({type,requested,consumed:count,returned:requested-count,pointsPer,
      earned:count*pointsPer,threshold,evolves,rankBefore:hero.rank,
      rankAfter:evolves?RANKS[RANKS.indexOf(hero.rank)+1]:hero.rank,
      remaining:evolves?total-threshold:total,
      morphRequired:evolves&&hero.rank==='E'&&!hero.morph});
  }
  function applyFeed(hero,food,type,requested,morph,classes){
    const plan=planFeed(hero,food,type,requested);
    if(plan.morphRequired && !Object.hasOwn(MORPH_BONUSES,morph))throw Error('Spécialisation nécessaire avant l’évolution.');
    if(hero.rank!=='E' && !Object.hasOwn(MORPH_BONUSES,hero.morph))throw Error('Spécialisation de la waifu manquante.');
    if(!classes || !classes[hero.classId])throw Error('Classe introuvable.');
    const resultHero={...hero,stats:{...hero.stats}};
    const resultFood={...food,[type]:food[type]-plan.consumed};
    resultHero.evolutionPoints=plan.remaining;
    if(plan.evolves){
      const cls=classes[hero.classId];
      resultHero.rank=plan.rankAfter;
      if(plan.morphRequired)resultHero.morph=morph;
      const coef=MULTIPLIERS[plan.rankAfter];
      const steps=RANKS.indexOf(plan.rankAfter);
      const bonus=MORPH_BONUSES[resultHero.morph];
      for(const stat of ['force','rapidite','constitution'])
        resultHero.stats[stat]=Math.round(cls.stats[stat]*coef)+steps*bonus[stat];
      const newMaxHp=Math.round(cls.hp*coef);
      // Préserve le % de PV au lieu de soigner gratuitement un personnage en combat.
      resultHero.hp=hero.hp>0?Math.max(1,Math.min(newMaxHp,Math.round(hero.hp/Math.max(1,hero.maxHp)*newMaxHp))):0;
      resultHero.maxHp=newMaxHp;
    }
    return {hero:resultHero,food:resultFood,plan};
  }
  window.BellymonEvolution=Object.freeze({RANKS,TARGETS,MULTIPLIERS,MORPH_BONUSES,FOOD_POINTS,planFeed,applyFeed});
})();
