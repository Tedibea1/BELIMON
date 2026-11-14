const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ctx={window:{},Math};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/shop.js'),'utf8'),ctx);
const S=ctx.window.BellymonShop;
const hero=(id='hero',hp=25,maxHp=100)=>({id,hp,maxHp,injuredUntil:0});
const base=()=>({food:{small:100,large:100},potions:S.empty(),tower:{floor:1,event:null},waifus:[hero()],hospital:{slots:[]}});
let checked=0;
function run(name,fn){fn();console.log('PASS',name);checked++;}
run('three approved prices & heals',()=>{
 assert.equal(S.POTIONS.petite.percent,30);assert.equal(S.POTIONS.petite.small,9);assert.equal(S.POTIONS.petite.large,3);
 assert.equal(S.POTIONS.grande.percent,60);assert.equal(S.POTIONS.grande.small,15);assert.equal(S.POTIONS.grande.large,5);
 assert.equal(S.POTIONS.supreme.percent,90);assert.equal(S.POTIONS.supreme.small,21);assert.equal(S.POTIONS.supreme.large,7);
});
run('three steaks vs gigot distinct resource costs',()=>{
 const d=base();S.buy(d,'petite','small');assert.equal(d.food.small,91);assert.equal(d.food.large,100);
 S.buy(d,'petite','large');assert.equal(d.food.large,97);assert.equal(d.potions.petite,2);
});
run('insufficient stock is atomic',()=>{
 const d=base();d.food.small=8;assert.throws(()=>S.buy(d,'petite','small'),/assez/);
 assert.equal(d.potions.petite,0);assert.equal(d.food.small,8);
});
run('outside floor 1 no purchasing',()=>{
 const d=base();d.tower.floor=2;assert.throws(()=>S.buy(d,'petite','small'),/étage 1/);
 assert.equal(d.food.small,100);
});
run('in combat no buying or using',()=>{
 const d=base();d.potions.petite=1;d.tower.event={state:'fighting'};
 assert.throws(()=>S.buy(d,'petite','small'),/combat/);
 assert.throws(()=>S.use(d,'petite','hero'),/combat/);
 d.tower.event.state='awaiting_switch';assert.throws(()=>S.use(d,'petite','hero'),/combat/);
 assert.equal(d.potions.petite,1);
});
run('heals 30 percent of MAX HP and consumes exactly one',()=>{
 const d=base();d.potions.petite=1;
 const r=S.use(d,'petite','hero');assert.equal(r.healed,30);assert.equal(d.waifus[0].hp,55);assert.equal(d.potions.petite,0);
});
run('90% potion cannot exceed max HP',()=>{
 const d=base();d.potions.supreme=1;d.waifus[0].hp=50;
 const r=S.use(d,'supreme','hero');assert.equal(r.healed,50);assert.equal(r.after,100);
});
run('KO cannot be revived / hospitalized cannot be treated',()=>{
 const d=base();d.potions.grande=2;d.waifus[0].hp=0;
 assert.throws(()=>S.use(d,'grande','hero'),/consciente/);assert.equal(d.potions.grande,2);
 d.waifus[0].hp=4;d.hospital.slots=[{heroId:'hero',readyAt:999999}];
 assert.throws(()=>S.use(d,'grande','hero'),/hospitalisée/);assert.equal(d.potions.grande,2);
});
run('full health does not waste a potion',()=>{
 const d=base();d.potions.petite=1;d.waifus[0].hp=100;
 assert.throws(()=>S.use(d,'petite','hero'),/consciente/);assert.equal(d.potions.petite,1);
});
run('old saves can start with no potions',()=>{
 const d=base();delete d.potions;const inv=S.ensure(d);
 assert.deepEqual(JSON.parse(JSON.stringify(inv)),{petite:0,grande:0,supreme:0});
});
run('invalid potion counts rejected',()=>{
 assert.equal(S.validInventory({petite:-1,grande:0,supreme:0}),false);
 assert.equal(S.validInventory({petite:1,grande:'4',supreme:0}),false);
});
console.log(`✅ ${checked} tests Boutique V13 OK`);
