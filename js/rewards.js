/* BELLYMON V5 — butins deterministes et attribution atomique avec la sauvegarde.
   Module pur: aucune dependance DOM / temps / navigateur.
   Le bonus de collection est de +1 niveau (= +2 statistiques) pour toutes les waifus.
*/
(() => {
  'use strict';
  const RANK_REWARDS=Object.freeze({
    E:{small:1,large:0},D:{small:2,large:0},C:{small:3,large:0},
    B:{small:4,large:0},A:{small:5,large:0},S:{small:2,large:2}
  });
  const BONUS_KEYS=Object.freeze(['force','rapidite','constitution']);
  const validAmount=v=>Number.isSafeInteger(v)&&v>=0;
  function combatReward(rank){
    if(!Object.hasOwn(RANK_REWARDS,rank))throw Error('Rang de butin invalide');
    return {food:{...RANK_REWARDS[rank]},bonus:null};
  }
  function chestReward(random=Math.random){
    // Tirage 1: type de nourriture (60% petits, 40% gros).
    const small=random()<.60;
    const food=small?{small:2+Math.floor(random()*3),large:0}:
                     {small:0,large:1+Math.floor(random()*2)};
    // Tirage independant: 25% de chance de bonus permanent.
    const bonus=random()<.25?BONUS_KEYS[Math.floor(random()*3)]:null;
    return {food,bonus};
  }
  function isReward(reward){
    return !!(reward&&typeof reward==='object'&&!Array.isArray(reward)&&
      reward.food&&typeof reward.food==='object'&&
      validAmount(reward.food.small)&&validAmount(reward.food.large)&&
      (reward.bonus===null||BONUS_KEYS.includes(reward.bonus)));
  }
  function grant(data,reward){
    if(!isReward(reward))throw Error('Butin incorrect');
    const oldFood=data.food;
    if(!oldFood || !validAmount(oldFood.small) || !validAmount(oldFood.large))throw Error('Inventaire de nourriture incorrect');
    if(!data.bonuses)throw Error('Bonus de collection incorrects');
    for(const kind of ['small','large']){
      if(!Number.isSafeInteger(oldFood[kind]+reward.food[kind]))throw Error('Limite de nombre depassee');
    }
    if(reward.bonus && (!validAmount(data.bonuses[reward.bonus]) || !Number.isSafeInteger(data.bonuses[reward.bonus]+1)))throw Error('Limite de bonus depassee');
    oldFood.small+=reward.food.small;
    oldFood.large+=reward.food.large;
    if(reward.bonus)data.bonuses[reward.bonus]+=1;
  }
  window.BellymonRewards=Object.freeze({RANK_REWARDS,BONUS_KEYS,combatReward,chestReward,isReward,grant});
})();
