'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
const css=fs.readFileSync(path.join(root,'css/v12.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(css,/animation:hit-float 1\.8s ease-out forwards/);
assert.match(css,/animation:hit-fade 1\.8s linear forwards/);
assert.match(css,/@keyframes hit-float\{[^\n]+70%\{opacity:1/);
assert.match(css,/\.game-card\.impact-hit\{animation:card-hit \.42s/);
assert.match(css,/\.game-card\.impact-heal\{animation:card-heal \.42s/);
assert.match(html,/BELLYMON · V15\.15/);

const from=game.indexOf('  const FLOATING_TEXT_MS = 1800;');
const to=game.indexOf('  function renderTower(slot){',from);
assert.ok(from>=0&&to>from);
const cards={};
function card(){
 const labels=[],flags=new Set();
 return {labels,classList:{add:name=>flags.add(name),remove:(...names)=>names.forEach(x=>flags.delete(x))},
 querySelectorAll:selector=>selector==='.hit-pop'?labels.filter(x=>!x.removed):[],
 append:label=>labels.push(label),get offsetWidth(){return 1}};
}
cards.playerCombatCard=card();cards.enemyCombatCard=card();
const times=[],scheduled=new Map();let now=0,id=0;
const context={
 STATE:{screen:'play',activeTab:'tour'},
 document:{hidden:false},
 $:key=>cards[key],
 mkEl:(tag,cls,value)=>({tag,cls,textContent:value,removed:false,setAttribute(){},remove(){this.removed=true}}),
 setTimeout:(callback,ms)=>{const key=++id;scheduled.set(key,{at:now+ms,callback});times.push(ms);return key;},
 clearTimeout:key=>scheduled.delete(key)
};
vm.createContext(context);
vm.runInContext(game.slice(from,to)+'\nthis.play=playBattleFeedback;',context);
const visible=id=>cards[id].labels.filter(x=>!x.removed).map(x=>x.textContent);
const tick=until=>{
 while(true){
  const candidates=[...scheduled].filter(([,task])=>task.at<=until).sort((a,b)=>a[1].at-b[1].at);
  if(!candidates.length)break;
  const [key,task]=candidates[0];scheduled.delete(key);now=task.at;task.callback();
 }
 now=until;
};
context.play({playerLost:30,enemyLost:0});
assert.deepEqual(visible('playerCombatCard'),['−30']);
assert.ok(times.includes(1800));
tick(850);
assert.deepEqual(visible('playerCombatCard'),['−30'],'dégât persistant après 850 ms');
context.play({playerLost:0,playerHeal:30,enemyLost:0,enemyMiss:true});
assert.deepEqual(visible('playerCombatCard'),['−30','+30'],'le soin ne supprime pas le précédent dégât');
assert.deepEqual(visible('enemyCombatCard'),['MISS']);
tick(1799);
assert.deepEqual(visible('playerCombatCard'),['−30','+30']);
tick(1800);
assert.deepEqual(visible('playerCombatCard'),['+30'],'dégât retiré exactement à 1800 ms');
assert.deepEqual(visible('enemyCombatCard'),['MISS']);
tick(2649);
assert.deepEqual(visible('playerCombatCard'),['+30']);
tick(2650);
assert.deepEqual(visible('playerCombatCard'),[]);
assert.deepEqual(visible('enemyCombatCard'),[]);
console.log('BELLYMON V15.15 : dégâts, soins et MISS à 1800 ms, sans annulation en AUTO.');
