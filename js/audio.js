/* BELLYMON V12.0.11 — audio : démarrage automatique tenté dès le chargement.
   Si le navigateur interdit l’autoplay, la lecture repart au premier geste ordinaire.
   Le son est hors ligne, les préférences restent indépendantes des sauvegardes.
*/
(() => {
  'use strict';
  const KEY='bellymon_audio_preferences_v1';
  // Valeurs au premier lancement. Les choix audio déjà sauvegardés sont conservés.
  const defaults={music:true,sfx:true,musicVolume:30,combatVolume:30,sfxVolume:30};
  const clamp=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
  function read(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      if(raw && typeof raw==='object'){
        // Migration : les anciennes versions avaient un seul curseur pour les
        // deux musiques. Il conserve sa valeur pour les deux tant que le joueur
        // n'a pas choisi un volume de combat distinct.
        const previousMusic=raw.musicVolume??defaults.musicVolume;
        return {music:raw.music!==false,sfx:raw.sfx!==false,
          musicVolume:clamp(previousMusic),combatVolume:clamp(raw.combatVolume??previousMusic),
          sfxVolume:clamp(raw.sfxVolume??defaults.sfxVolume)};
      }
      return {...defaults};
    }catch{return {...defaults};}
  }
  let settings=read();
  let unlocked=false,hidden=document.hidden,scene='exploration',ctx=null,master=null,fadeHandle=0;
  // Les fichiers MP3 sont déjà proches de leur niveau final à 30 %, tandis que
  // les oscillateurs WebAudio restaient presque inaudibles. On augmente
  // uniquement les effets synthétiques, sans toucher aux MP3 ni aux volumes
  // mémorisés par le joueur. Un limiteur protège des superpositions de notes.
  const SYNTH_LOUDNESS=3.8;

  let playing=null;
  const music={
    exploration:new Audio('assets/audio/exploration.mp3'),
    preparation:new Audio('assets/audio/preparation.mp3'),
    combat:new Audio('assets/audio/combat.mp3')
  };
  // V16.1.3 : neuf vrais enregistrements sélectionnés par le joueur, hors connexion.
  const burps=Array.from({length:9},(_,i)=>new Audio(`assets/audio/burps/rot_${String(i+1).padStart(2,'0')}.mp3`));
  burps.forEach(sound=>{sound.preload='auto';});
  // V16.1.7 : les trois jingles et le suspense de rencontre fournis par le joueur.
  // Lecture locale, pas de nouveau tirage de loot ; toutes les règles restent inchangées.
  const resultSounds={
    encounter:new Audio('assets/audio/sfx/combat_encounter.mp3'),
    chest:new Audio('assets/audio/sfx/chest_treasure.mp3'),
    victory:new Audio('assets/audio/sfx/victory_fanfare.mp3'),
    trap:new Audio('assets/audio/sfx/trap_evil_laugh.mp3')
  };
  Object.values(resultSounds).forEach(sound=>{sound.preload='auto';});
  let activeResultSound=null;
  function playResultSound(kind){
    const sound=resultSounds[kind];
    if(!sound)return;
    if(activeResultSound){activeResultSound.pause();}
    activeResultSound=sound;
    sound.volume=Math.min(1,settings.sfxVolume/100*.85);
    try{sound.currentTime=0;}catch(_){}
    sound.play().catch(err=>{
      if(err?.name!=='AbortError')console.warn('BELLYMON : jingle indisponible',err);
    });
  }
  let lastBurp=-1,activeBurp=null;
  function playRandomBurp(){
    // Choix uniformément aléatoire en EXCLUANT le dernier rot entendu.
    const index=(lastBurp+1+Math.floor(Math.random()*(burps.length-1)))%burps.length;
    lastBurp=index;
    const sound=burps[index];
    if(activeBurp && activeBurp!==sound){activeBurp.pause();}
    activeBurp=sound;
    sound.volume=Math.min(1,settings.sfxVolume/100*.85);
    try{sound.currentTime=0;}catch(_){}
    sound.play().catch(err=>{
      if(err?.name!=='AbortError')console.warn('BELLYMON : lecture du rot indisponible',err);
    });
  }
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
  function targetVolume(){return settings.music?(scene==='combat'?settings.combatVolume:settings.musicVolume)/100:0;}
  // Fondu croisé sur 1,5 seconde entre exploration, préparation et combat.
  // Chaque fondu part du volume ACTUEL des trois pistes : une interruption
  // rapide ne doit ni couper la musique, ni laisser une piste orpheline audible.
  function syncMusic(){
    const desired=(hidden||!settings.music||!targetVolume())?null:music[scene];
    if(!desired){stopMusic();return;}
    if(playing===desired){
      // Les rendus répétés ne doivent jamais remettre le fondu à zéro.
      if(!fadeHandle)desired.volume=targetVolume();
      if(desired.paused)desired.play().catch(()=>{ /* Autorisation différée au premier geste. */ });
      return;
    }
    cancelFade();
    const initialVolumes=new Map(Object.values(music).map(track=>[track,track.volume]));
    playing=desired;
    if(desired.ended)desired.currentTime=0;
    desired.play().catch(()=>{ /* Autorisation différée au premier geste. */ });
    const startedAt=performance.now();
    const fadeMs=1500;
    const step=now=>{
      const progress=Math.min(1,Math.max(0,(now-startedAt)/fadeMs));
      for(const track of Object.values(music)){
        const from=initialVolumes.get(track)||0;
        const to=track===desired?targetVolume():0;
        track.volume=Math.max(0,Math.min(1,from+(to-from)*progress));
        if(progress>=1 && track!==desired){track.pause();track.volume=0;}
      }
      if(progress<1)fadeHandle=requestAnimationFrame(step);
      else fadeHandle=0;
    };
    fadeHandle=requestAnimationFrame(step);
  }
  function setScene(name){
    const wanted=['exploration','preparation','combat'].includes(name)?name:'exploration';
    if(scene===wanted)return;
    scene=wanted;
    // L'annonce de rencontre ne doit pas masquer la musique du duel.
    if(scene==='combat' && activeResultSound===resultSounds.encounter){
      activeResultSound.pause();activeResultSound=null;
    }
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
      if(Ctx && !ctx){
        ctx=new Ctx();
        master=ctx.createGain();master.gain.value=.90;
        const limiter=ctx.createDynamicsCompressor();
        limiter.threshold.value=-9;
        limiter.knee.value=5;
        limiter.ratio.value=12;
        limiter.attack.value=.003;
        limiter.release.value=.12;
        master.connect(limiter);limiter.connect(ctx.destination);
      }
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
    // Même volume utilisateur que pour les MP3 ; calibrage réservé aux sons
    // synthétiques (bips, impacts, roulette, évolution, victoire courte…).
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,Math.min(.85,strength*SYNTH_LOUDNESS*settings.sfxVolume/100)),start+.008);
    g.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(g);g.connect(master);
    osc.start(start);osc.stop(start+duration+.018);
  }
  const effectDefs={
    ui:()=>tone(600,.055,0,'sine',.068,680),
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
    // Très courts clics électroniques tant que les roulettes tournent.
    // Leur volume est volontairement discret pour les ouvertures répétées.
    chestSpin:()=>tone(1070,.037,0,'triangle',.077,720),
    trapSpin:()=>tone(650,.047,0,'triangle',.072,420),
    trap:()=>{tone(620,.35,0,'sawtooth',.14,130);tone(190,.35,.12,'triangle',.11,75);},
    // Victoire rapide : feedback léger, réservé aux combats routiniers.
    victoryBrief:()=>{tone(610,.095,0,'sine',.08,780);tone(920,.16,.085,'sine',.095,1110);},
    victory:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,.28,i*.15,'triangle',.15));},
    defeat:()=>{[392,320,260,196].forEach((f,i)=>tone(f,.34,i*.15,'sine',.14));},
    heal:()=>{tone(480,.12,0,'sine',.08,620);tone(720,.21,.10,'triangle',.09,960);},
    feed:()=>{tone(380,.10,0,'sine',.08,460);tone(520,.14,.10,'sine',.10,620);},
    evolution:()=>{[400,500,600,800,1000,1270].forEach((f,i)=>tone(f,.28,i*.12,'sine',.12));},
    switch:()=>{tone(520,.10,0,'triangle',.10,780);tone(780,.17,.10,'sine',.12,920);}
  };
  function playEffect(kind){
    if(!unlocked||hidden||!settings.sfx||!settings.sfxVolume)return;
    if(Object.hasOwn(resultSounds,kind)){
      try{playResultSound(kind);}catch(err){console.warn('BELLYMON : effet MP3 indisponible',err);}
      return;
    }
    if(kind==='burp'){
      try{playRandomBurp();}catch(err){console.warn('BELLYMON : rot indisponible',err);}
      return;
    }
    if(!effectDefs[kind])return;
    if(ctx?.state==='suspended')ctx.resume().catch(()=>{});
    try{effectDefs[kind]();}catch(err){console.warn('BELLYMON : effet sonore indisponible',err);}
  }
  function update(patch){
    if(typeof patch?.music==='boolean')settings.music=patch.music;
    if(typeof patch?.sfx==='boolean')settings.sfx=patch.sfx;
    if(patch && Object.hasOwn(patch,'musicVolume'))settings.musicVolume=clamp(patch.musicVolume);
    if(patch && Object.hasOwn(patch,'combatVolume'))settings.combatVolume=clamp(patch.combatVolume);
    if(patch && Object.hasOwn(patch,'sfxVolume'))settings.sfxVolume=clamp(patch.sfxVolume);
    try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}
    if(activeBurp){
      activeBurp.volume=Math.min(1,settings.sfxVolume/100*.85);
      if(!settings.sfx || !settings.sfxVolume)activeBurp.pause();
    }
    if(activeResultSound){
      activeResultSound.volume=Math.min(1,settings.sfxVolume/100*.85);
      if(!settings.sfx || !settings.sfxVolume)activeResultSound.pause();
    }
    syncMusic();
    return {...settings};
  }
  function getSettings(){return {...settings};}
  document.addEventListener('visibilitychange',()=>{
    hidden=document.hidden;
    syncMusic();
    if(hidden && activeResultSound)activeResultSound.pause();
    if(hidden && activeBurp)activeBurp.pause();
    if(hidden && ctx?.state==='running')ctx.suspend().catch(()=>{});
    else if(!hidden && unlocked && ctx?.state==='suspended')ctx.resume().catch(()=>{});
  });
  window.BellymonAudio=Object.freeze({start,unlock,setScene,playEffect,update,getSettings,
    state:()=>({unlocked,scene,playing:playing===music.combat?'combat':playing===music.preparation?'preparation':playing===music.exploration?'exploration':null,
      media:Object.fromEntries(Object.entries(music).map(([key,a])=>[key,{paused:a.paused,
        readyState:a.readyState,currentTime:a.currentTime,error:a.error?.code||null}])),settings:getSettings()})});
})();
