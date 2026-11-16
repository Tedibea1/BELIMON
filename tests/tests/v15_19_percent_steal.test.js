'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../..'),ctx={window:{},console,Math,Date};
vm.createContext(ctx);
for(const f of ['bonuses.js','traps.js','combat.js','combat-ui.js'])
 vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
const C=ctx.window.TDWCombat,UI=ctx.window.BellymonCombatUI;
const h=(classId,{force=30,rapidite=10,constitution=0,hp=2000,maxHp=2000,energy=100}={})=>({classId,hp,maxHp,energy,stats:{force,rapidite,constitution}});
const turn=(p,e,a='special',b='defend',t=1,fx=null,bonuses={})=>C.resolveTurn(p,e,a,bonuses,()=>.99,{turn:t,enemyAction:b,effects:fx});
let n=0;const eq=(a,b,m)=>{assert.equal(a,b,m);n++};
eq(C.COST.special,5,'special cost unchanged');
eq(C.SPECIALS.envouteuse.description.includes('20 %'),true,'description');
for(const force of [0,1,4,5,7,19,20,21,49,50,60,100,200,500,600]){
 const s=turn(h('envouteuse',{force:40,rapidite:80}),h('epeiste',{force,rapidite:0}));
 const v=Math.round(force*.2);
 eq(s.effects.player.powerGain.amount,v,'gain 20% of '+force);
 eq(s.effects.enemy.powerLoss.amount,v,'loss 20% of '+force);
 eq(C.penaltyFor(s.effects.player,1).forceFlat,0,'no gain on cast');
 eq(C.penaltyFor(s.effects.player,2).forceFlat,v,'gain next turn');
 eq(C.penaltyFor(s.effects.enemy,2).forceFlat,(v===0?0:-v),'loss next turn');
 eq(s.player.energy,95,'unchanged energy price');
}
{
 let s=turn(h('envouteuse',{force:30,rapidite:80}),h('epeiste',{force:200,rapidite:0}));
 eq(s.effects.enemy.powerLoss.amount,40,'200 FOR -> 40');
 s=turn(s.player,s.enemy,'special','defend',2,s.effects);
 eq(s.effects.enemy.powerLoss.amount,40,'recast excludes previous loss');
 eq(s.effects.player.powerGain.amount,40,'recast no stacking');
 eq(s.effects.player.powerGain.startTurn,3,'recast begins turn 3');
 eq(s.effects.player.powerGain.expiresTurn,5,'recast expires turn 5');
 eq(C.penaltyFor(s.effects.enemy,6).forceFlat,0,'expires turn 6');
 eq(s.player.energy,90,'two casts cost ten');
}
{
 const s=turn(h('epeiste',{force:180,rapidite:0}),h('envouteuse',{force:10,rapidite:30}),'defend','special',1,null,{force:10});
 eq(s.effects.player.powerLoss.amount,40,'NPC steals 20% of effective 200 FOR including collection bonus');
 eq(s.effects.enemy.powerGain.amount,40,'NPC gains same amount');
}
{
 const dodge=turn(h('envouteuse',{force:40,rapidite:10}),h('epeiste',{force:100,rapidite:200}));
 eq(dodge.details.player.dodged,true,'enemy dodge');
 eq(dodge.effects.enemy.powerLoss,null,'no transfer on dodge');
 const fx=C.normalizeEffects();fx.enemy.purification={startTurn:1,expiresTurn:5};
 const purified=turn(h('envouteuse',{force:40,rapidite:90}),h('epeiste',{force:100,rapidite:0}),'special','defend',1,fx);
 eq(purified.effects.player.powerGain,null,'Purification blocks transfer');
 eq(purified.effects.enemy.powerLoss,null,'Purification blocks debuff');
}
{
 const s=turn(h('envouteuse',{force:30,rapidite:90}),h('epeiste',{force:150,rapidite:0}));
 const effects=UI.describe({turn:1,effects:s.effects},1,[]);
 eq(effects.sides.player.some(x=>x.label.includes('FOR +30')),true,'UI real amount');
 eq(effects.sides.enemy.some(x=>x.label.includes('FOR −30')),true,'UI real loss');
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
eq(html.includes('V16.1.6 LAB')&&html.includes('VERSION 16.1.6 TEST'),true,'version display');
console.log('BELLYMON V15.19 : '+n+' contrôles réussis');
