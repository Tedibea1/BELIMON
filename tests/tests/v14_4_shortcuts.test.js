/* Test de régression historique V14.4, attentes de prix actualisées pour V15.3. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/shortcuts.js'),'utf8');
const window={};vm.runInNewContext(source,{window,Math,Number,Error,Object});
const S=window.BellymonShortcuts;
let tests=0;
function check(test){test();tests++;}
const values=[[30,75,26],[60,300,126],[100,833,376],[150,1875,876],[200,3333,1584],[226,4256,2035]];
for(const [record,full,cheap] of values){
  check(()=>assert.equal(S.price(record),full));
  check(()=>assert.equal(S.plan(record,'record').cost,full));
  check(()=>assert.equal(S.plan(record,'reduced').cost,cheap));
  check(()=>assert.equal(S.plan(record,'reduced').target,record-5));
}
for(let n=2;n<1000;n++)check(()=>assert.ok(S.price(n+1)>=S.price(n)));
for(const record of [0,1,2,3,4,5,6])check(()=>assert.equal(S.plan(record,'reduced'),null));
for(const k of ['unknown','none',null])check(()=>assert.equal(S.plan(226,k),null));
function data(record=226,small=13000){return {food:{small,large:42},potions:{petite:2},tower:{floor:1,record,room:'rest',event:null,combat:null,activeTraps:[]}};}
check(()=>{let d=data();const p=S.apply(d,'reduced');assert.equal(p.target,221);assert.equal(d.food.small,10965);assert.equal(d.food.large,42);assert.equal(d.tower.record,226);assert.equal(d.tower.room,'rest');});
check(()=>{let d=data();const p=S.apply(d,'record');assert.equal(p.target,226);assert.equal(d.food.small,8744);assert.equal(d.potions.petite,2);});
check(()=>{let d=data();S.apply(d,'record');assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,8744);});
check(()=>{let d=data(226,4000);assert.throws(()=>S.apply(d,'record'));assert.equal(d.tower.floor,1);assert.equal(d.food.small,4000);});
check(()=>{let d=data(226,5000);S.apply(d,'reduced');assert.equal(d.food.small,2965);assert.equal(d.tower.floor,221);});
check(()=>{let d=data(1,50000);assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>{let d=data(226,50000);d.tower.floor=3;assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>{let d=data(226,50000);d.tower.event={type:'combat'};assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>{let d=data(226,50000);d.tower.room='event';assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>assert.equal(S.plan(1,'record'),null));
check(()=>assert.equal(S.price(Number.MAX_SAFE_INTEGER),null));
console.log('PASS',tests,'checks V14.4 (tarifs, montée, paiement, validations, état de la tour)');
