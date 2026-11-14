/* V12.0.8 : Siphon d'énergie = 4 tours, relançable, sans cumul. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/combat.js'),'utf8'),context);
const C=context.window.TDWCombat;
const hero=classId=>({classId,stats:{force:1,rapidite:0,constitution:10},maxHp:1000,hp:1000,energy:100});
let n=0;
const check=(test,message)=>{assert.ok(test,message);n++};
const rng=()=>0.99;
const player=hero('bagarreuse'),enemy=hero('epeiste');
let results=[],a=player,b=enemy,effects=C.normalizeEffects();
for(let turn=1;turn<=4;turn++){
  const result=C.resolveTurn(a,b,turn===1?'special':'defend',{},rng,{turn,effects});
  results.push(result);a=result.player;b=result.enemy;effects=result.effects;
  if(turn===1){check(result.summary.includes('4 tours'),'Description quatre tours');check(result.effects.enemy.siphon.expiresTurn===4,'Échéance tour 4');}
  if(turn>=2 && turn<=3)check(result.effects.enemy.siphon.expiresTurn===4,`Tour ${turn} encore actif`);
  if(turn===4)check(result.effects.enemy.siphon===null,'Expiration après le 4e tour');
}
// Une relance au troisième tour remplace l'effet existant, elle ne l'empile pas.
a=hero('bagarreuse');b=hero('epeiste');effects=C.normalizeEffects();
for(let turn=1;turn<=6;turn++){
 const result=C.resolveTurn(a,b,[1,3].includes(turn)?'special':'defend',{},rng,{turn,effects});
 a=result.player;b=result.enemy;effects=result.effects;
 if(turn===3){check(result.effects.enemy.siphon.expiresTurn===6,'Relance remet quatre tours depuis le tour 3');check(Object.keys(result.effects.enemy.siphon).length===2,'Un seul effet siphon, non cumulable');}
 if(turn===5)check(result.effects.enemy.siphon.expiresTurn===6,'Toujours actif au cinquième');
 if(turn===6)check(result.effects.enemy.siphon===null,'Expire au 6e tour après relance');
}
console.log('✅ V12.0.8 siphon :',n,'vérifications réussies');
