// V16.1.4 : jingles MP3 au bon moment et réglages de volume.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
for(const [file,min] of [['chest_treasure.mp3',10000],['victory_fanfare.mp3',10000],['trap_evil_laugh.mp3',10000]]){
 const buf=fs.readFileSync(path.join(root,'assets/audio/sfx',file));
 assert.ok(buf.length>min,`${file} doit être un vrai MP3`);
 assert.ok(buf.subarray(0,3).toString()==='ID3'||(buf[0]===0xff&&(buf[1]&0xe0)===0xe0),`${file} : en-tête MP3`);
}
const played=[];const sources={};
class AudioMock{
 constructor(src){this.src=src;this.volume=0;this.paused=true;this.ended=false;this.currentTime=0;this.error=null;this.readyState=4;sources[src]=this;}
 play(){this.paused=false;played.push({src:this.src,volume:this.volume});return Promise.resolve();}
 pause(){this.paused=true;}
 addEventListener(){}
}
const settingsStore={};
const document={hidden:false,addEventListener(){}};
const window={};
const ctx={window,document,Audio:AudioMock,console,Math,JSON,localStorage:{getItem:k=>settingsStore[k]||null,setItem:(k,v)=>settingsStore[k]=v},
 performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'js/audio.js'),'utf8'),ctx);
const A=window.BellymonAudio;A.unlock();A.update({sfx:true,sfxVolume:70,music:false});
A.playEffect('chest');A.playEffect('trap');A.playEffect('victory');
assert.deepEqual(played.filter(p=>p.src.includes("/sfx/")).map(p=>p.src),[
 'assets/audio/sfx/chest_treasure.mp3','assets/audio/sfx/trap_evil_laugh.mp3','assets/audio/sfx/victory_fanfare.mp3']);
assert.ok(played.filter(p=>p.src.includes('/sfx/')).every(p=>Math.abs(p.volume-.595)<1e-7),'respecte le volume SFX');
A.update({sfxVolume:20});A.playEffect('chest');
assert.ok(Math.abs(played.at(-1).volume-.17)<1e-8,'curseur pris en compte');
A.update({sfx:false});A.playEffect('trap');assert.equal(played.filter(p=>p.src.includes('/sfx/')).length,4,'OFF = muet');
A.update({sfx:true,sfxVolume:0});A.playEffect('chest');assert.equal(played.filter(p=>p.src.includes('/sfx/')).length,4,'0 % = muet');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
assert.ok(!game.includes("AUDIO.playEffect(trapped?'trap':'chest');"),'aucun jingle anticipé à l’ouverture');
const motion=fs.readFileSync(path.join(root,'js/v16-motion.js'),'utf8');
assert.ok(motion.includes("window.BellymonAudio?.playEffect('trap')"),'rire à la révélation');
assert.match(game,/AUDIO\.playEffect\(victorySoundFor\(victorCombat,victorHero\)\)/,'fanfare selon intensité du combat');
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/V16\.1\.9 LAB/);
console.log('BELLYMON V16.1.4 : les 3 jingles, volume/mute et déclenchements après la roulette sont vérifiés.');
