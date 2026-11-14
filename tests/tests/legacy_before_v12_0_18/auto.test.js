const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{},Math};vm.createContext(c);
vm.runInContext(fs.readFileSync(__dirname+'/../js/bonuses.js','utf8'),c);
vm.runInContext(fs.readFileSync(__dirname+'/../js/combat.js','utf8'),c);
vm.runInContext(fs.readFileSync(__dirname+'/../js/auto.js','utf8'),c);
const A=c.window.BellymonAuto,C=c.window.TDWCombat;
let checks=0;
function ok(x,label){assert.ok(x,label);checks++;}
const mk=(classId,energy=100,hp=100)=>({classId,energy,hp,maxHp:100});
let e=mk('bagarreuse'),fx=C.normalizeEffects();
for(const cl of ['epeiste','bagarreuse','archere_arcanique','occultiste','pretresse','griffeuse']){
 for(const en of [0,1,2,3,4,5,10,100]){
  const h=mk(cl,en);
  for(let turn=1;turn<=20;turn++)for(const r of [0,.1,.22,.4,.51,.72,.87,.98]){
   const act=A.chooseAction(h,e,turn,fx,()=>r);
   ok(['light','heavy','special','defend'].includes(act),`safe action ${cl}`);
   ok(!['capture','idle','switch','advance'].includes(act),'no unauthorized command');
   ok(act==='special'?C.canUseSpecial(h,en,turn,fx.player):C.canPay(en,act),'no unaffordable action');
  }
 }
}
ok(A.chooseAction(mk('pretresse',5,25),e,1,fx,()=>.99)==='special','priestess heals very low hp');
ok(A.chooseAction(mk('pretresse',5,100),e,1,fx,()=>0)!=='special','priestess does not heal at full hp');
ok(A.chooseAction(mk('occultiste',5),e,1,fx,()=>0)==='special','occultist opens with curse');
ok(A.chooseAction(mk('occultiste',5),e,2,fx,()=>0)==='special','occultist may cast without cooldown when curse absent');
fx=C.normalizeEffects();fx.enemy.curse={expiresTurn:5,percent:12,nextTickAt:0};
ok(A.chooseAction(mk('occultiste',5),e,2,fx,()=>0)!=='special','AUTO avoids early curse recast');
ok(A.chooseAction(mk('occultiste',5),e,4,fx,()=>0)==='special','AUTO refreshes curse with two turns remaining');
ok(A.chooseAction(mk('epeiste',0),e,2,fx,()=>0)==='defend','no energy => defense');
ok(A.deadlock(mk('epeiste',0),mk('bagarreuse',0)),'stalled combat detected');
ok(!A.deadlock(mk('epeiste',0),mk('bagarreuse',1)),'not stalled when enemy can act');
ok(A.chooseAction(mk('epeiste',0,0),e,1,fx,()=>0)===null,'KO character cannot act');
console.log(`✅ ${checks} tests AUTO V10 réussis`);
