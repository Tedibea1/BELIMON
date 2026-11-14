const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{},Math};vm.createContext(context);
for(const mod of ['combat','capture'])vm.runInContext(fs.readFileSync(__dirname+`/../js/${mod}.js`,'utf8'),context);
const C=context.window.BellymonCapture;
let checks=0;
const eq=(actual,expected,label)=>{assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected,label);checks++;};
const ok=(yes,label)=>{assert.ok(yes,label);checks++;};
const hero=(hp=100,maxHp=100,energy=100,classId='epeiste')=>({id:'hero',classId,rank:'E',stats:{force:20,rapidite:10,constitution:15},hp,maxHp,energy});
eq(C.COST,2,'capture cost 2');
for(const [hp,percent] of [[100,5],[76,5],[75,15],[51,15],[50,30],[26,30],[25,50],[11,50],[10,75],[1,75],[0,0]]){
 eq(C.chance(hero(hp)),percent,`threshold hp=${hp}`);
}
for(const [hp,percent] of [[76,5],[75,15],[50,30],[25,50],[10,75]]){
 eq(C.chance(hero(hp,100)),percent,`percent exact ${hp}`);
}
eq(C.chance(hero(1,300)),75,'small nonzero HP percent ceil');
eq(C.chance(hero(1,0)),0,'invalid maximum HP');
ok(!C.canAttempt(hero(100,100,1),hero(10)),'energy 1 cannot capture');
ok(!C.canAttempt(hero(0),hero(10)),'KO hero cannot capture');
ok(!C.canAttempt(hero(),hero(0)),'KO opponent cannot capture');
ok(C.canAttempt(hero(100,100,2),hero(10)),'2 energy enough');
const success=C.attempt(hero(),hero(10),{},()=>0,{turn:2});
eq(success.result,'captured','capture succeeds');
eq(success.player.energy,98,'capture success -2 energy');
eq(success.enemy.hp,10,'capture preserves opponent hp');
eq(success.aiAction,null,'no enemy attack on success');
// Fail: first RNG .99 (miss capture), then .1 chooses light; following rolls .99 misses evade/crit.
const rolls=[.99,.1,.99,.99,.99];let i=0;
const failed=C.attempt(hero(),hero(10),{},()=>rolls[i++]??.99,{turn:3});
eq(failed.success,false,'capture failed');
eq(failed.player.energy,98,'capture failure costs 2');
ok(failed.player.hp<100,'enemy retaliates after failed capture');
eq(failed.aiAction,'light','AI choses action on fail');
ok(failed.summary.includes('Capture échouée'),'failure visible');
let errors=0;
for(const [a,b] of [[hero(100,100,1),hero(10)],[hero(),hero(0)]]){
 try{C.attempt(a,b)}catch(_){errors++;}
}
eq(errors,2,'invalid attempts throw');
console.log(`✅ V6 — ${checks} tests unitaires capture réussis`);
