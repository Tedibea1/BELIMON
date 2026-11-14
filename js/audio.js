/* BELLYMON V12.0.11 — audio : démarrage automatique tenté dès le chargement.
   Si le navigateur interdit l’autoplay, la lecture repart au premier geste ordinaire.
   Le son est hors ligne, les préférences restent indépendantes des sauvegardes.
*/
(() => {
  'use strict';
  const KEY='bellymon_audio_preferences_v1';
  const defaults={music:true,sfx:true,musicVolume:35,sfxVolume:55};
  const clamp=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
  function read(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      return raw && typeof raw==='object'
        ?{music:raw.music!==false,sfx:raw.sfx!==false,
          musicVolume:clamp(raw.musicVolume??defaults.musicVolume),sfxVolume:clamp(raw.sfxVolume??defaults.sfxVolume)}
        :{...defaults};
    }catch{return {...defaults};}
  }
  let settings=read();
  let unlocked=false,hidden=document.hidden,scene='exploration',ctx=null,master=null,fadeHandle=0;
  let playing=null;
  const music={
    exploration:new Audio('assets/audio/exploration.mp3'),
    combat:new Audio('assets/audio/combat.mp3')
  };
  for(const audio of Object.values(music)){
    audio.loop=true;audio.preload='none';audio.volume=0;
    audio.addEventListener('error',()=>{
      if(audio.error)console.warn('BELLYMON audio : impossible de lire',audio.currentSrc||audio.src);
    });
  }
  function cancelFade(){if(fadeHandle){cancelAnimationFrame(fadeHandle);fadeHandle=0;}}
  function stopMusic(){
    cancelFade();
    for(const track of Object.values(music)){track.pause();track.volume=0;}
    playing=null;
  }
  function targetVolume(){return settings.music?settings.musicVolume/100:0;}
  function syncMusic(){
    const desired=(hidden||!settings.music||!settings.musicVolume)?null:music[scene];
    if(!desired){stopMusic();return;}
    const volume=targetVolume();
    if(playing===desired){
      cancelFade();desired.volume=volume;
      if(desired.paused)desired.play().catch(()=>{ /* Autorisation différée au premier geste. */ });
      return;
    }
    const previous=playing;
    cancelFade();
    playing=desired;
    desired.volume=0;
    // Le morceau reprend seulement si la fenêtre revient au premier plan.
    if(desired.ended)desired.currentTime=0;
    desired.play().catch(()=>{ /* Autorisation différée au premier geste. */ });
    const start=performance.now(),fadeMs=480;
    const fromVol=previous?.volume??0;
    const step=now=>{
      const t=Math.min(1,(now-start)/fadeMs);
      desired.volume=Math.max(0,Math.min(1,volume*t));
      if(previous && previous!==desired)previous.volume=fromVol*(1-t);
      if(t<1){fadeHandle=requestAnimationFrame(step);}
      else{
        if(previous && previous!==desired){previous.pause();previous.volume=0;}
        fadeHandle=0;
      }
    };
    fadeHandle=requestAnimationFrame(step);
  }
  function setScene(name){
    const wanted=name==='combat'?'combat':'exploration';
    if(scene===wanted)return;
    scene=wanted;
    syncMusic();
  }
  // Tente la lecture immédiatement, même sans interaction.
  // Les navigateurs qui autorisent l’autoplay la démarrent ici ; ceux qui
  // le bloquent se débloquent grâce au premier clic/toucher/clavier normal.
  function start(){syncMusic();}
  function unlock(){
    if(!unlocked)unlocked=true;
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(Ctx && !ctx){ctx=new Ctx();master=ctx.createGain();master.gain.value=.60;master.connect(ctx.destination);}
      if(ctx?.state==='suspended')ctx.resume().catch(()=>{});
    }catch(e){console.warn('BELLYMON : WebAudio indisponible',e);}
    syncMusic();
  }
  function tone(freq,duration,delay=0,type='sine',strength=.12,ending=null){
    if(!ctx||!master)return;
    const start=ctx.currentTime+Math.max(0,delay);
    const osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(Math.max(35,freq),start);
    if(ending && ending!==freq)osc.frequency.exponentialRampToValueAtTime(Math.max(35,ending),start+duration);
    g.gain.setValueAtTime(.0001,start);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,strength*settings.sfxVolume/100),start+.008);
    g.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(g);g.connect(master);
    osc.start(start);osc.stop(start+duration+.018);
  }
  const effectDefs={
    ui:()=>tone(600,.055,0,'sine',.068,680),
    encounter:()=>{tone(330,.16,0,'triangle',.15,500);tone(660,.23,.14,'sine',.12,780);},
    start:()=>{tone(380,.17,0,'triangle',.15,550);tone(570,.24,.12,'sine',.12,720);},
    light:()=>{tone(390,.12,0,'sawtooth',.105,180);tone(750,.09,.025,'triangle',.09,350);},
    heavy:()=>{tone(190,.22,0,'sawtooth',.17,63);tone(120,.18,.025,'triangle',.16,60);},
    special:()=>{tone(280,.30,0,'sine',.13,930);tone(560,.27,.1,'triangle',.12,1120);tone(900,.20,.23,'sine',.1,1300);},
    defend:()=>{tone(410,.22,0,'triangle',.17,230);tone(760,.22,.04,'sine',.07,430);},
    hit:()=>tone(170,.14,0,'sawtooth',.12,65),
    crit:()=>{tone(920,.14,0,'square',.10,1450);tone(650,.16,.10,'sine',.11,920);},
    miss:()=>tone(425,.15,0,'triangle',.075,275),
    capture:()=>{[525,660,790,1050].forEach((f,i)=>tone(f,.18,i*.13,'sine',.15));},
    captureFail:()=>{tone(495,.18,0,'sine',.12,360);tone(280,.20,.14,'triangle',.11,180);},
    chest:()=>{[500,650,820].forEach((f,i)=>tone(f,.22,i*.12,'sine',.11));},
    trap:()=>{tone(620,.35,0,'sawtooth',.14,130);tone(190,.35,.12,'triangle',.11,75);},
    victory:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,.28,i*.15,'triangle',.15));},
    defeat:()=>{[392,320,260,196].forEach((f,i)=>tone(f,.34,i*.15,'sine',.14));},
    heal:()=>{tone(480,.12,0,'sine',.08,620);tone(720,.21,.10,'triangle',.09,960);},
    feed:()=>{tone(380,.10,0,'sine',.08,460);tone(520,.14,.10,'sine',.10,620);},
    evolution:()=>{[400,500,600,800,1000,1270].forEach((f,i)=>tone(f,.28,i*.12,'sine',.12));},
    switch:()=>{tone(520,.10,0,'triangle',.10,780);tone(780,.17,.10,'sine',.12,920);}
  };
  function playEffect(kind){
    if(!unlocked||hidden||!settings.sfx||!settings.sfxVolume||!effectDefs[kind])return;
    if(ctx?.state==='suspended')ctx.resume().catch(()=>{});
    try{effectDefs[kind]();}catch(err){console.warn('BELLYMON : effet sonore indisponible',err);}
  }
  function update(patch){
    if(typeof patch?.music==='boolean')settings.music=patch.music;
    if(typeof patch?.sfx==='boolean')settings.sfx=patch.sfx;
    if(patch && Object.hasOwn(patch,'musicVolume'))settings.musicVolume=clamp(patch.musicVolume);
    if(patch && Object.hasOwn(patch,'sfxVolume'))settings.sfxVolume=clamp(patch.sfxVolume);
    try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}
    syncMusic();
    return {...settings};
  }
  function getSettings(){return {...settings};}
  document.addEventListener('visibilitychange',()=>{
    hidden=document.hidden;
    syncMusic();
    if(hidden && ctx?.state==='running')ctx.suspend().catch(()=>{});
    else if(!hidden && unlocked && ctx?.state==='suspended')ctx.resume().catch(()=>{});
  });
  window.BellymonAudio=Object.freeze({start,unlock,setScene,playEffect,update,getSettings,
    state:()=>({unlocked,scene,playing:playing===music.combat?'combat':playing===music.exploration?'exploration':null,
      media:Object.fromEntries(Object.entries(music).map(([key,a])=>[key,{paused:a.paused,
        readyState:a.readyState,currentTime:a.currentTime,error:a.error?.code||null}])),settings:getSettings()})});
})();
