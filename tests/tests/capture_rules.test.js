const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const context={window:{},Math};vm.createContext(context);
for(const mod of ['bonuses','combat','capture'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../js',`${mod}.js`),'utf8'),context,{filename:`${mod}.js`});
const C=context.window.BellymonCapture;
let checks=0;
const eq=(actual,expected,label)=>{assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected,label);checks++;};
const ok=(yes,label)=>{assert.ok(yes,label);checks++;};
const hero=(hp=100,maxHp=100,energy=100,classId='epeiste')=>({id:'hero',classId,rank:'E',stats:{force:20,rapidite:10,constitution:15},hp,maxHp,energy});
eq(C.COST,2,'capture cost 2');
for(const [hp,percent] of [[100,5],[76,5],[75,15],[51,15],[50,30],[31,30],[30,55],[26,55],[25,55],[11,55],[10,85],[1,85],[0,0]]){
 eq(C.chance(hero(hp)),percent,`threshold hp=${hp}`);
}
for(const [hp,percent] of [[76,5],[75,15],[50,30],[31,30],[30,55],[11,55],[10,85]]){
 eq(C.chance(hero(hp,100)),percent,`percent exact ${hp}`);
}
eq(C.chance(hero(1,300)),85,'small nonzero HP percent ceil');
eq(C.chance(hero(20,200)),85,'10% exact with HP max 200');
eq(C.chance(hero(21,200)),55,'10.5% rounded up gives 11%');
eq(C.chance(hero(60,200)),55,'30% exact with HP max 200');
eq(C.chance(hero(61,200)),30,'30.5% rounded up gives 31%');
eq(C.chance(hero(30,100)),55,'30% exact has 55%');
eq(C.chance(hero(10,100)),85,'10% exact has 85%');
eq(C.chance(hero(1,0)),0,'invalid maximum HP');
ok(!C.canAttempt(hero(100,100,1),hero(10)),'energy 1 cannot capture');
ok(!C.canAttempt(hero(0),hero(10)),'KO hero cannot capture');
ok(!C.canAttempt(hero(),hero(0)),'KO opponent cannot capture');
ok(C.canAttempt(hero(100,100,2),hero(10)),'2 energy enough');
const success=C.attempt(hero(),hero(10),{},()=>0,{turn:2});
eq(success.chance,85,'10% capture rate reported 85%');
const midSuccess=C.attempt(hero(),hero(30),{},()=>.54,{turn:2});
eq(midSuccess.success,true,'30% HP: 54% roll succeeds');
eq(midSuccess.chance,55,'30% HP: rate reported 55%');
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
console.log(`✅ V15.13 — ${checks} tests unitaires capture réussis`);
