const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const path=require('path');
const ctx={window:{},Math};vm.createContext(ctx);
for(const file of ['bonuses.js','traps.js','combat.js','auto.js','combat-ui.js']){
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),ctx);
}
const C=ctx.window.TDWCombat,T=ctx.window.BellymonTraps,U=ctx.window.BellymonCombatUI,A=ctx.window.BellymonAuto;
const clean=v=>JSON.parse(JSON.stringify(v));let checks=0;
function equal(actual,expected,label){assert.deepEqual(clean(actual),clean(expected),label);checks++}
function okay(value,label){assert.ok(value,label);checks++}
const hero=(cls,hp=100,en=0)=>({classId:cls,stats:{force:20,rapidite:10,constitution:20},maxHp:100,hp,energy:en});
// 0 EN + 0 EN : aucun blocage, dégât d'épuisement déterministe et pas de regen.
let player=hero('griffeuse'),enemy=hero('bagarreuse');
for(let turn=1;turn<=4;turn++){
 const result=C.resolveTurn(player,enemy,'defend',{},()=>.5,{turn});
 equal(result.player.energy,0,`Tour ${turn} : EN joueur inchangée`);
 equal(result.enemy.energy,0,`Tour ${turn} : EN adverse inchangée`);
 equal(result.details.exhaustion.player,15,`Tour ${turn} : fatigue joueur`);
 equal(result.details.exhaustion.enemy,15,`Tour ${turn} : fatigue adverse`);
 okay(result.summary.includes('Épuisement'),`Tour ${turn}: indication de fatigue`);
 player=result.player;enemy=result.enemy;
}
for(let turn=5;turn<=7;turn++){
 const result=C.resolveTurn(player,enemy,'defend',{},()=>.5,{turn});
 if(result.result==='fighting'){player=result.player;enemy=result.enemy;continue;}
 equal(result.result,'lost','égalité à l’épuisement : défaite, aucune victoire gratuite');
 okay(result.player.hp===0&&result.enemy.hp===0,'double KO par épuisement');
 break;
}
const noFatigue=C.resolveTurn(hero('epeiste',100,2),hero('bagarreuse',100,0),'light',{},()=>.4,{turn:1});
okay(noFatigue.result==='fighting','tour valide avec EN initiale');
// Durées de malédiction, siphon, sword, et pièges : présentations sans règles cachées.
const effects=C.normalizeEffects();
effects.enemy.swordCons=true;
effects.enemy.curse={startTurn:1};
effects.player.siphon={expiresTurn:3,nextTickAt:0};
const trap=[{type:'force',expiresAtFloor:9}];
let v=U.describe({turn:1,effects},7,trap);
equal(v.turn,2,'HUD affiche le prochain tour');
equal(v.count,4,'compte de malus exact');
okay(v.sides.enemy.some(x=>x.label.includes('−20%')),'curse étape 2/5 sur prochain tour');
okay(v.sides.enemy.some(x=>x.label==='CONS −15 %'),'punition permanente affichée');
okay(v.sides.player.some(x=>x.label.includes('2 t.')),'siphon restant 2 tours');
okay(v.traps[0].label.includes('2 ét.'),'piège deux étages');
v=U.describe({turn:4,effects},8,trap);
okay(v.sides.enemy.some(x=>x.label.includes('−50%')),'curse étape 5/5');
okay(v.traps[0].label.includes('1 ét.'),'piège expire au changement');
v=U.describe({turn:5,effects},9,trap);
okay(!v.sides.enemy.some(x=>x.label.includes('Stats')),'curse disparue au 6e tour');
equal(v.traps.length,0,'piège disparu au 3e étage');
// AUTO en épuisement doit continuer avec une action gratuite, sans capture.
equal(A.chooseAction(hero('pretresse'),hero('epeiste'),8,effects,()=>.1),'defend','AUTO à 0 EN défend');
console.log('✅ V12 règles & effets :',checks,'assertions réussies');
