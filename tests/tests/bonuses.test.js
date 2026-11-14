const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const R=path.resolve(__dirname,'..');const sandbox={window:{}};
for(const filename of ['bonuses','combat','rewards','evolution','capture'])vm.runInNewContext(fs.readFileSync(path.join(R,'js',filename+'.js'),'utf8'),sandbox,{filename});
const BONUS=sandbox.window.BellymonBonuses, COMBAT=sandbox.window.TDWCombat, REWARD=sandbox.window.BellymonRewards, EVOL=sandbox.window.BellymonEvolution;
let checks=0;const test=(label,fn)=>{fn();checks++;};
const baseClasses=[
 {id:'epeiste',stats:{force:30,rapidite:10,constitution:20},hp:120},
 {id:'bagarreuse',stats:{force:20,rapidite:10,constitution:30},hp:160},
 {id:'archere_arcanique',stats:{force:40,rapidite:10,constitution:10},hp:100},
 {id:'occultiste',stats:{force:10,rapidite:30,constitution:20},hp:100},
 {id:'pretresse',stats:{force:20,rapidite:20,constitution:20},hp:130},
 {id:'griffeuse',stats:{force:20,rapidite:30,constitution:10},hp:110},
];
const classes=Object.fromEntries(baseClasses.map(c=>[c.id,c]));
const ranks=['E','D','C','B','A','S'];
const morphs=['musclee','obese','chetive'];
for(let level=0;level<=100;level++){
 for(const key of BONUS.KEYS){
  test(`niveau ${level} ${key}`,()=>assert.equal(BONUS.points(level),level*2));
 }
}
for(const c of baseClasses){for(const rank of ranks){for(const morph of (rank==='E'?[null]:morphs)){
 const coef=EVOL.MULTIPLIERS[rank],steps=ranks.indexOf(rank),m=EVOL.MORPH_BONUSES[morph];
 const raw={};for(const stat of BONUS.KEYS)raw[stat]=Math.round(c.stats[stat]*coef)+(m?steps*m[stat]:0);
 const hero={classId:c.id,rank,morph,stats:raw,maxHp:Math.round(c.hp*coef),hp:Math.round(c.hp*coef),energy:100};
 for(const lv of [0,1,5,12,75]){
  const levels={force:lv,rapidite:lv*2,constitution:lv*3};
  const before=JSON.stringify(hero);
  const breakdown=BONUS.breakdown(hero.stats,levels);
  const final=BONUS.totalStats(hero.stats,levels);
  const battle=COMBAT.combatStats(hero,levels);
  test(`${c.id} ${rank}/${morph} x ${lv}`,()=>{
   for(const stat of BONUS.KEYS){
    assert.equal(final[stat],raw[stat]+2*levels[stat]);
    assert.equal(battle[stat],final[stat]);
    assert.equal(breakdown[stat].personal,raw[stat]);
    assert.equal(breakdown[stat].bonus,2*levels[stat]);
   }
   assert.equal(JSON.stringify(hero),before,'ne modifie pas les données personnage');
  });
 }
}}}
for(const key of BONUS.KEYS){
 const data={food:{small:0,large:0},bonuses:{force:0,rapidite:0,constitution:0},waifus:[{stats:{force:19,rapidite:6,constitution:13}}]};
 for(let i=1;i<=50;i++){
  REWARD.grant(data,{food:{small:0,large:0},bonus:key});
  test(`gain ${key} niveau ${i}`,()=>{
   assert.equal(data.bonuses[key],i);
   assert.equal(BONUS.totalStats(data.waifus[0].stats,data.bonuses)[key],data.waifus[0].stats[key]+i*2);
  });
 }
 const newcomer={stats:{force:7,rapidite:9,constitution:4}};
 test(`nouveau capturé touche ${key}`,()=>assert.equal(COMBAT.combatStats(newcomer,data.bonuses)[key],newcomer.stats[key]+100));
}
for(const bad of [undefined,null,-3,1.4,NaN,Infinity,'6']){
 test('niveau invalide',()=>assert.equal(BONUS.points(bad),0));
}
for(const r of ['E','D','C','B','A','S'])test(`récompense de combat rang ${r}`,()=>assert.equal(REWARD.combatReward(r).bonus,null));
console.log(`PASS bonus V8 : ${checks} vérifications de règles, stats, récompenses, futures captures, rangs et morphologies`);
