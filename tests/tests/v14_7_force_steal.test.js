const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const ctx={window:{},console,Math,Date};vm.createContext(ctx);
for(const f of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../js',f),'utf8'),ctx,{filename:f});
const C=ctx.window.TDWCombat, rng=()=>.5;
const make=(id,force,rapidite=20)=>({classId:id,hp:9999,maxHp:9999,energy:100,stats:{force,rapidite,constitution:20}});
const turn=(s,action,enemyAction,t)=>C.resolveTurn(s.player,s.enemy,action,{},rng,{turn:t,effects:s.effects,enemyAction});
let checks=0;const check=(cond,msg)=>{assert.ok(cond,msg);checks++};
check(C.SPECIALS.envouteuse.description.includes('20 %'),'description : pourcentage de Force');
// V15.19 : 20 % de la Force effective, sans plafond fixe de 20 pts.
for(const enemyForce of [0,1,8,19,20,21,60,100,500]){
 const s=turn({player:make('envouteuse',40,90),enemy:make('epeiste',enemyForce,10),effects:C.normalizeEffects()},'special','defend',1);
 const expected=Math.round(enemyForce*.20);
 check(s.effects.player.powerGain.amount===expected,`gain exact pour FOR ${enemyForce}`);
 check(s.effects.enemy.powerLoss.amount===expected,`perte identique pour FOR ${enemyForce}`);
 check(C.penaltyFor(s.effects.player,1).forceFlat===0,'pas de vol actif sur le tour de lancement');
 check(C.penaltyFor(s.effects.player,2).forceFlat===expected,'gain au tour suivant');
 check(C.penaltyFor(s.effects.enemy,2).forceFlat===-expected,'perte au tour suivant');
 check(C.combatStats(s.enemy,{},C.penaltyFor(s.effects.enemy,2)).force>=0,'jamais de Force négative');
 check(s.player.energy===95,'coût de 5 EN');
}
// Pas de cumul, redémarrage au tour suivant, 3 tours d'effet.
{
 let s={player:make('envouteuse',10,90),enemy:make('epeiste',180,10),effects:C.normalizeEffects()};
 s=turn(s,'special','defend',1);
 check(s.effects.player.powerGain.startTurn===2 && s.effects.player.powerGain.expiresTurn===4,'actif tours 2-4');
 check(C.penaltyFor(s.effects.player,2).forceFlat===36,'transfert actif au tour 2');
 s=turn(s,'special','defend',2);
 check(s.effects.player.powerGain.amount===36,'pas de cumul au renouvellement');
 check(s.effects.enemy.powerLoss.amount===36,'pas de double perte au renouvellement');
 check(s.effects.player.powerGain.startTurn===3 && s.effects.player.powerGain.expiresTurn===5,'renouvellement tours 3-5');
 check(C.penaltyFor(s.effects.player,2).forceFlat===0,'relance préparée pour tour suivant');
 check(C.penaltyFor(s.effects.player,3).forceFlat===36,'bonus actif après renouvellement');
}
// Purification empêche le vol lorsque la cible est immunisée.
{
 const fx=C.normalizeEffects();fx.enemy.purification={startTurn:1,expiresTurn:2};
 const s=turn({player:make('envouteuse',30,90),enemy:make('exorciste',120,10),effects:fx},'special','defend',1);
 check(!s.effects.player.powerGain && !s.effects.enemy.powerLoss,'Purification bloque le transfert');
}
console.log(`V15.19 VOL À 20 % : ${checks} contrôles réussis`);
