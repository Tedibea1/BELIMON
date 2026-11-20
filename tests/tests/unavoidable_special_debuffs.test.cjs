'use strict';
// BELIMON: all status-causing specials apply through dodge, miss and Spectre
// intangibility; Purification still blocks them for both sides.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const ctx={window:{},console,Math,Date};
vm.createContext(ctx);
for(const name of ['bonuses.js','traps.js','combat.js']){
 vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
}
const C=ctx.window.TDWCombat;
const hero=(classId,{speed=10,force=80,hp=500}={})=>({
 classId,hp,maxHp:500,energy:100,stats:{force,rapidite:speed,constitution:0}
});
const cast=(p,e,action='special',enemyAction='defend',fx=null,rng=()=>.99)=>C.resolveTurn(
 p,e,action,{},rng,{turn:1,enemyAction,effects:fx||C.normalizeEffects()});
let checks=0;
const eq=(actual,wanted,label)=>{assert.equal(actual,wanted,label);checks++;};
const yes=(actual,label)=>{assert.ok(actual,label);checks++;};
const specs=[
 ['maudite','bloodCurse',v=>v?.startTurn===2 && v.expiresTurn===4],
 ['bagarreuse','siphon',v=>v?.expiresTurn===4 && v.nextTickAt===0],
 ['archere_arcanique','swordCons',v=>v===true],
 ['occultiste','curse',v=>v?.expiresTurn===5 && v.percent===0],
 ['envouteuse','powerLoss',v=>v?.startTurn===2 && v.expiresTurn===4 && v.amount===20]
];
eq(C.COST.special,5,'Special still costs 5 EN');
for(const [cls,key,valid] of specs){
 // Player launches spell against guaranteed dodge (200 RAP).
 const dodge=cast(hero(cls),hero('epeiste',{speed:200,force:100}));
 eq(dodge.details.player.dodged,true,cls+' player: hit dodged');
 eq(dodge.details.player.damage,0,cls+' player: no physical damage');
 eq(dodge.enemy.hp,500,cls+' player: HP unchanged');
 yes(valid(dodge.effects.enemy[key]),cls+' player: effect despite dodge');
 eq(dodge.player.energy,95,cls+' player: special energy spent');
 if(cls==='envouteuse')eq(dodge.effects.player.powerGain?.amount,20,'Power stealing buffs caster on dodge');

 // NPC launches the same spell against the player's guaranteed dodge.
 const npc=cast(hero('epeiste',{speed:200,force:100}),hero(cls),
   'defend','special');
 eq(npc.details.enemy.dodged,true,cls+' NPC: hit dodged');
 eq(npc.details.enemy.damage,0,cls+' NPC: no physical damage');
 eq(npc.player.hp,500,cls+' NPC: HP unchanged');
 yes(valid(npc.effects.player[key]),cls+' NPC: effect despite dodge');
 if(cls==='envouteuse')eq(npc.effects.enemy.powerGain?.amount,20,'NPC power stealing buffs caster');

 // A forced physical MISS also leaves the magical effect in place.
 const miss=cast(hero(cls),hero('epeiste',{speed:0,force:100}),
   'special','defend',null,()=>1);
 eq(miss.details.player.miss,true,cls+' player: physical MISS');
 yes(valid(miss.effects.enemy[key]),cls+' player: magic on MISS');

 // Spectre's active intangibility blocks the hit but not the magical effect.
 const fx=C.normalizeEffects();
 fx.enemy.intangible={startTurn:1,expiresTurn:2};
 const ghost=cast(hero(cls),hero('spectre',{speed:0,force:100}),
   'special','defend',fx,()=>.99);
 eq(ghost.details.player.dodged,true,cls+' versus intangible Spectre');
 yes(valid(ghost.effects.enemy[key]),cls+' magical status on intangible Spectre');
 eq(ghost.details.player.damage,0,cls+' Spectre still avoids direct damage');

 // A prior Purification blocks the effect, even when the hit misses.
 const guardedFx=C.normalizeEffects();
 guardedFx.enemy.purification={startTurn:1,expiresTurn:5};
 const guarded=cast(hero(cls),hero('epeiste',{speed:200,force:100}),
   'special','defend',guardedFx);
 yes(!guarded.effects.enemy[key],cls+' Purification blocks status');
 if(cls==='envouteuse')eq(guarded.effects.player.powerGain,null,'Purification blocks stolen-power buff');

 // Exorciste's same-turn precast shield blocks any status even at lower RAP.
 const exorcist=cast(hero(cls,{speed:200}),hero('exorciste',{speed:0,force:100}),
   'special','special');
 yes(!exorcist.effects.enemy[key],cls+' same-turn Exorciste special blocks status');
 eq(exorcist.effects.enemy.purification.expiresTurn,5,'Purification shield duration unchanged');

 // A successful direct hit still damages and applies its status.
 const hit=cast(hero(cls),hero('epeiste',{speed:0,force:100}));
 yes(hit.details.player.damage>0,cls+' direct physical hit still damages');
 yes(valid(hit.effects.enemy[key]),cls+' on-hit effect remains');
}
// Physical non-status specials stay hit-dependent.
{
 const miss=cast(hero('vampire',{hp:300}),hero('epeiste',{speed:200,force:100}));
 eq(miss.details.player.dodged,true,'Vampire physical strike is dodged');
 eq(miss.player.hp,300,'Vampire receives no heal from a dodged strike');
 const griffes=cast(hero('griffeuse'),hero('epeiste',{speed:200,force:100}));
 yes(griffes.details.player.miss||griffes.details.player.dodged,'Griffes fatales can still fail');
 const sword=cast(hero('epeiste'),hero('epeiste',{speed:200,force:100}));
 eq(sword.details.player.damage,0,'Épéiste special still deals no damage after dodge');
}
console.log('PASS '+checks+' vérifications : 5 malus inévitables, dégâts esquivables, Purification, deux camps.');
