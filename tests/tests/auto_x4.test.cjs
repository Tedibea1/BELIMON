/* BELIMON: AUTO ×4 fixed, manual ×1, spells that tick per game second. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const load=name=>fs.readFileSync(path.join(root,'js',name),'utf8');
const sources={
 game:load('game.js'),motion:load('v16-motion.js'),auto:load('auto.js'),
 combat:load('combat.js'),css:fs.readFileSync(path.join(root,'css/v16.css'),'utf8')
};
const ctx={window:{},Math,Date,console};
vm.createContext(ctx);
for(const file of ['bonuses.js','traps.js','combat.js','auto.js'])
 vm.runInContext(load(file),ctx,{filename:file});
const C=ctx.window.TDWCombat,A=ctx.window.BellymonAuto;
let checks=0;
const yes=(v,msg)=>{assert.ok(v,msg);checks++};
const equal=(a,b,msg)=>{assert.equal(a,b,msg);checks++};
equal(A.SPEED,4,'One fixed ×4 speed in the existing AUTO controller');
yes(sources.game.includes('const AUTO_SPEED = AUTO.SPEED;'),'Game uses shared multiplier');
for(const n of [120,260,850,1450,1800])
 yes(sources.game.includes('Math.round('+n+'/AUTO_SPEED)'),'Automatic timer scales '+n);
yes(sources.game.includes('Math.round(EVENT_ANNOUNCEMENT_MS/AUTO_SPEED)'),'AUTO announcements accelerate');
yes(sources.game.includes('data.autoCombat===true?1000/AUTO_SPEED:1000'),'Timed skills scale when AUTO is enabled');
yes(sources.game.includes("},50);"),'Ticker resolution allows quarter-second magic ticks');
yes(sources.game.includes("autoEnabled?'×4':'OFF'"),'AUTO buttons indicate ×4 without a selector');
yes(sources.game.includes("document.body.classList.toggle('belimon-auto-x4',autoEnabled)"),'Visual acceleration toggles with AUTO');
yes(sources.motion.includes('duration=auto?Math.round(850/autoSpeed)'),'AUTO reveal duration accelerated');
yes(sources.motion.includes('(auto?autoSpeed:1)'),'AUTO reveal finish grace period accelerated');
yes(sources.css.includes('body.belimon-auto-x4 .hit-pop'),'AUTO impacts accelerated');

const hero=()=>({energy:100,hp:300,maxHp:300});
const makeFx=()=>{
 const fx=C.normalizeEffects();
 fx.player.curse={expiresTurn:6,percent:0,nextTickAt:0};
 fx.player.siphon={expiresTurn:6,nextTickAt:0};
 return fx;
};
let p=hero(),e=hero(),fx=makeFx();
let first=C.tickTimedEffects(fx,p,e,1000,1,250);
equal(first.effects.player.curse.nextTickAt,1250,'AUTO curse first pulse in 250ms');
equal(first.effects.player.siphon.nextTickAt,1250,'AUTO siphon first pulse in 250ms');
equal(p.energy,100,'No immediate lost energy when applying clock');
equal(first.effects.player.curse.percent,0,'No immediate curse loss');
let before=C.tickTimedEffects(first.effects,p,e,1249,1,250);
equal(before.effects.player.curse.percent,0,'No early pulse');
equal(p.energy,100,'No early siphon');
let second=C.tickTimedEffects(before.effects,p,e,1250,1,250);
equal(second.effects.player.curse.percent,2,'Curse one +2% pulse at 250ms');
equal(p.energy,97,'Siphon one -3 energy pulse at 250ms');
equal(second.effects.player.curse.nextTickAt,1500,'AUTO pulse repeats at 250ms');
let third=C.tickTimedEffects(second.effects,p,e,1500,1,250);
equal(third.effects.player.curse.percent,4,'Second curse pulse +2%, not quadruple damage');
equal(p.energy,94,'Second siphon pulse -3');
p=hero();fx=makeFx();
first=C.tickTimedEffects(fx,p,e,1000,1);
equal(first.effects.player.curse.nextTickAt,2000,'Manual curse remains 1 second');
equal(first.effects.player.siphon.nextTickAt,2000,'Manual siphon remains 1 second');
second=C.tickTimedEffects(first.effects,p,e,1250,1);
equal(second.effects.player.curse.percent,0,'Manual curse does not tick early');
equal(p.energy,100,'Manual siphon does not tick early');
third=C.tickTimedEffects(second.effects,p,e,2000,1);
equal(third.effects.player.curse.percent,2,'Manual curse still ticks after 1 second');
equal(p.energy,97,'Manual siphon still ticks after 1 second');
yes(sources.game.includes('if(effect)effect.nextTickAt=0;'),'Switching AUTO resets deadlines without deleting spells');
yes(sources.game.includes('if(!resultOverlay.hidden){'),'Rewards still have a displayed result');
yes(sources.game.includes('if(MOTION?.isBusy())return;'),'AUTO never skips ongoing reveal');
yes(sources.game.includes('if((ev.reward && !ev.rewardAcknowledged)'), 'AUTO waits for reward acknowledgement');
console.log('PASS '+checks+' checks: AUTO ×4, unchanged manual, accelerated animations, preserved rewards and timed magic.');
