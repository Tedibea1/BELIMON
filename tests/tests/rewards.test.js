const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../js/rewards.js'),'utf8'),context);
const R=context.window.BellymonRewards;
let count=0;
function test(name,fn){fn();count++;console.log('PASS',name);}
for(const [rank,small,large] of [['E',1,0],['D',2,0],['C',3,0],['B',4,0],['A',5,0],['S',2,2]]){
 test('combat '+rank,()=>{const r=R.combatReward(rank);assert.equal(r.food.small,small);assert.equal(r.food.large,large);assert.equal(r.bonus,null);});
}
test('invalid combat rank',()=>assert.throws(()=>R.combatReward('Z')));
const sequence=list=>{let i=0;return ()=>list[i++];};
for(const n of [0,1,2])test('coffre steak '+(2+n),()=>{
 const r=R.chestReward(sequence([0.01,(n+.01)/3,.99]));assert.equal(r.food.small,2+n);assert.equal(r.food.large,0);assert.equal(r.bonus,null);
});
for(const n of [0,1])test('coffre gigot '+(1+n),()=>{
 const r=R.chestReward(sequence([.7,(n+.01)/2,.99]));assert.equal(r.food.large,1+n);assert.equal(r.food.small,0);
});
for(const [idx,key] of ['force','rapidite','constitution'].entries())test('25% bonus '+key,()=>{
 const r=R.chestReward(sequence([.4,0,.1,(idx+.01)/3]));assert.equal(r.bonus,key);
});
test('grant food + global bonus',()=>{
 const data={food:{small:0,large:1},bonuses:{force:2,rapidite:0,constitution:0}};
 R.grant(data,{food:{small:4,large:2},bonus:'force'});
 assert.deepEqual(data,{food:{small:4,large:3},bonuses:{force:3,rapidite:0,constitution:0}});
});
test('grant invalid never mutates',()=>{
 const d={food:{small:3,large:0},bonuses:{force:0,rapidite:0,constitution:0}};
 assert.throws(()=>R.grant(d,{food:{small:2,large:0},bonus:'unknown'}));assert.equal(d.food.small,3);
});
test('isReward',()=>{
 assert.equal(R.isReward({food:{small:0,large:1},bonus:null}),true);
 assert.equal(R.isReward({food:{small:-1,large:1},bonus:null}),false);
});
let samples=60000,small=0,large=0,bonuses=0,counts={force:0,rapidite:0,constitution:0};
for(let i=0;i<samples;i++){
 const r=R.chestReward();
 if(r.food.small)small++;else large++;
 if(r.bonus){bonuses++;counts[r.bonus]++;}
}
test('frequency 60/40 (stochastic tolerance)',()=>assert(Math.abs(small/samples-.6)<.015));
test('frequency 25% bonus',()=>assert(Math.abs(bonuses/samples-.25)<.015));
test('bonus types roughly equal',()=>assert(Math.max(...Object.values(counts))-Math.min(...Object.values(counts))<600));
console.log('REWARDS TESTS',count);
