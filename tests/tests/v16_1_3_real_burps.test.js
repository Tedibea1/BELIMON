// BELLYMON V16.1.3 : les 9 fichiers choisis par le joueur remplacent les sons synthétiques.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const files=fs.readdirSync(path.join(root,'assets/audio/burps')).filter(x=>x.endsWith('.mp3')).sort();
assert.deepEqual(files,Array.from({length:9},(_,i)=>`rot_${String(i+1).padStart(2,'0')}.mp3`));
for(const name of files){
 const buf=fs.readFileSync(path.join(root,'assets/audio/burps',name));
 assert.ok(buf.length>10000,'sound is a real encoded file '+name);
 assert.ok(buf.subarray(0,3).toString()==='ID3'||(buf[0]===0xff&&(buf[1]&0xe0)===0xe0),'MP3 header '+name);
}
const played=[];
const sounds=[];
class AudioMock{
 constructor(src){this.src=src;this.volume=0;this.paused=true;this.ended=false;this.currentTime=0;this.error=null;this.readyState=4;sounds.push(this);}
 play(){this.paused=false;if(this.src.includes('/burps/'))played.push({src:this.src,volume:this.volume});return Promise.resolve();}
 pause(){this.paused=true;}
 addEventListener(){}
}
const settingsStore={};
const document={hidden:false,addEventListener(){}};
const window={};
const ctx={window,document,Audio:AudioMock,console,Math,JSON,localStorage:{getItem:k=>settingsStore[k]||null,setItem:(k,v)=>settingsStore[k]=v},
 performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},setTimeout,clearTimeout};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/audio.js'),'utf8'),ctx);
const A=window.BellymonAudio;
A.unlock();
A.update({sfx:true,sfxVolume:80,music:false});
for(let i=0;i<120;i++)A.playEffect('burp');
assert.equal(played.length,120,'all user actions play a burp');
const all=new Set(played.map(x=>x.src));
assert.equal(all.size,9,'all nine samples are reachable');
for(let i=1;i<played.length;i++)assert.notEqual(played[i-1].src,played[i].src,'never the same sample twice in a row');
assert.ok(played.every(x=>Math.abs(x.volume-0.68)<1e-8),'effective sound volume follows slider');
for(const p of played)assert.ok(/^assets\/audio\/burps\/rot_\d{2}\.mp3$/.test(p.src));
A.update({sfxVolume:20});A.playEffect('burp');
assert.ok(Math.abs(played.at(-1).volume-0.17)<1e-8,'volume changes apply to the next sample');
A.update({sfx:false});A.playEffect('burp');assert.equal(played.length,121,'sound muted by toggle');
A.update({sfx:true,sfxVolume:0});A.playEffect('burp');assert.equal(played.length,121,'sound muted by zero volume');
assert.match(fs.readFileSync(path.join(root,'js/game.js'),'utf8'),/setTimeout\(\(\)=>AUDIO\.playEffect\('burp'\)/,'feeding still triggers burps');
assert.match(fs.readFileSync(path.join(root,'js/game.js'),'utf8'),/\$\('audioPreviewBtn'\)\.addEventListener\('click',[^\n]*AUDIO\.playEffect\('burp'\)/,'audio preview still triggers burps');
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/V16\.1\.9 LAB/,'version updated');
console.log('BELLYMON V16.1.3 : 9 fichiers MP3, 121 lectures simulées, 9 échantillons distincts, sans répétition et volume vérifié.');
