/* BELLYMON: deterministic checks of three scenes and sequential music fades.
   Run: node tests/tests/music_transitions.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const audioCode=fs.readFileSync('js/audio.js','utf8');
const gameCode=fs.readFileSync('js/game.js','utf8');
assert.match(gameCode,/ev\.state==='pending'\?'preparation':'exploration'/);
assert.match(gameCode,/\['fighting','awaiting_switch'\]\.includes\(ev\.state\)/);
assert.doesNotMatch(audioCode,/combat_encounter|shouldPlayEncounterSting|resultSounds\.encounter/);
assert.doesNotMatch(gameCode,/shouldPlayEncounterSting|playEffect\(['"]encounter['"]\)/);
assert.ok(!fs.existsSync('assets/audio/sfx/combat_encounter.mp3'));
assert.ok(fs.statSync('assets/audio/preparation.mp3').size>100000);

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
const frames=new Map(),listeners={};
const doc={hidden:false,addEventListener(name,handler){listeners[name]=handler;}};
const memory=new Map();
const sandbox={
  Audio:FakeAudio,document:doc,window:{},
  localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},
  performance:{now:()=>now},
  requestAnimationFrame:cb=>{const id=nextId++;frames.set(id,cb);return id;},
  cancelAnimationFrame:id=>frames.delete(id),console
};
vm.runInNewContext(audioCode,sandbox,{filename:'js/audio.js'});
const audio=sandbox.window.BellymonAudio;
const exploration=files.get('assets/audio/exploration.mp3');
const preparation=files.get('assets/audio/preparation.mp3');
const combat=files.get('assets/audio/combat.mp3');
const tracks=[exploration,preparation,combat];
assert.ok(tracks.every(Boolean),'Missing a theme');
assert.ok(tracks.every(t=>t.loop),'All three tracks must loop');
const eq=(a,b,msg)=>assert.ok(Math.abs(a-b)<.005,(msg||'Volume mismatch')+': '+a+' vs '+b);
function assertNoOverlap(){
  assert.ok(tracks.filter(t=>!t.paused && t.volume>0.0001).length<=1,
    'Two music tracks must never be audible together');
}
function advance(ms){
  now+=ms;
  const work=[...frames.values()];
  frames.clear();
  for(const cb of work)cb(now);
  assertNoOverlap();
}
function checkOnly(track,volume){
  for(const item of tracks){
    if(item===track){assert.equal(item.paused,false);eq(item.volume,volume);}
    else{assert.equal(item.paused,true);eq(item.volume,0);}
  }
}
function transitionTo(name,from,to,outVolume,inVolume){
  audio.setScene(name);
  assert.equal(to.paused,true,'Incoming track must not play during fade-out');
  advance(375);
  eq(from.volume,outVolume/2,'Outgoing track fades first');
  assert.equal(to.paused,true,'Incoming track still paused during fade-out');
  eq(to.volume,0,'Incoming track silent');
  advance(375);
  assert.equal(from.paused,true,'Outgoing track is fully stopped at the midpoint');
  eq(from.volume,0);
  assert.equal(to.paused,false,'Incoming track begins only AFTER outgoing stops');
  eq(to.volume,0,'Incoming track begins from silence');
  advance(375);
  eq(to.volume,inVolume/2,'Incoming fade-in halfway');
  advance(375);
  checkOnly(to,inVolume);
}

audio.start();advance(375);eq(exploration.volume,.15);
advance(375);checkOnly(exploration,.3);
transitionTo('preparation',exploration,preparation,.3,.3);
transitionTo('combat',preparation,combat,.3,.3);
transitionTo('exploration',combat,exploration,.3,.3);

// Rapidly changing destinations during fade-out cannot start the wrong track.
audio.setScene('preparation');advance(250);
assert.equal(preparation.paused,true);
audio.setScene('combat');advance(200);
assert.equal(preparation.paused,true);
assert.equal(combat.paused,true);
audio.setScene('exploration');advance(750);
checkOnly(exploration,.3);

// Change scene while the new track is fading IN.
audio.setScene('preparation');advance(750);advance(250);
assert.ok(preparation.volume>0 && preparation.volume<.3);
audio.setScene('combat');assert.equal(combat.paused,true);
advance(750);eq(preparation.volume,0);assert.equal(preparation.paused,true);
assert.equal(combat.paused,false);eq(combat.volume,0);
advance(750);checkOnly(combat,.3);

// Respect independent user volume controls and changes during an active fade.
audio.update({musicVolume:50,combatVolume:75});
checkOnly(combat,.75);
transitionTo('preparation',combat,preparation,.75,.5);
audio.setScene('combat');advance(375);
audio.update({sfxVolume:45}); // Rerenders do not reset the outgoing fade.
advance(375);eq(preparation.volume,0);assert.equal(combat.paused,false);
advance(750);checkOnly(combat,.75);

// Muting and hiding stop all tracks immediately; resuming fades in only one.
audio.update({music:false});
assert.ok(tracks.every(t=>t.paused&&t.volume===0));
audio.update({music:true});advance(750);checkOnly(combat,.75);
doc.hidden=true;listeners.visibilitychange();
assert.ok(tracks.every(t=>t.paused&&t.volume===0));
doc.hidden=false;listeners.visibilitychange();advance(750);checkOnly(combat,.75);

// Invalid scene identifiers still fall back to exploration with no overlap.
transitionTo('unrecognized',combat,exploration,.75,.5);
assert.equal(audio.state().scene,'exploration');
console.log('PASS: sequential 750ms fade-out + 750ms fade-in; no overlap; fast switches; settings; background.');
