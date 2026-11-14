/* V12.0.15 : attaques plus coûteuses, siphon renforcé, renouvellement et IA. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['bonuses.js','traps.js','combat.js','auto.js','combat-ui.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),ctx);
const C=ctx.window.TDWCombat,A=ctx.window.BellymonAuto,U=ctx.window.BellymonCombatUI;
let n=0;
const ok=(v,label)=>{assert.ok(v,label);n++};
const eq=(v,e,label)=>{assert.deepEqual(JSON.parse(JSON.stringify(v)),e,label);n++};
const ch=(classId,energy=100)=>({classId,energy,hp:1000,maxHp:1000,stats:{force:20,rapidite:0,constitution:100}});
const rng=()=>.99;
eq(C.COST,{light:2,heavy:3,special:5,defend:0,idle:0},'only light cost changes');
for(const energy of [0,1,2,3,4,5]){
 eq(C.canPay(energy,'light'),energy>=2,`canPay light ${energy}`);
 eq(C.canPay(energy,'heavy'),energy>=3,`canPay heavy ${energy}`);
 eq(C.canPay(energy,'special'),energy>=5,`canPay special ${energy}`);
 const ai=C.chooseEnemyAction(energy,()=>0,ch('epeiste',energy));
 eq(ai,energy>=2?'light':'defend',`enemy obeys allowed actions at ${energy} EN`);
 const auto=A.chooseAction(ch('griffeuse',energy),ch('epeiste'),1,{},()=>.6);
 eq(auto,energy>=2?'light':'defend',`auto obeys allowed actions at ${energy} EN`);
}
const enemy=ch('epeiste',0);
for(const [act,cost] of [['light',2],['heavy',3],['special',5],['defend',0]]){
 const h=ch('bagarreuse',100);
 const res=C.resolveTurn(h,enemy,act,{},rng,{turn:1});
 eq(res.player.energy,100-cost,`real round ${act} costs ${cost}`);
}
assert.throws(()=>C.resolveTurn(ch('bagarreuse',1),enemy,'light',{},rng,{turn:1}),/Énergie insuffisante/);n++;
const h=ch('bagarreuse'),victim=ch('epeiste');
const first=C.resolveTurn(h,victim,'special',{},rng,{turn:1});
eq(first.effects.enemy.siphon,{expiresTurn:4,nextTickAt:0},'siphon begins for four turns');
ok(first.summary.includes('−3 EN/s'),'action message includes updated drain');
let fx=first.effects;
let t=C.tickTimedEffects(fx,h,victim,1000,2);fx=t.effects;
eq(victim.energy,100,'first tick only arms countdown');
for(let s=1;s<=34;s++){
 t=C.tickTimedEffects(fx,h,victim,1000+s*1000,2);fx=t.effects;
 eq(victim.energy,Math.max(0,100-3*s),`second ${s}: ${Math.max(0,100-3*s)} EN`);
 eq(t.changes.siphon.enemy,Math.min(3,Math.max(0,100-3*(s-1))),`per-second drain is exactly 3 at second ${s}`);
}
t=C.tickTimedEffects(fx,h,victim,23000,2);fx=t.effects;
eq(victim.energy,0,'energy remains clamped at zero');
eq(t.changes.siphon.enemy,0,'zero energy cannot go negative');
const refreshed=C.resolveTurn(ch('bagarreuse'),ch('epeiste',0),'special',{},rng,{turn:2,effects:fx});
eq(refreshed.effects.enemy.siphon.expiresTurn,5,'renewal extends four-turn lifespan');
eq(Object.keys(JSON.parse(JSON.stringify(refreshed.effects.enemy.siphon))).sort(),['expiresTurn','nextTickAt'],'effect not duplicated');
const hud=U.describe({turn:2,effects:refreshed.effects},1,[]);
ok(hud.sides.enemy.some(x=>x.detail.includes('−3 énergies')),'HUD shows five per second');
// Renewed effect drains three and no more: 3 active seconds = 9 EN (not 18).
const e2=ch('epeiste');fx=refreshed.effects;
t=C.tickTimedEffects(fx,h,e2,30000,3);fx=t.effects;
for(let s=1;s<=3;s++){t=C.tickTimedEffects(fx,h,e2,30000+s*1000,3);fx=t.effects;}
eq(e2.energy,91,'refresh does not double drain');
const cur=C.resolveTurn(ch('occultiste'),ch('bagarreuse',0),'special',{},rng,{turn:1});
eq(cur.effects.enemy.curse.percent,0,'occultist debuff untouched');
ok(C.SPECIALS.bagarreuse.description.includes('3 énergies'),'skill description updated');
console.log('✅ V12.0.15 équilibrage :',n,'assertions');
