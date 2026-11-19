/* BELLYMON V16.1.2 LAB — Couche visuelle uniquement, aucun tirage de gameplay ici.
   Les résultats des coffres et pièges sont déjà déterminés ET sauvegardés par game.js.
*/
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const REDUCED = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const STORAGE_KEY = 'bellymon-v16-motion';
  const AUTO_SKIP_KEY = 'bellymon-v16-auto-skip';
  let enabled = true;
  let autoSkip = false;
  try {
    enabled = localStorage.getItem(STORAGE_KEY) !== 'off';
    autoSkip = localStorage.getItem(AUTO_SKIP_KEY) === 'on';
  } catch (_) {}
  let resultTimers = [];
  let resultToken = 0;
  let resultBusy = false;
  let resultFinalize = null;
  let lastFloorKey = '';
  let lastBonusKey = '';
  let lastBonusValues = null;

  const ready = () => enabled && !REDUCED();
  function later(callback, delay) {
    const id = setTimeout(callback, delay);
    resultTimers.push(id);
    return id;
  }
  function stopTimers() { for (const timer of resultTimers) clearTimeout(timer); resultTimers = []; }
  function updateToggle() {
    document.body.classList.toggle('v16-no-motion', !ready());
    const button = $('v16MotionToggle');
    if (!button) return;
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = enabled ? '🎞️ Effets : ON' : '🎞️ Effets : OFF';
    button.title = enabled ? 'Désactiver les animations décoratives' : 'Réactiver les animations décoratives';
  }
  function updateAutoSkipToggle() {
    const button=$('v16AutoSkipToggle');
    if(!button)return;
    button.setAttribute('aria-pressed',String(autoSkip));
    button.textContent=autoSkip?'⏭ Auto : ON':'⏭ Auto : OFF';
    button.title=autoSkip?'Désactiver le passage automatique':'Passer automatiquement les révélations et roulettes';
  }
  function flash(id, cssClass='v16-pop', duration=750) {
    if (!ready()) return;
    const el = $(id);
    if (!el) return;
    el.classList.remove(cssClass);
    void el.offsetWidth;
    el.classList.add(cssClass);
    setTimeout(() => el.classList.remove(cssClass), duration);
  }
  function sparkle(id, text, icon='✨') {
    if (!ready()) return;
    const target=$(id);
    if (!target) return;
    const sign=document.createElement('div');
    sign.className='v16-float-signal';
    sign.textContent=`${icon} ${text}`;
    sign.setAttribute('aria-hidden','true');
    // Un overlay est position:fixed : lui donner position:relative le ferait
    // sortir du viewport lors du nourrissage ! Le signal s'ancre dans la fenêtre.
    const anchor=target.classList.contains('modal-overlay')
      ?(target.querySelector('.modal')||target):target;
    anchor.classList.add('v16-signal-anchor');
    anchor.append(sign);
    setTimeout(()=>{
      sign.remove();
      if(!anchor.querySelector('.v16-float-signal'))anchor.classList.remove('v16-signal-anchor');
    },1600);
  }
  function init() {
    const button=$('v16MotionToggle');
    button?.addEventListener('click', () => {
      enabled=!enabled;
      try { localStorage.setItem(STORAGE_KEY, enabled?'on':'off'); } catch (_) {}
      updateToggle();
      if (!ready() && resultBusy && typeof resultFinalize === 'function') resultFinalize();
    });
    const autoSkipButton=$('v16AutoSkipToggle');
    autoSkipButton?.addEventListener('click',()=>{
      autoSkip=!autoSkip;
      try { localStorage.setItem(AUTO_SKIP_KEY,autoSkip?'on':'off'); } catch (_) {}
      updateAutoSkipToggle();
      // Si le joueur active l'option pendant une révélation, elle se termine
      // immédiatement comme après un clic manuel sur « Passer l'animation ».
      if(autoSkip && resultBusy && typeof resultFinalize==='function')resultFinalize();
    });
    updateAutoSkipToggle();
    const skip=$('v16RevealSkip');
    skip?.addEventListener('click', () => {
      if (typeof resultFinalize === 'function') resultFinalize();
    });
    window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',updateToggle);
    updateToggle();
  }
  const trapTypes=[
    {id:'force',icon:'💪',short:'FORCE',text:'Force −20 %'},
    {id:'rapidite',icon:'⚡',short:'RAPIDITÉ',text:'Rapidité −20 %'},
    {id:'constitution',icon:'🛡️',short:'CONSTITUTION',text:'Constitution −20 %'},
    {id:'all',icon:'☠️',short:'MALÉDICTION',text:'Toutes les stats −10 %'}
  ];
  // Le jeu a déjà tiré le butin. Chaque rouleau représente UNE récompense
  // effectivement obtenue : nourriture (icône + quantité) et bonus éventuel.
  const foodSymbols=['🥩 ×2','🥩 ×3','🥩 ×4','🍖 ×1','🍖 ×2'];
  const bonusSymbols=['💪 +1','⚡ +1','🛡️ +1'];
  const bonusNames={force:'Force',rapidite:'Rapidité',constitution:'Constitution'};
  function buildReel(choices, value, index, accessibleLabel) {
    const col=document.createElement('div');col.className='v16-reel-col';
    col.setAttribute('role','img');col.setAttribute('aria-label',accessibleLabel);
    const windowEl=document.createElement('div');windowEl.className='v16-reel-window';
    const track=document.createElement('div');track.className='v16-reel-track';
    track.setAttribute('aria-hidden','true');
    const count=24+index*4;
    for(let i=0;i<=count;i++){
      const item=document.createElement('div');item.className='v16-reel-value';
      item.textContent=i===count?value:choices[(i*7+i*index+Math.floor(i/3))%choices.length];
      track.append(item);
    }
    windowEl.append(track);col.append(windowEl);
    return {col,track,count};
  }
  function endReel(reel) {
    reel.track.style.transition='none';
    reel.track.style.transform=`translate3d(0,${-reel.count*80}px,0)`;
    reel.col.classList.remove('v16-reel-new');
  }
  function spinReel(reel, ms, token) {
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(token!==resultToken||!resultBusy)return;
      reel.track.style.transition=`transform ${ms}ms cubic-bezier(.13,.78,.14,1)`;
      reel.track.style.transform=`translate3d(0,${-reel.count*80}px,0)`;
    }));
  }
  function buildSlot(container, reward, duration, token, animate) {
    const box=document.createElement('div');box.className='v16-slot-machine';
    const reels=document.createElement('div');reels.className='v16-reels';
    const food=reward?.food||{};
    const small=Number(food.small)||0,large=Number(food.large)||0;
    const foodValue=small>0?`🥩 ×${small}`:`🍖 ×${large}`;
    const foodLabel=small>0?`Steak, ${small}`:`Gigot, ${large}`;
    const primary=buildReel(foodSymbols,foodValue,0,foodLabel);
    reels.append(primary.col);box.append(reels);container.replaceChildren(box);

    // Le deuxième rouleau n'existe pas visuellement tant que le premier
    // n'a pas terminé : c'est la surprise lorsque le coffre contient un bonus.
    const bonus=bonusNames[reward?.bonus] ? reward.bonus : null;
    let extra=null;
    function addBonus(instant=false) {
      if(!bonus || extra)return;
      const value=({force:'💪 +1',rapidite:'⚡ +1',constitution:'🛡️ +1'})[bonus];
      extra=buildReel(bonusSymbols,value,1,`Bonus de collection ${bonusNames[bonus]}, niveau +1`);
      extra.col.classList.add('v16-reel-new');
      reels.append(extra.col);
      if(instant)endReel(extra);
      else spinReel(extra,Math.round(duration*.34),token);
    }
    if(animate){
      spinReel(primary,Math.round(duration*(bonus?0.46:0.86)),token);
      if(bonus)later(()=>{
        if(token===resultToken&&resultBusy)addBonus();
      },Math.round(duration*.55));
    }
    const snap=()=>{endReel(primary);addBonus(true);if(extra)endReel(extra);};
    if(!animate)snap();
    return {snap};
  }
  // Léger cliquetis électronique pendant la rotation (jamais en mode Auto
  // ou effets désactivés). Les temporisateurs s'annulent avec la révélation :
  // aucun tic après « Passer », fermeture, ou son de résultat.
  function playSpinTicks(kind,duration,token){
    const begun=Date.now();
    const effect=kind==='trap'?'trapSpin':'chestSpin';
    function tick(){
      if(token!==resultToken||!resultBusy||!ready())return;
      const progress=Math.min(1,(Date.now()-begun)/duration);
      if(progress>=.96)return;
      window.BellymonAudio?.playEffect(effect);
      later(tick,Math.round(108+progress*125));
    }
    tick();
  }
  function buildTrapWheel(container, trapType, duration, token) {
    const index=Math.max(0,trapTypes.findIndex(t=>t.id===trapType));
    const box=document.createElement('div');box.className='v16-curse-stage';
    const heading=document.createElement('div');heading.className='v16-show-title danger';heading.textContent='☠️ ROULETTE DES MALÉDICTIONS';
    const pointer=document.createElement('div');pointer.className='v16-wheel-pointer';pointer.textContent='▼';
    const frame=document.createElement('div');frame.className='v16-wheel-frame';
    const disc=document.createElement('div');disc.className='v16-wheel-disc';
    trapTypes.forEach((v,i)=>{
      const tag=document.createElement('div');tag.className=`v16-wheel-segment seg-${i}`;
      const emoji=document.createElement('strong');emoji.textContent=v.icon;
      const name=document.createElement('span');name.textContent=v.short;
      tag.append(emoji,name);disc.append(tag);
    });
    const center=document.createElement('span');center.className='v16-wheel-center';center.textContent='☠️';
    frame.append(disc,center,pointer);
    const foot=document.createElement('p');foot.className='v16-slot-caption';foot.textContent='La malédiction se révèle…';
    box.append(heading,frame,foot);container.replaceChildren(box);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(token!==resultToken||!resultBusy)return;
      disc.style.transition=`transform ${duration}ms cubic-bezier(.11,.66,.08,1)`;
      disc.style.transform=`rotate(${360*(duration>1500?7:3)-index*90}deg)`;
    }));
  }
  function buildSimple(container, kind) {
    const box=document.createElement('div');box.className=`v16-simple-reveal ${kind}`;
    const icon=document.createElement('div');icon.className='v16-simple-icon';
    icon.textContent=kind==='capture'?'🎯':kind==='victory'?'🏆':kind==='defeat'?'💀':'🎁';
    const heading=document.createElement('strong');
    heading.textContent=kind==='capture'?'NOUVELLE WAIFU !':kind==='victory'?'BUTIN REMPORTÉ !':kind==='defeat'?'DÉFAITE':'RÉCOMPENSE !';
    box.append(icon,heading);container.replaceChildren(box);
  }
  function playResult({kind='victory',reward=null,trapType=null,auto=false}={}) {
    cancelResult();
    const overlay=$('eventResultOverlay'),showcase=$('v16Showcase'),skip=$('v16RevealSkip'),close=$('eventResultClose');
    if(!overlay||!showcase||overlay.hidden||!close)return;
    const isChest=kind==='chest';
    overlay.classList.toggle('v16-chest',isChest);
    const animate=ready();
    const token=++resultToken;
    const autoSpeed=window.BellymonAuto?.SPEED||4;
    const duration=auto?Math.round(850/autoSpeed):kind==='trap'?2850:isChest?2450:1150;
    // Sans animation, le coffre reste lisible grâce à ses vrais rouleaux
    // immédiatement arrêtés : on ne fait jamais réapparaître le récapitulatif.
    if(!animate || autoSkip){
      if(isChest){showcase.hidden=false;buildSlot(showcase,reward,duration,token,false);}
      else if(kind==='trap' && autoSkip){
        // En mode auto, la roue affiche son résultat final sans rotation.
        showcase.hidden=false;
        buildTrapWheel(showcase,trapType,0,token);
        const disc=showcase.querySelector('.v16-wheel-disc');
        if(disc){
          const index=Math.max(0,trapTypes.findIndex(t=>t.id===trapType));
          disc.style.transition='none';
          disc.style.transform=`rotate(${360*7-index*90}deg)`;
        }
        const caption=showcase.querySelector('.v16-slot-caption');
        if(caption)caption.textContent='Malédiction révélée';
      }
      else {showcase.hidden=true;showcase.replaceChildren();}
      if(skip)skip.hidden=true;
      close.disabled=false;
      if(isChest||kind==='trap')window.BellymonAudio?.playEffect(kind);
      return;
    }
    resultBusy=true;
    // Ne pas dévoiler le malus avant l'arrêt de la roulette.
    if(kind==='trap' && $('eventResultText'))$('eventResultText').hidden=true;
    close.disabled=true;
    overlay.classList.add('v16-rolling');
    showcase.hidden=false;
    if(skip)skip.hidden=false;
    let slotPresentation=null;
    const final=()=>{
      if(token!==resultToken||!resultBusy)return;
      resultBusy=false;resultFinalize=null;
      stopTimers();
      if(isChest)slotPresentation?.snap();
      if(kind==='trap'){
        const disc=showcase.querySelector?.('.v16-wheel-disc');
        if(disc){
          const index=Math.max(0,trapTypes.findIndex(t=>t.id===trapType));
          disc.style.transition='none';
          disc.style.transform=`rotate(${360*7-index*90}deg)`;
        }
      }
      overlay.classList.remove('v16-rolling');
      overlay.classList.add('v16-revealed');
      if(kind==='trap' && $('eventResultText'))$('eventResultText').hidden=false;
      close.disabled=false;
      if(skip)skip.hidden=true;
      // Jouer les effets de coffre et de piège une seule fois au dévoilement.
      if(isChest)window.BellymonAudio?.playEffect('chest');
      if(kind==='trap')window.BellymonAudio?.playEffect('trap');
      if(kind==='trap')sparkle('v16Showcase','MALÉDICTION !','☠️');
      close.focus({preventScroll:true});
    };
    resultFinalize=final;
    if(isChest)slotPresentation=buildSlot(showcase,reward,duration,token,true);
    else if(kind==='trap'){
      buildTrapWheel(showcase,trapType,duration,token);
      // Le rire attend que la roulette ait fini de tourner.
    }
    else buildSimple(showcase,kind);
    if(isChest||kind==='trap')playSpinTicks(kind,duration,token);
    later(final,duration+Math.round((isChest?430:kind==='trap'?140:0)/(auto?autoSpeed:1)));
    skip?.focus({preventScroll:true});
  }
  function cancelResult() {
    ++resultToken;
    stopTimers();
    resultBusy=false;resultFinalize=null;
    const overlay=$('eventResultOverlay'),showcase=$('v16Showcase'),close=$('eventResultClose'),skip=$('v16RevealSkip');
    if($('eventResultText'))$('eventResultText').hidden=false;
    overlay?.classList.remove('v16-rolling','v16-revealed','v16-chest');
    if(showcase){showcase.hidden=true;showcase.replaceChildren();}
    if(close)close.disabled=false;
    if(skip)skip.hidden=true;
  }
  function floorChanged(slotId,floor) {
    const key=String(slotId)+':'+floor;
    if(key===lastFloorKey)return;
    const oldSlot=lastFloorKey.split(':')[0],hadFloor=oldSlot===String(slotId);
    lastFloorKey=key;
    if(hadFloor && ready()){
      flash('floorLabel','v16-floor-pop',840);
      flash('sideFloor','v16-floor-pop',840);
      if(floor>1 && (floor-1)%20===0)sparkle('paneTour',`PALIER ${floor-1} FRANCHI !`,'🏰');
    }
  }
  function bonusesUpdated(slotId,bonuses) {
    const values={force:bonuses?.force||0,rapidite:bonuses?.rapidite||0,constitution:bonuses?.constitution||0};
    if(lastBonusKey===String(slotId) && lastBonusValues && ready()){
      for(const key of Object.keys(values))if(values[key]>lastBonusValues[key]){
        flash('bonusesGrid','v16-bonus-pop',1050);
        sparkle('bonusesGrid',`${key.toUpperCase()} +1 NIVEAU`,'🏆');
      }
    }
    lastBonusKey=String(slotId);lastBonusValues=values;
  }
  function feed({evolves=false,rank=''}={}) {
    if(!ready())return;
    flash('detailPortrait',evolves?'v16-evolution-burst':'v16-food-bounce',evolves?1650:750);
    flash('detailEvolutionFill','v16-evolution-glow',1200);
    if(evolves)sparkle('waifuDetailOverlay',`ÉVOLUTION — RANG ${rank} !`,'🧬');
    else sparkle('waifuDetailOverlay','POINTS D’ÉVOLUTION','🍽️');
  }
  const classEffects={epeiste:'⚔️',bagarreuse:'⚡',archere_arcanique:'🏹',occultiste:'🔮',pretresse:'🌸',griffeuse:'🐾',vampire:'🦇',spectre:'👻',nemesis:'🪞',maudite:'🩸',envouteuse:'🔮',exorciste:'✨'};
  function battle({playerAction='',enemyAction='',playerClass='',enemyClass='',auto=false}={}) {
    if(!ready())return;
    const area=document.querySelector('.arena-cards');if(!area)return;
    if(playerAction==='special'||enemyAction==='special'){
      const v=document.createElement('div');v.className='v16-battle-magic';
      v.textContent=(playerAction==='special'?classEffects[playerClass]||'✨':'')+' '+(enemyAction==='special'?classEffects[enemyClass]||'✨':'');
      v.setAttribute('aria-hidden','true');area.append(v);
      setTimeout(()=>v.remove(),auto?Math.round(350/(window.BellymonAuto?.SPEED||4)):680);
    }
    if(playerAction==='heavy')flash('activePortrait','v16-attack-swish',auto?Math.round(470/(window.BellymonAuto?.SPEED||4)):470);
    if(enemyAction==='heavy')flash('eventEnemyPortrait','v16-attack-swish',auto?Math.round(470/(window.BellymonAuto?.SPEED||4)):470);
  }
  function captureAttempt(success) {
    if(!ready())return;
    const area=document.querySelector('.arena-cards');if(!area)return;
    const fx=document.createElement('div');fx.className=`v16-capture-ring${success?' is-success':' is-failed'}`;
    fx.textContent=success?'✦':'◎';fx.setAttribute('aria-hidden','true');
    area.append(fx);setTimeout(()=>fx.remove(),900);
  }
  window.BellymonMotion=Object.freeze({init,playResult,cancelResult,isBusy:()=>resultBusy,isAutoSkip:()=>autoSkip,flash,sparkle,floorChanged,bonusesUpdated,feed,battle,captureAttempt,isEnabled:ready});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
