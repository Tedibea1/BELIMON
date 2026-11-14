const assert=require('node:assert/strict');
const fs=require('fs');const vm=require('vm');const path=require('path');
const root=path.join(__dirname,'..');
const ctx={window:{},Math,Date};vm.createContext(ctx);
for(const file of ['bonuses.js','combat.js','hospital.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),ctx);
const C=ctx.window.TDWCombat,H=ctx.window.BellymonHospital;
const same=(actual,expected,msg)=>assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)),expected,msg);
const hero=(cls='epeiste',hp=200,rap=35,cons=20,force=50)=>({id:cls,classId:cls,rank:'S',morph:'musclee',hp,maxHp:200,energy:100,stats:{force,rapidite:rap,constitution:cons}});
const rng=()=>0.5;
let n=0;
function test(name,fn){fn();n++;console.log('PASS',name);}
test('new energy costs and light 1.0',()=>{same(C.COST,{light:15,heavy:15,special:20,defend:0,recover:0,idle:0});assert.equal(C.ACTIONS.light.power,1)});
test('faster enemy moves first and can KO slower player',()=>{
 const res=C.resolveTurn(hero('epeiste',20,5),hero('archere_arcanique',200,100,5,150),'special',{},rng,{enemyAction:'heavy'});
 assert.equal(res.order[0],'enemy');assert.equal(res.player.hp,0);assert.equal(res.enemy.hp,200);
 assert.equal(res.player.energy,100,'KO before attack should not spend special');
 assert.match(res.summary,/avant de pouvoir agir/);
});
test('faster player moves first and can KO enemy',()=>{
 const res=C.resolveTurn(hero('epeiste',200,100,0,500),hero('bagarreuse',20,1,0,1),'light',{},rng,{enemyAction:'heavy'});
 assert.equal(res.order[0],'player');assert.equal(res.enemy.hp,0);assert.equal(res.player.hp,200);
});
test('defense always prepared before faster attack',()=>{
 const a=hero('bagarreuse',200,1,0,5),b=hero('epeiste',200,100,0,100);
 const res=C.resolveTurn(a,b,'defend',{},rng,{enemyAction:'light'});
 assert.equal(res.order[0],'player');assert.equal(res.player.hp,150);assert.equal(res.enemy.energy,85);
 const rev=C.resolveTurn(b,a,'light',{},rng,{enemyAction:'defend'});
 assert.equal(rev.order[0],'enemy');assert.equal(rev.enemy.hp,150); // V15.1 : critique RAP/2, tirage .5 ne critique pas avec 100 RAP
});
test('equal speed tie is random and does not favour player by default',()=>{
 same(C.combatOrder('light','heavy',{rapidite:10},{rapidite:10},()=>0),['player','enemy']);
 same(C.combatOrder('light','heavy',{rapidite:10},{rapidite:10},()=>0.9),['enemy','player']);
});
test('normal light damage now higher while defense halves',()=>{
 const a=hero('epeiste',200,10,0,40),b=hero('bagarreuse',200,10,0,5);
 const x=C.resolveTurn(a,b,'light',{},rng,{enemyAction:'defend'});
 assert.equal(x.enemy.hp,180);assert.equal(x.player.energy,85); // tirage égal au seuil : l'esquive et le critique n'ont pas lieu
});
const sample=(count=4,floor=1)=>({tower:{floor,room:'rest',event:null},waifus:Array.from({length:count},(_,i)=>({id:'h'+i,hp: i===0?0:30,maxHp:100,energy:100,injuredUntil:0})),hospital:{slots:[]}});
test('hospital 3 concurrent beds only, 18 seconds each',()=>{
 const d=sample();const t=1_000_000;
 for(let i=0;i<3;i++)assert.equal(H.start(d,'h'+i,t),t+18000);
 assert.equal(d.hospital.slots.length,3);
 assert.throws(()=>H.start(d,'h3',t),/trois lits/);
 assert.equal(H.complete(d,t+17999),0);
 assert.equal(d.waifus[0].hp,0);
 assert.equal(H.complete(d,t+18000),3);
 assert.equal(d.waifus[0].hp,100);assert.equal(d.hospital.slots.length,0);
 H.start(d,'h3',t+20000);assert.equal(d.hospital.slots.length,1);
});
test('hospital locked on upper floors',()=>{const d=sample(2,2);assert.throws(()=>H.start(d,'h0',0),/étage 1/)});
test('healing does not trigger spontaneously without hospital',()=>{const d=sample(1);H.complete(d,10_000_000);assert.equal(d.waifus[0].hp,0)});
test('hospital keeps slots in save-like JSON state and heals after reload',()=>{
 const d=sample(2);H.start(d,'h0',1000);const clone=JSON.parse(JSON.stringify(d));
 assert.equal(H.complete(clone,18999),0);assert.equal(H.complete(clone,19001),1);
 assert.equal(clone.waifus[0].hp,100);
});
test('hospital migration preserves legacy wounded up to three',()=>{
 const d=sample(4);delete d.hospital;d.waifus.forEach((h,i)=>h.injuredUntil=30000+i*100);
 H.ensure(d,0);assert.equal(d.hospital.slots.length,3);assert.equal(d.waifus[3].hp,30);
});
console.log('✅',n,'focused V12.0.18 test groups passed');
