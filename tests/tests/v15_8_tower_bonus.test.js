const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../js/game.js'),'utf8');
const from=src.indexOf('  function enemyTowerStatBonus(');
const to=src.indexOf('  function chooseEvent(',from);
assert(from>=0&&to>from);
const context={Math, HERO_CLASSES:[{id:'spectre',starter:true,stats:{force:10,rapidite:128,constitution:15},hp:100}],RANK_MULTIPLIERS:{E:1,D:1,C:1,B:1,A:1,S:1},RANKS:['E','D','C','B','A','S'],MORPH_BONUSES:{musclee:{force:0,rapidite:0,constitution:0},obese:{force:0,rapidite:0,constitution:0},chetive:{force:0,rapidite:0,constitution:0}},round:Math.round,makeId:()=> 'test'};
vm.createContext(context);
vm.runInContext(src.slice(src.indexOf('  function enemyRankForFloor('),to)+'\nthis.enemyTowerStatBonus=enemyTowerStatBonus;this.createEnemy=createEnemy;',context);
for(const [floor,bonus] of [[1,0],[19,0],[20,0],[100,0],[119,0],[120,10],[139,10],[140,20],[159,20],[160,30],[179,30],[180,40],[199,40],[200,50],[999,440]]){
 const e=context.createEnemy(floor);
 assert.equal(e.towerStatBonus,bonus,`étage ${floor}`);
 for(const k of ['force','rapidite','constitution']) assert.equal(e.stats[k],context.HERO_CLASSES[0].stats[k]+(e.rank==='S'?5*0:0)+bonus,`${floor} ${k}`);
 const captured=Object.fromEntries(Object.entries(e.stats).map(([k,v])=>[k,v-e.towerStatBonus]));
 for(const k of Object.keys(captured))assert.equal(captured[k],context.HERO_CLASSES[0].stats[k]);
}
assert.match(src,/captiveStats\[stat\]=Math\.max\(0,captiveStats\[stat\]-\(enemy\.towerStatBonus\|\|0\)\)/);
console.log('OK V15.8 : paliers, stats et suppression des bonus à la capture');
