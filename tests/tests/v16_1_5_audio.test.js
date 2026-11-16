'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const src=fs.readFileSync(path.join(root,'js/audio.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
const motionSrc=fs.readFileSync(path.join(root,'js/v16-motion.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const expected of ['value="30"','id="combatVolume"','id="sfxVolume"','id="musicVolume"']) assert.ok(html.includes(expected),expected);
assert.equal((html.match(/type="range" min="0" max="100" step="5" value="30"/g)||[]).length,4,'4 sliders 30% par défaut (volume général + 3 indépendants)');
function runAudio(saved=null){
 const played=[],musics={};const store={};if(saved)store.bellymon_audio_preferences_v1=JSON.stringify(saved);
 class AudioMock{
  constructor(src){this.src=src;this.currentTime=0;this.volume=0;this.paused=true;this.ended=false;this.readyState=4;this.error=null;musics[src]=this;}
  play(){this.paused=false;played.push(this.src);return Promise.resolve();}
  pause(){this.paused=true;}
  addEventListener(){}
 }
 const raf=[];let rafCounter=0;
 const context={window:{},document:{hidden:false,addEventListener(){}},Audio:AudioMock,console,Math,JSON,
  localStorage:{getItem:key=>store[key]||null,setItem:(key,v)=>store[key]=v},performance:{now:()=>0},
  requestAnimationFrame:cb=>{raf.push(cb);return ++rafCounter;},cancelAnimationFrame:()=>{},setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(src,context);
 const api=context.window.BellymonAudio;
 api.start();api.unlock();
 for(let i=0;i<12&&raf.length;i++)raf.shift()(600);
 return {api,musics,played,store,drain(){for(let i=0;i<16&&raf.length;i++)raf.shift()(600);}};
}
let a=runAudio();
assert.equal(a.api.getSettings().musicVolume,30);
assert.equal(a.api.getSettings().combatVolume,30);
assert.equal(a.api.getSettings().sfxVolume,30);
assert.ok(Math.abs(a.musics['assets/audio/exploration.mp3'].volume-.30)<.0001);
a.api.setScene('combat');a.drain();
assert.ok(Math.abs(a.musics['assets/audio/combat.mp3'].volume-.30)<.0001);
a.api.update({combatVolume:70});
assert.ok(Math.abs(a.musics['assets/audio/combat.mp3'].volume-.70)<.0001,'volume combat indépendant');
a.api.setScene('exploration');a.drain();
assert.ok(Math.abs(a.musics['assets/audio/exploration.mp3'].volume-.30)<.0001,'volume exploration indépendant');
a.api.update({musicVolume:60});
assert.ok(Math.abs(a.musics['assets/audio/exploration.mp3'].volume-.60)<.0001);
assert.equal(a.api.getSettings().combatVolume,70,'réglage combat inchangé');
a=runAudio({music:true,sfx:true,musicVolume:42,sfxVolume:53});
assert.equal(a.api.getSettings().musicVolume,42,'préférences conservées');
assert.equal(a.api.getSettings().combatVolume,42,'migration ancienne musique pour combat');
assert.equal(a.api.getSettings().sfxVolume,53,'préférences effets conservées');
a=runAudio({music:false,sfx:false,musicVolume:63,combatVolume:12,sfxVolume:18});
assert.equal(a.api.getSettings().combatVolume,12,'volume combat personnalisé conservé');
assert.equal(a.api.getSettings().musicVolume,63);
assert.equal(a.api.getSettings().sfxVolume,18);

const f=gameSrc.match(/function victorySoundFor\(combat,hero\)\{[\s\S]*?\n  \}/);
assert.ok(f,'fonction intensité de combat');
const fun=vm.runInNewContext(`(${f[0]})`);
assert.equal(fun({turn:1,knockedOutIds:[]},{hp:100,maxHp:100}),'victoryBrief');
assert.equal(fun({turn:5,knockedOutIds:[]},{hp:75,maxHp:100}),'victoryBrief');
assert.equal(fun({turn:8,knockedOutIds:[]},{hp:90,maxHp:100}),'victory');
assert.equal(fun({turn:2,knockedOutIds:['a','b']},{hp:90,maxHp:100}),'victory');
assert.equal(fun({turn:4,knockedOutIds:['a']},{hp:90,maxHp:100}),'victory');
assert.equal(fun({turn:4,knockedOutIds:[]},{hp:24,maxHp:100}),'victory');
assert.equal(fun({turn:2,knockedOutIds:[]},{hp:12,maxHp:100}),'victoryBrief');
assert.ok(gameSrc.includes('AUDIO.playEffect(victorySoundFor(victorCombat,victorHero))'));
assert.ok(motionSrc.includes("window.BellymonAudio?.playEffect('trap');"));
assert.ok(!motionSrc.includes("if(isChest||kind==='trap')window.BellymonAudio?.playEffect(kind);\n      if(kind==='trap')sparkle"));
console.log('PASS V16.1.5 audio: 3 valeurs 30%, migration, volumes indépendants, intensité des victoires, déclenchement rire.');
