/* Test hérité V14.4, adapté au tarif linéaire BELIMON V16.2. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../../js/shortcuts.js'),'utf8');
const window={};vm.runInNewContext(source,{window,Math,Number,Error,Object});
const S=window.BellymonShortcuts;
let tests=0;
function check(test){test();tests++;}
const values=[[30,30,12],[60,60,28],[100,100,48],[150,150,72],[200,200,98],[226,226,110]];
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
check(()=>{let d=data();const p=S.apply(d,'reduced');assert.equal(p.target,221);assert.equal(d.food.small,12890);assert.equal(d.food.large,42);assert.equal(d.tower.record,226);assert.equal(d.tower.room,'rest');});
check(()=>{let d=data();const p=S.apply(d,'record');assert.equal(p.target,226);assert.equal(d.food.small,12774);assert.equal(d.potions.petite,2);});
check(()=>{let d=data();S.apply(d,'record');assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,12774);});
check(()=>{let d=data(226,225);assert.throws(()=>S.apply(d,'record'));assert.equal(d.tower.floor,1);assert.equal(d.food.small,225);});
check(()=>{let d=data(226,5000);S.apply(d,'reduced');assert.equal(d.food.small,4890);assert.equal(d.tower.floor,221);});
check(()=>{let d=data(1,50000);assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>{let d=data(226,50000);d.tower.floor=3;assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>{let d=data(226,50000);d.tower.event={type:'combat'};assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>{let d=data(226,50000);d.tower.room='event';assert.throws(()=>S.apply(d,'record'));assert.equal(d.food.small,50000);});
check(()=>assert.equal(S.plan(1,'record'),null));
check(()=>assert.equal(S.price(Number.MAX_SAFE_INTEGER),Number.MAX_SAFE_INTEGER));
console.log('PASS',tests,'checks V14.4 (tarifs, montée, paiement, validations, état de la tour)');
