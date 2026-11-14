/* V12.0.10 : malus en secondes, renouvellement, durée, compatibilité. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['traps.js','combat.js','auto.js','combat-ui.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),ctx);
const C=ctx.window.TDWCombat,A=ctx.window.BellymonAuto,U=ctx.window.BellymonCombatUI;
const plain=x=>JSON.parse(JSON.stringify(x));
let checks=0;
function eq(a,b,m){assert.deepEqual(plain(a),b,m);checks++;}
function ok(a,m){assert.ok(a,m);checks++;}
const m=(classId,energy=100)=>({classId,energy,hp:1000,maxHp:1000,stats:{force:50,rapidite:30,constitution:20}});
const zero=()=>.99;
let occult=m('occultiste'),target=m('epeiste');target.energy=0;
let spell=C.resolveTurn(occult,target,'special',{},zero,{turn:1});
let fx=spell.effects;
eq(spell.player.energy,95,'first cast costs 5 energy');
eq(fx.enemy.curse,{expiresTurn:5,percent:0,nextTickAt:0},'initial curse effect');
ok(C.canUseSpecial(occult,5,2,fx.player),'no cooldown');
ok(!C.canUseSpecial(occult,4,2,fx.player),'energy cost still applies');
let t=C.tickTimedEffects(fx,occult,target,1000,2);fx=t.effects;
eq(t.changes.curse.enemy,0,'arming does not apply percentage');
eq(fx.enemy.curse.nextTickAt,2000,'tick in 1000ms');
for(let k=1;k<=12;k++){
  t=C.tickTimedEffects(fx,occult,target,1000+k*1000,2);fx=t.effects;
  eq(fx.enemy.curse.percent,k*2,`second ${k} => ${k*2}%`);
  eq(t.changes.curse.enemy,2,'two percent per second');
}
let refresh=C.resolveTurn({...spell.player},target,'special',{},zero,{turn:2,effects:fx});
eq(refresh.effects.enemy.curse.expiresTurn,6,'refresh five turn lifespan');
eq(refresh.effects.enemy.curse.percent,24,'refresh preserves existing −24%');
eq(refresh.effects.enemy.curse.nextTickAt,14000,'refresh preserves cadence');
eq(refresh.player.energy,90,'each cast consumes energy');
ok(refresh.summary.includes('renouvelée'),'refresh text distinct from initial cast');
fx=refresh.effects;
for(let k=13;k<=25;k++){
 t=C.tickTimedEffects(fx,occult,target,1000+k*1000,3);fx=t.effects;
}
eq(fx.enemy.curse.percent,50,'max debuff exactly 50 percent');
eq(C.penaltyFor(fx.enemy,3),{force:.5,rapidite:.5,constitution:.5},'all three stats -50%');
ok(!C.timedTickDue(fx,30000),'no extra ticking after curse reaches 50%');
refresh=C.resolveTurn({...refresh.player},target,'special',{},zero,{turn:3,effects:fx});
eq(refresh.effects.enemy.curse.percent,50,'recast at cap does not stack to -100%');
eq(refresh.effects.enemy.curse.expiresTurn,7,'recast at cap refreshes duration');
fx=refresh.effects;
for(let k=4;k<=7;k++)fx=C.resolveTurn(occult,target,'defend',{},zero,{turn:k,effects:fx}).effects;
eq(fx.enemy.curse,null,'malus expires at end of fifth turn including last recast');
// Old saved combat from V12.0.9: legacy curse starts on turn 1, upgraded on current turn.
const old={enemy:{curse:{startTurn:1}},player:{lastOccultTurn:1}};
fx=C.normalizeEffects(old,3);
eq(fx.enemy.curse,{expiresTurn:5,percent:30,nextTickAt:0},'legacy save converted using current turn');
ok(C.canUseSpecial(occult,100,3,fx.player),'legacy cooldown cleared');
// Siphon: -3 EN per active second (current V12.0.16 balance), no double effect on renew, cap at 0 EN.
const brawler=m('bagarreuse'),victim=m('epeiste');victim.energy=7;
let r=C.resolveTurn(brawler,{...victim,energy:7},'special',{},zero,{turn:1});
fx=r.effects;victim.energy=7;
eq(fx.enemy.siphon.expiresTurn,4,'siphon four turns');
t=C.tickTimedEffects(fx,brawler,victim,100,2);fx=t.effects;
eq(victim.energy,7,'arming siphon no immediate drain');
for(let s=1;s<=4;s++){
 t=C.tickTimedEffects(fx,brawler,victim,100+s*1000,2);fx=t.effects;
 eq(victim.energy,Math.max(0,7-3*s),`siphon after ${s}s`);
}
const again=C.resolveTurn({...r.player},m('epeiste',100),'special',{},zero,{turn:2,effects:fx});
eq(again.effects.enemy.siphon.expiresTurn,5,'siphon refreshed, not stacked');
eq(Object.keys(plain(again.effects.enemy.siphon)).sort(),['expiresTurn','nextTickAt'],'siphon remains one effect');
// Both simultaneous effects update in one clock tick with independent targets.
const both=C.normalizeEffects({player:{siphon:{expiresTurn:9,nextTickAt:2000}},enemy:{curse:{expiresTurn:9,percent:12,nextTickAt:2000}}});
const h=m('griffeuse'),e=m('occultiste');
t=C.tickTimedEffects(both,h,e,2000,3);
eq(h.energy,97,'siphon can affect player');
eq(t.effects.enemy.curse.percent,14,'curse can affect enemy in same tick');
eq(t.changes.siphon.player,3,'energy change reported');
eq(t.changes.curse.enemy,2,'stat change reported');
const hud=U.describe({turn:2,effects:t.effects},1,[]);
ok(hud.sides.player[0].detail.includes('−3 énergies'),'HUD siphon updated');
ok(hud.sides.enemy[0].label.includes('−14%'),'HUD curse current percentage');
ok(hud.sides.enemy[0].detail.includes('sans cumuler'),'HUD explains refresh');
// Auto does not recast every turn, but can refresh near the end.
const ae=C.normalizeEffects({enemy:{curse:{expiresTurn:5,percent:18,nextTickAt:100}}});
ok(A.chooseAction(m('occultiste'),e,2,ae,()=>0)!=='special','AUTO no unnecessary curse refresh');
eq(A.chooseAction(m('occultiste'),e,4,ae,()=>0),'special','AUTO refresh near expiration');
console.log('✅ V12.0.10 chronomètres de combat :',checks,'assertions');
