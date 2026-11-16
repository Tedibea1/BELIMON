// BELIMON V16.2 — prix linéaires et transactions inchangées.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../../js/shortcuts.js'),'utf8');
const window={};vm.runInNewContext(source,{window,Math,Number,Error,Object});
const S=window.BellymonShortcuts;
let checks=0;
function ok(cond,msg){assert.ok(cond,msg);checks++}
for(const [record,price,reduced] of [
 [7,7,1],[10,10,2],[15,15,5],[20,20,8],[30,30,12],
 [60,60,28],[100,100,48],[150,150,72],[200,200,98],[226,226,110]]) {
  ok(S.price(record)===price,`prix étage ${record}`);
  ok(S.plan(record,'record').cost===price,`prix record ${record}`);
  ok(S.plan(record,'reduced').cost===reduced,`prix n-5 record ${record}`);
  ok(S.plan(record,'reduced').target===record-5,`cible n-5 record ${record}`);
}
for(let n=2;n<=1000;n++){
  const p=S.price(n);
  ok(Number.isSafeInteger(p)&&p===n,`prix sûr étage ${n}`);
  ok(S.price(n+1)>=p,`tarif non décroissant à ${n}`);
}
const data=(record,steaks)=>({food:{small:steaks,large:12},potions:{petite:3},tower:{floor:1,record,room:'rest',event:null,combat:null,activeTraps:[]}});
for(const record of [15,60,100,226]){
 for(const kind of ['record','reduced']){
  const start=10000,d=data(record,start),p=S.plan(record,kind);
  const result=S.apply(d,kind);
  ok(result.target===p.target&&result.cost===p.cost,`${record}: transaction ${kind}`);
  ok(d.food.small===start-p.cost,`${record}: débit ${kind}`);
  ok(d.food.large===12&&d.potions.petite===3,`${record}: gigots/potions inchangés ${kind}`);
  ok(d.tower.floor===p.target&&d.tower.record===record&&d.tower.room==='rest',`${record}: reprise correcte ${kind}`);
  ok(d.tower.event===null&&d.tower.combat===null,`${record}: aucun combat créé ${kind}`);
  ok(d.tower.activeTraps.length===0,`${record}: pièges vidés ${kind}`);
 }
}
for(const record of [15,60,100,226])for(const kind of ['record','reduced']){
 const d=data(record,S.plan(record,kind).cost-1),initial=d.food.small;
 assert.throws(()=>S.apply(d,kind));
 ok(d.food.small===initial&&d.tower.floor===1,`refus sans débit stage ${record} ${kind}`);
}
for(const record of [15,226]){
 const d=data(record,10000);d.tower.floor=2;assert.throws(()=>S.apply(d,'record'));ok(d.food.small===10000,'ascenseur étage 1 uniquement');
}
ok(S.price(Number.MAX_SAFE_INTEGER)===Number.MAX_SAFE_INTEGER,'grand étage sûr');
ok(S.price(Number.MAX_SAFE_INTEGER+1)===null,'entier non sûr rejeté');
ok(S.plan(1,'record')===null&&S.plan(6,'reduced')===null,'raccourcis non débloqués');
console.log(`BELIMON TARIFS LINEAIRES : ${checks} vérifications réussies`);
