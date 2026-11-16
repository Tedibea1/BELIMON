/* BELLYMON: deterministic checks of the three music scenes and crossfades.
   Run: node tests/tests/music_transitions.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const audioCode=fs.readFileSync('js/audio.js','utf8');
const gameCode=fs.readFileSync('js/game.js','utf8');
assert.match(gameCode,/ev\.state==='pending'\?'preparation':'exploration'/);
assert.match(gameCode,/\['fighting','awaiting_switch'\]\.includes\(ev\.state\)/);
assert.ok(fs.statSync('assets/audio/preparation.mp3').size>100000,'Missing preparation MP3');

const files=new Map();
class FakeAudio {
  constructor(src){
    this.src=src;this.volume=0;this.paused=true;this.loop=false;
    this.preload='';this.currentTime=0;this.ended=false;this.error=null;this.readyState=4;
    files.set(src,this);
  }
  addEventListener(){}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
}
let now=0, nextId=1;
const animationFrames=new Map(),listeners={};
const doc={
  hidden:false,
  addEventListener(name,handler){listeners[name]=handler;}
};
const memory=new Map();
const sandbox={
  Audio:FakeAudio,
  document:doc,
  window:{},
  localStorage:{
    getItem:k=>memory.get(k)||null,
    setItem:(k,v)=>memory.set(k,v)
  },
  performance:{now:()=>now},
  requestAnimationFrame:cb=>{const id=nextId++;animationFrames.set(id,cb);return id;},
  cancelAnimationFrame:id=>animationFrames.delete(id),
  console
};
vm.runInNewContext(audioCode,sandbox,{filename:'js/audio.js'});
const audio=sandbox.window.BellymonAudio;
const explore=files.get('assets/audio/exploration.mp3');
const prep=files.get('assets/audio/preparation.mp3');
const combat=files.get('assets/audio/combat.mp3');
const music=[explore,prep,combat];
assert.ok(music.every(Boolean),'All three music tracks should be registered');
assert.ok(music.every(m=>m.loop),'All three music tracks must loop');
const eq=(a,b,msg)=>assert.ok(Math.abs(a-b)<.005,(msg||'Volume mismatch')+': '+a+' vs '+b);
const activeOnly=expected=>{
  for(const track of music){
    if(track===expected){assert.equal(track.paused,false);}
    else{assert.equal(track.paused,true);eq(track.volume,0);}
  }
};
function advance(ms){
  now+=ms;
  const callbacks=[...animationFrames.values()];
  animationFrames.clear();
  for(const fn of callbacks)fn(now);
}
audio.start();advance(1500);eq(explore.volume,.3);activeOnly(explore);
assert.equal(audio.state().scene,'exploration');

audio.setScene('preparation');
advance(750);
eq(explore.volume,.15,'Exploration should fade out');
eq(prep.volume,.15,'Preparation should fade in');
advance(750);eq(prep.volume,.3);activeOnly(prep);
assert.equal(audio.state().playing,'preparation');

audio.setScene('combat');
advance(750);eq(prep.volume,.15);eq(combat.volume,.15);
advance(750);eq(combat.volume,.3);activeOnly(combat);

audio.setScene('exploration');
advance(1500);eq(explore.volume,.3);activeOnly(explore);

// Interrupt a fade before completion: no orphaned tracks.
audio.setScene('preparation');advance(350);
audio.setScene('combat');advance(320);
audio.setScene('exploration');advance(1500);
activeOnly(explore);

// Changing user volume keeps the transition target accurate.
audio.update({musicVolume:50,combatVolume:75});
eq(explore.volume,.5);
audio.setScene('combat');advance(1500);eq(combat.volume,.75);activeOnly(combat);
audio.setScene('preparation');advance(1500);eq(prep.volume,.5);activeOnly(prep);

// A rerender/settings update during a fade must not restart it.
audio.setScene('combat');advance(750);
const halfway=combat.volume;
audio.update({sfxVolume:45});
advance(750);eq(combat.volume,.75);activeOnly(combat);
assert.ok(halfway>.25&&halfway<.5,'Expected intermediate volume');

// Music OFF stops all three tracks immediately, volume zero included.
audio.update({music:false});
assert.ok(music.every(x=>x.paused&&x.volume===0));
audio.update({music:true});advance(1500);activeOnly(combat);

// Browser background hides and stops all; coming back resumes the chosen scene.
doc.hidden=true;listeners.visibilitychange();
assert.ok(music.every(x=>x.paused&&x.volume===0));
doc.hidden=false;listeners.visibilitychange();advance(1500);activeOnly(combat);

// Unsupported scene names safely fall back to exploration.
audio.setScene('unknown');advance(1500);activeOnly(explore);
assert.equal(audio.state().scene,'exploration');
console.log('PASS: 3 themes, 1.5 s fades, interruptions, settings, OFF and background tab.');
