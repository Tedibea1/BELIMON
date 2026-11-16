/* BELIMON V16.2 : test en isolation du tarif des raccourcis. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../../js/shortcuts.js'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'../../js/game.js'),'utf8');
const window={};
vm.runInNewContext(source,{window,Math,Number,Error,Object});
const S=window.BellymonShortcuts;
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
function fixture(record,small){
 return {food:{small,large:12},potions:{petite:3},
  tower:{floor:1,record,room:'rest',event:null,combat:null,activeTraps:[]}};
}
for(let n=2;n<=1000;n++)check(S.price(n)===n,'1 steak/étage '+n);
check(S.price(1)===null && S.price(0)===null && S.price(-1)===null,'Étages trop petits rejetés');
check(S.price(2.5)===null && S.price(Infinity)===null && S.price(NaN)===null,'Étages non entiers rejetés');
check(S.price(Number.MAX_SAFE_INTEGER)===Number.MAX_SAFE_INTEGER,'Prix linéaire entier sûr');
check(S.price(Number.MAX_SAFE_INTEGER+1)===null,'Étage hors domaine rejeté');
// Le rabais s'applique au NUMERO de l'étage cible n-5, pas au record.
for(const [record,full,target,cheap] of [
 [7,7,2,1],[8,8,3,2],[10,10,5,2],[15,15,10,5],
 [20,20,15,8],[30,30,25,12],[60,60,55,28],
 [90,90,85,42],[100,100,95,48],[150,150,145,72],
 [200,200,195,98],[226,226,221,110]
]){
 const p=S.plan(record,'record'),reduced=S.plan(record,'reduced');
 check(p.cost===full && p.target===record,'Retour record '+record);
 check(reduced.cost===cheap && reduced.target===target,'Retour réduit '+record);
 check(Object.isFrozen(p)&&Object.isFrozen(reduced),'Plans immuables');
}
for(let record=0;record<=6;record++)check(S.plan(record,'reduced')===null,'Réduit verrouillé '+record);
check(S.plan(1,'record')===null && S.plan(226,'unknown')===null,'Plans illégaux bloqués');
for(const record of [7,15,60,100,226]){
 for(const kind of ['record','reduced']){
  const plan=S.plan(record,kind),data=fixture(record,plan.cost),result=S.apply(data,kind);
  check(result.cost===plan.cost && result.target===plan.target,'Transaction '+record+'/'+kind);
  check(data.food.small===0 && data.food.large===12 && data.potions.petite===3,'Une seule devise débitée '+record+'/'+kind);
  check(data.tower.floor===plan.target && data.tower.record===record,'Destination/record '+record+'/'+kind);
  check(data.tower.room==='rest' && data.tower.event===null && data.tower.combat===null,'État conservé '+record+'/'+kind);
  check(data.tower.activeTraps.length===0,'Pièges vidés '+record+'/'+kind);
  const state=JSON.stringify(data);
  assert.throws(()=>S.apply(data,kind));
  check(JSON.stringify(data)===state,'Pas de deuxième facture '+record+'/'+kind);
  const poor=fixture(record,plan.cost-1),snapshot=JSON.stringify(poor);
  assert.throws(()=>S.apply(poor,kind));
  check(JSON.stringify(poor)===snapshot,'Insuffisance sans débit '+record+'/'+kind);
 }
}
for(const mutate of [d=>{d.tower.floor=2;},d=>{d.tower.room='event';},d=>{d.tower.event={type:'chest'};}]){
 const d=fixture(100,100);mutate(d);const before=JSON.stringify(d);
 assert.throws(()=>S.apply(d,'record'));
 check(JSON.stringify(d)===before,'Raccourci bloqué hors salle de repos initiale');
}
check(/SHORTCUTS\.plan\(tower\.record,kind\)/.test(game),'Prix écran calculé via plan');
check(/SHORTCUTS\.plan\(slot\.data\.tower\.record,kind\)/.test(game),'Confirmation calculée via plan');
check(/SHORTCUTS\.apply\(data,kind\)/.test(game),'Paiement via le même plan');
console.log('PASS '+checks+' checks : BELIMON prix linéaires, demi-tarif, validation et transactions.');
