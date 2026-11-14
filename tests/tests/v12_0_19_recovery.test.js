const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),ctx={window:{},Math,Date};vm.createContext(ctx);
for(const f of ['bonuses.js','combat.js','auto.js','capture.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx);
const C=ctx.window.TDWCombat,A=ctx.window.BellymonAuto;
const h=(name,energy=0,hp=100,rap=20,force=40)=>({id:name,classId:'epeiste',energy,hp,maxHp:100,stats:{force,rapidite:rap,constitution:0}});
const rng=()=>0.99;let count=0;
function test(msg,fn){fn();count++;console.log('PASS',msg)}
test('seventh zero-cost action exists',()=>{assert.equal(C.COST.recover,0);assert.equal(C.ACTIONS.recover.label,'Récupération');assert(C.canPay(0,'recover'));});
test('0 EN vs 0 EN: both recover 67 with no artificial damage',()=>{
 const r=C.resolveTurn(h('player'),h('enemy'),'recover',{},rng,{enemyAction:'recover'});
 assert.equal(r.player.energy,67);assert.equal(r.enemy.energy,67);assert.equal(r.player.hp,100);assert.equal(r.enemy.hp,100);assert.equal(r.details.exhaustion,undefined);assert.match(r.summary,/récupère 67 EN/);
});
test('recovery capped at maximum (90 -> 100)',()=>{
 const r=C.resolveTurn(h('player',90),h('enemy'),'recover',{},rng,{enemyAction:'defend'});
 assert.equal(r.player.energy,100);assert.equal(r.details.player.recovered,10);
});
test('30% increased damage if faster enemy hits recovering player',()=>{
 const r=C.resolveTurn(h('player',0,100,20),h('enemy',100,100,21,40),'recover',{},rng,{enemyAction:'light'});
 assert.equal(r.order[0],'enemy');assert.equal(r.player.hp,48,'40*1.3=52 damage');assert.equal(r.player.energy,67);
});
test('30% increased damage if slower enemy hits recovering player',()=>{
 const r=C.resolveTurn(h('player',0,100,21),h('enemy',100,100,20,40),'recover',{},rng,{enemyAction:'light'});
 assert.equal(r.order[0],'player');assert.equal(r.player.hp,48);assert.equal(r.player.energy,67);
});
test('enemy recovery also incurs +30% incoming damage',()=>{
 const r=C.resolveTurn(h('player',100,100,21,40),h('enemy',0,100,20),'light',{},rng,{enemyAction:'recover'});
 assert.equal(r.enemy.hp,48);assert.equal(r.enemy.energy,67);assert.equal(r.player.energy,85);
});
test('not recovering: standard damage unchanged',()=>{
 const r=C.resolveTurn(h('player',100),h('enemy',100,100,20,40),'defend',{},rng,{enemyAction:'light'});
 assert.equal(r.player.hp,80);
});
test('enemy AI with 0 EN always recovers',()=>{assert.equal(C.chooseEnemyAction(0,rng,h('enemy'),1,{}),'recover');});
test('AUTO at 0 EN recovers and keeps its other actions',()=>{
 assert.equal(A.chooseAction(h('player'),h('enemy'),1,{},rng),'recover');
 assert.notEqual(A.chooseAction(h('player',100),h('enemy',100),1,{},rng),null);
});
test('energy recovers if opponent uses defense',()=>{
 const r=C.resolveTurn(h('player',0),h('enemy',100),'recover',{},rng,{enemyAction:'defend'});
 assert.equal(r.player.energy,67);assert.equal(r.player.hp,100);
});
test('recovery at 0 EN after failed capture enemy resolves',()=>{
 const p=h('player',2),e=h('enemy',0);e.hp=100;
 const result=ctx.window.BellymonCapture.attempt(p,e,{},()=>0.999,{enemyAction:'recover'});
 assert.equal(result.success,false);assert.equal(result.enemy.energy,67);
});
console.log(`✅ ${count} recovery tests OK`);
