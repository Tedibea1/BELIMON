/* BELLYMON V15.13 — Capture manuelle en combat, seuils rééquilibrés.
   Capture : 2 EN, aucun butin. Sur échec, l'ennemie joue son tour normalement.
   Seuils appliqués au pourcentage entier arrondi au supérieur, afin de couvrir
   précisément toutes les valeurs de PV sans zone intermédiaire.
*/
(() => {
  'use strict';
  const combat=window.TDWCombat;
  if(!combat)throw Error('Le moteur de combat est introuvable.');
  const COST=2;
  function chance(enemy){
    if(!enemy || !Number.isFinite(enemy.maxHp) || enemy.maxHp<=0 || !Number.isFinite(enemy.hp) || enemy.hp<=0)return 0;
    const percent=Math.min(100,Math.ceil(100*enemy.hp/enemy.maxHp));
    if(percent<=10)return 85;
    if(percent<=30)return 55;
    if(percent<=50)return 30;
    if(percent<=75)return 15;
    return 5;
  }
  function canAttempt(player,enemy){return !!(player && player.hp>0 && Number.isFinite(player.energy) && player.energy>=COST && chance(enemy)>0);}
  function attempt(player,enemy,bonuses={},rng=Math.random,context={}){
    if(!canAttempt(player,enemy))throw Error('Capture impossible : PV adverses ou énergie insuffisants.');
    const rate=chance(enemy);
    // Le tirage de capture est effectué avant l'action ennemie, laquelle est
    // toujours préparée en cas d'échec via le moteur normal du combat.
    const successful=rng()*100<rate;
    const spent={...player,energy:player.energy-COST};
    if(successful){
      return {success:true,result:'captured',chance:rate,player:spent,enemy:{...enemy},
        effects:combat.normalizeEffects(context.effects),aiAction:null,
        summary:`🎯 Capture réussie ! Une nouvelle waifu rejoint ta collection (chance ${rate} %).`};
    }
    // 'idle' ne donne aucune attaque ni défense au joueur. L'IA agit, avec
    // ses propres compétences, consommations d'énergie et effets persistants.
    const turn=combat.resolveTurn(spent,enemy,'idle',bonuses,rng,context);
    // Une tentative ratée occupe la première ligne ; la riposte ennemie
    // débute sur la seconde, comme lors d'une attaque ou d'une défense.
    const retaliation=turn.summary.split('\n').slice(1).join('\n').trim();
    return {...turn,success:false,chance:rate,
      summary:`🎯 Capture échouée (${rate} %).${retaliation?'\n'+retaliation:''}`};
  }
  window.BellymonCapture=Object.freeze({COST,chance,canAttempt,attempt});
})();
