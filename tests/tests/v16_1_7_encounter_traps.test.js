'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const ROOT=path.join(__dirname,'../..');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
function equal(actual,expected,message){assert.equal(actual,expected,message);checks++;}

const trctx={window:{}};
vm.createContext(trctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,'js/traps.js'),'utf8'),trctx);
const T=trctx.window.BellymonTraps;
const empty={force:0,rapidite:0,constitution:0};
for(const floor of [1,2,11,38,99,1000]){
 for(const type of T.KEYS){
  const tower={floor,activeTraps:[]};T.apply(tower,type);
  const trap=tower.activeTraps[0];
  equal(trap.startsAtFloor,floor+1,`${type}@${floor} starts only next floor`);
  equal(trap.expiresAtFloor,floor+3,`${type}@${floor} expires after 2 future floors`);
  equal(T.remaining(trap,floor),2,`${type}@${floor} two future floors displayed`);
  equal(JSON.stringify(T.penalties(tower.activeTraps,floor)),JSON.stringify(empty),`${type}@${floor} no penalty on chest floor`);
  for(const offset of [1,2]){
   tower.floor=floor+offset;
   T.advance(tower);
   equal(tower.activeTraps.length,1,`${type}@${floor} persists at future floor ${offset}`);
   equal(T.remaining(tower.activeTraps[0],tower.floor),3-offset,`${type}@${floor} remaining at future floor ${offset}`);
   check(Object.values(T.penalties(tower.activeTraps,tower.floor)).some(x=>x>0),`${type}@${floor} penalty active at ${offset}`);
  }
  tower.floor=floor+3;
  T.advance(tower);
  equal(tower.activeTraps.length,0,`${type}@${floor} expires upon entering N+3`);
 }
}
// Cumul de plusieurs pièges et mise à jour d'une même catégorie sans empilement.
const combo={floor:10,activeTraps:[]};
T.apply(combo,'force');T.apply(combo,'all');T.apply(combo,'force');
equal(combo.activeTraps.length,2,'no duplicated force trap');
equal(T.penalties(combo.activeTraps,10).force,0,'no penalty before future floors');
equal(Math.round(T.penalties(combo.activeTraps,11).force*100),30,'stacked penalties on next floor');
combo.floor=11;T.apply(combo,'force');
equal(combo.activeTraps.find(t=>t.type==='force').expiresAtFloor,14,'retrap refreshes future floors');
check(T.isEntry(combo.activeTraps[0]),'save serializable entry');
const reloaded=T.normalize(JSON.parse(JSON.stringify(combo.activeTraps)),combo.floor);
check(reloaded.some(t=>t.startsAtFloor===12),'save/reload retains start floor');
// Les anciennes sauvegardes restent cohérentes, avec la date d'expiration historique.
const old=[{type:'rapidite',expiresAtFloor:21}];
check(T.isEntry(old[0]),'legacy save accepted');
equal(T.penalties(old,19).rapidite,.2,'legacy trap active under original schedule');
equal(T.remaining(old[0],19),2,'legacy remaining unchanged');
equal(T.normalize(old,21).length,0,'legacy expiry unchanged');
check(!T.isEntry({type:'force',startsAtFloor:15,expiresAtFloor:14}),'impossible start/expiry rejected');

const mp3=path.join(ROOT,'assets/audio/sfx/combat_encounter.mp3');
const data=fs.readFileSync(mp3);
check(data.length>10_000,'supplied encounter mp3 present');
check(data.subarray(0,3).toString()==='ID3'||data[0]===255,'mp3 file header');
const played=[],instances={};
class AudioMock{
 constructor(src){this.src=src;this.volume=0;this.currentTime=0;this.paused=true;this.ended=false;instances[src]=this;}
 addEventListener(){}
 play(){this.paused=false;played.push({src:this.src,volume:this.volume});return Promise.resolve();}
 pause(){this.paused=true;}
}
const audioctx={window:{},document:{hidden:false,addEventListener(){}},Audio:AudioMock,console,Math,JSON,
 localStorage:{getItem(){return null;},setItem(){}},performance:{now:()=>0},
 requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},setTimeout,clearTimeout};
vm.createContext(audioctx);vm.runInContext(fs.readFileSync(path.join(ROOT,'js/audio.js'),'utf8'),audioctx);
const A=audioctx.window.BellymonAudio;
A.unlock();A.update({sfx:true,sfxVolume:30,music:false});
A.playEffect('encounter');
const src='assets/audio/sfx/combat_encounter.mp3';
check(played.some(p=>p.src===src),'encounter mp3 plays from audio API');
check(Math.abs(played.find(p=>p.src===src).volume-.255)<1e-6,'respects SFX volume');
A.setScene('combat');check(instances[src].paused,'encounter sound stops when fight starts');
A.setScene('exploration');A.update({sfx:false});
const count=played.length;A.playEffect('encounter');equal(played.length,count,'mute suppresses encounter');
A.update({sfx:true,sfxVolume:0});A.playEffect('encounter');equal(played.length,count,'0% suppresses encounter');
A.update({sfx:true,sfxVolume:30});A.playEffect('encounter');
check(played.length===count+1,'replay allowed on another encounter');
const game=fs.readFileSync(path.join(ROOT,'js/game.js'),'utf8');
check(game.includes("if(title==='COMBAT' && shouldPlayEncounterSting(STATE.slots.get(STATE.currentId)))AUDIO.playEffect('encounter')"),'room encounter audio is rank-gated');
check(game.includes('pendant les 2 prochains étages'),'trap popup shows corrected duration');
check(!game.includes('celui-ci inclus'),'UI no longer claims chest floor counts');
const ui=fs.readFileSync(path.join(ROOT,'js/combat-ui.js'),'utf8');
check(ui.includes('floor>=trap.startsAtFloor'),'combat HUD does not display pending penalties as active');
console.log(`PASS V16.1.7: ${checks} checks (audio encounter + 2 next floors + save compatibility)`);
