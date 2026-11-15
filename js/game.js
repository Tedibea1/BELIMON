/* BELLYMON — V12 (2026-11)
   Parties multiples V1, interface responsive V1.1, tour infinie V2, combat V3.
   Deux salles/étage : repos puis événement ; tirage 60% combat,
   30% coffre, 10% coffre piégé caché jusqu'à l'ouverture.
   Combats manuels réels V3 : attaque légère/lourde/défense, IA, dégâts,
   esquive, critiques, énergie. V3.1 : six spéciales et 15 s/tour.
   V4 : relais sur KO et convalescence. V5 : butins des victoires et des coffres, bonus permanents et popups.
   V6 : capture, doublons, choix rapide des combattantes et galerie des prises.
   V7 : nourrissage, évolution E–S, choix de morphologie et sprites dynamiques.
   V8 : niveaux de bonus permanents partagés et détails d'attribution.
   V9 : pièges, malus temporaires cumulatifs et échéances par étage.
   V10 : combat AUTO contrôlable et bouton MAX pour les gigots.
   V11 : double support sauvegarde, révisions anti-conflit, export de toutes les parties et reprise sécurisée.
   V12 : lisibilité des tours, impacts, malus détaillés, duel d’épuisement et tests finaux.
   V12.0.6 : 3 combattantes maximum par duel, rôles et morphologies décrits sans chiffres.
   V12.0.7 : bandeau de combat épuré, musiques originales et bruitages réglables.
   V12.0.8 : siphon de 4 tours, musique dans « Mes parties », coffres/pièges ouverts après annonce.
   V14.9 : Griffes fatales Force ×1,0, critique garanti ×3 sur réussite ; réussite liée à l’écart de RAP (0 à 100 %).
   V15 : RAP comparée pour critique/esquive (0/50/100 % à −100/0/+100).
   V15.1 : critique/esquive ordinaires = plancher(RAP/2) comme Furry RPG ; Griffes fatales restaurée, critique garanti ×2.
   V15.2 : Griffes fatales applique le test proportionnel d’Assassinat, puis l’esquive adverse.
   V15.3 : ascenseur moins cher selon arrondi(n²/12) ; combats et autres dépenses inchangés.
   Attaque lourde : précision comparative, sans double jet d’esquive, Force ×1,5.
   V12.0.10 : siphon −2 EN/s, malédiction −2 %/s plafonnée à −50 %, sans cooldown et renouvelable.
   V12.0.12 : résumé du tour sous les commandes, sans changement de statistiques.
   V12.0.14 : décisions simultanées avec chrono commun.
   V12.0.15 : légère coûte 2 EN ; Siphon d’énergie retire 5 EN/s, sans modifier les autres actions.
   V12.0.16 : Siphon d’énergie rééquilibré à 3 EN/s, durée 4 tours inchangée.
   V12.0.17 : compétence de Bagarreuse affichée sous le nom Absorption ; identifiant technique siphon inchangé pour les sauvegardes.
   V12.0.18 : Rapidité et Défense prioritaire, énergie revue, PV persistants, hôpital 3 lits et barres de vie en collection.
   V12.0.19 : Récupération 0 EN (+⅔ jauge, +30 % dégâts subis ce tour), AUTO préservé.
   V12.0.20 : steak 🥩 5 pts, gigot 🍖 25 pts ; noms et récompenses actualisés.
   V13 : boutique de potions, achats en nourriture, inventaire et soins hors combat.
   V14 : six classes capturables à partir du rang D et compétences spéciales inédites.
   V14.1 : Récupération limitée à une utilisation tous les six tours (5 tours de recharge).
   V14.2 : Boutique réservée aux achats à l’étage 1 ; potions utilisables dans la fiche de chaque waifu.
   V14.3 : Prix dégressifs des potions : 9/15/21 steaks ou 3/5/7 gigots.
   V14.4 : Ascenseur payant à l’étage 1, retour n−5 ou n avec prix exponentiels.
   V14.5 : AUTO explore, engage et termine les événements ; raccourcis remis en page sur PC.
   V14.6 : waifu active toujours en tête de collection, tri des autres inchangé.
   V14.7 : Vol de puissance de l’Envoûteuse passe de 20 % à un vol fixe de 20 FOR maximum.
   V14.8 : Malédiction du sang de la Maudite retire 10 % des PV max par attaque offensive (au lieu de 5 %).
   V15.4 : Maudite et Envoûteuse attaquent (×1,0) avant d’appliquer leurs malus pour T+1 à T+3 ; Miroir et Purification durent 5 tours, activation incluse.
   Projet original, sans réutilisation du code tiers de Bellyverse.
*/
(() => {
  'use strict';

  // Identifiant technique historique conservé pour charger les anciennes parties V1–V4.
  const FORMAT = 'tour-des-waifus-v1';
  const COMBAT = window.TDWCombat;
  const REWARDS = window.BellymonRewards;
  const CAPTURE = window.BellymonCapture;
  const EVOLUTION = window.BellymonEvolution;
  const BONUSES = window.BellymonBonuses;
  const TRAPS = window.BellymonTraps;
  const AUTO = window.BellymonAuto;
  const COMBAT_UI = window.BellymonCombatUI;
  const AUDIO = window.BellymonAudio;
  const HOSPITAL = window.BellymonHospital;
  const SHOP = window.BellymonShop;
  const SHORTCUTS = window.BellymonShortcuts;
  if(!COMBAT)throw Error('Le moteur de combat est introuvable.');
  if(!REWARDS)throw Error('Le module de butin V5 est introuvable.');
  if(!CAPTURE)throw Error('Le module de capture V6 est introuvable.');
  if(!EVOLUTION)throw Error('Le module d’évolution V7 est introuvable.');
  if(!BONUSES)throw Error('Le module de bonus V8 est introuvable.');
  if(!TRAPS)throw Error('Le module de pièges V9 est introuvable.');
  if(!AUTO)throw Error('Le module de combat AUTO V10 est introuvable.');
  if(!COMBAT_UI)throw Error('Le module d’affichage V12 est introuvable.');
  if(!AUDIO)throw Error('Le module audio V12.0.7 est introuvable.');
  if(!HOSPITAL)throw Error('Le module Hôpital V12.0.18 est introuvable.');
  if(!SHOP)throw Error('Le module Boutique V13 est introuvable.');
  if(!SHORTCUTS)throw Error('Le module Ascenseur V14.4 est introuvable.');
  if(!window.BellymonGuide)throw Error('Le Guide V15.5 est introuvable.');
  const STORE_NAME = 'slots';
  const DB_NAME = 'tour_des_waifus_sauvegardes_v1';
  const LOCAL_PREFIX = 'tour_des_waifus_v1_slot_';
  const TOMBSTONE_KEY = 'bellymon_v11_deleted_slot_ids';
  const ARCHIVE_FORMAT = 'bellymon-v11-archive';
  const RANK_E_MULTIPLIER = 0.68;
  const RANKS = Object.freeze(['E','D','C','B','A','S']);
  const RANK_MULTIPLIERS = Object.freeze({E:0.68,D:0.82,C:1,B:1.35,A:1.8,S:2.45});
  const MORPH_BONUSES = Object.freeze({
    musclee:{force:6,rapidite:2,constitution:4},
    obese:{force:4,rapidite:2,constitution:6},
    chetive:{force:4,rapidite:6,constitution:2}
  });
  const EVENT_ANNOUNCEMENT_MS = 1800; // Disparition automatique, sans aucune interaction.
  const TURN_SECONDS = 15;
  const ENEMY_DECISION_MIN_MS = 1100; // L'IA réfléchit PENDANT le même tour que le joueur.
  const ENEMY_DECISION_SPAN_MS = 2000; // 1,1–3,1 s en manuel, toujours sous les 15 s.
  const ENEMY_DECISION_AUTO_MIN_MS = 120;
  const ENEMY_DECISION_AUTO_SPAN_MS = 260;
  const AUTO_INTERVAL_MS = 850; // Un court délai laisse le temps de couper AUTO.
  const AUTO_TOWER_INTERVAL_MS = 1450; // Transition volontairement lisible entre deux salles.
  const AUTO_REWARD_PAUSE_MS = 1800; // Laisse les récompenses visibles avant continuation.
  const MAX_COMBAT_WAIFUS = 3; // 1 titulaire + 2 remplaçantes, même avec une grande collection.
  const HERO_CLASSES = Object.freeze([
    { id:'epeiste', name:'Épéiste', role:'DPS', icon:'⚔️', stats:{force:30,rapidite:10,constitution:20}, hp:120 },
    { id:'bagarreuse', name:'Bagarreuse', role:'Tank', icon:'🥊', stats:{force:20,rapidite:10,constitution:30}, hp:160 },
    { id:'archere_arcanique', name:'Archère arcanique', role:'DPS', icon:'🏹', stats:{force:40,rapidite:10,constitution:10}, hp:100 },
    { id:'occultiste', name:'Occultiste', role:'Soutien', icon:'🔮', stats:{force:10,rapidite:30,constitution:20}, hp:100 },
    { id:'pretresse', name:'Prêtresse', role:'Healer', icon:'🌸', stats:{force:20,rapidite:20,constitution:20}, hp:130 },
    { id:'griffeuse', name:'Griffeuse', role:'DPS', icon:'🐱', stats:{force:20,rapidite:30,constitution:10}, hp:110 },
    { id:'vampire', name:'Vampire', role:'DPS / Survie', icon:'🧛', stats:{force:30,rapidite:10,constitution:20}, hp:130, starter:false },
    { id:'spectre', name:'Spectre', role:'DPS / Esquive', icon:'👻', stats:{force:10,rapidite:40,constitution:10}, hp:110, starter:false },
    { id:'nemesis', name:'Némésis', role:'Tank', icon:'🪞', stats:{force:20,rapidite:10,constitution:30}, hp:160, starter:false },
    { id:'maudite', name:'Maudite', role:'Tank / Usure', icon:'🩸', stats:{force:20,rapidite:10,constitution:30}, hp:160, starter:false },
    { id:'envouteuse', name:'Envoûteuse', role:'Polyvalente', icon:'🔮', stats:{force:10,rapidite:30,constitution:20}, hp:130, starter:false },
    { id:'exorciste', name:'Exorciste', role:'Soutien', icon:'✨', stats:{force:10,rapidite:30,constitution:20}, hp:130, starter:false }
  ]);
  const classMap = new Map(HERO_CLASSES.map(item=>[item.id,item]));
  // V15.9 : seules les trois classes historiquement 20/20/20 sont rééquilibrées.
  // Les valeurs sauvegardées sont recalculées uniquement si elles correspondent
  // exactement à leur ancienne progression rang + morphologie.
  const PRE_V15_9_BASE_STATS = Object.freeze({
    vampire:{force:20,rapidite:20,constitution:20},
    envouteuse:{force:20,rapidite:20,constitution:20},
    exorciste:{force:20,rapidite:20,constitution:20}
  });
  function migrateV15_9Stats(slot){
    const state=slot?.data?.tower?.event?.state;
    // Ne pas rebâtir les statistiques d'une combattante au milieu d'un duel.
    if(state==='fighting' || state==='awaiting_switch')return false;
    let changed=false;
    for(const hero of slot?.data?.waifus||[]){
      const oldBase=PRE_V15_9_BASE_STATS[hero.classId];
      if(!oldBase || !RANKS.includes(hero.rank))continue;
      const cls=classMap.get(hero.classId);
      const multiplier=RANK_MULTIPLIERS[hero.rank];
      const steps=RANKS.indexOf(hero.rank);
      const morphBonus=MORPH_BONUSES[hero.morph]||{force:0,rapidite:0,constitution:0};
      const keys=['force','rapidite','constitution'];
      const oldValue=key=>round(oldBase[key]*multiplier)+steps*morphBonus[key];
      if(!keys.every(key=>hero.stats?.[key]===oldValue(key)))continue;
      for(const key of keys)hero.stats[key]=round(cls.stats[key]*multiplier)+steps*morphBonus[key];
      changed=true;
    }
    return changed;
  }

  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const portrait = id => `assets/characters/${id}/commun/E.png`;
  const heroPortrait = hero => {
    if (!hero || !classMap.has(hero.classId)) return '';
    if (hero.rank === 'E' || !hero.morph) return portrait(hero.classId);
    const legacyChetive=hero.morph==='chetive' && classMap.get(hero.classId)?.starter!==false;
    const rank=legacyChetive&&hero.rank==='C'?'D':legacyChetive&&hero.rank==='A'?'B':hero.rank;
    return `assets/characters/${hero.classId}/${hero.morph}/${rank}.png`;
  };
  const morphName = morph => ({musclee:'Musclée',obese:'Obèse',chetive:'Chétive'})[morph] || 'Sans spécialisation';
  // Le nom personnalisé est un affichage uniquement : l'ID reste l'identité de sauvegarde.
  // Les doublons et les noms identiques sont parfaitement autorisés.
  const heroName = hero => hero?.nickname || classMap.get(hero?.classId)?.name || 'Waifu';
  const rankedHeroes = heroes => [...heroes].sort((a,b)=>RANKS.indexOf(b.rank)-RANKS.indexOf(a.rank));
  let fallbackIdSequence=0;
  // Fallback robuste même si Math.random est figé ou deux ID naissent la même ms.
  const makeId = () => (typeof crypto !== 'undefined' && typeof crypto.randomUUID==='function')
    ? crypto.randomUUID() : `id-${Date.now().toString(36)}-${(++fallbackIdSequence).toString(36)}-${Math.random().toString(36).slice(2,14)}`;
  const nowISO = () => new Date().toISOString();
  const safeText = s => String(s ?? '').replace(/\s+/g,' ').trim();
  const round = v => Math.round(v);
  const STATE = { storage: null, slots: new Map(), currentId: null, screen:'menu', guideReturnScreen:'menu', chosenClass:'epeiste', activeTab:'tour', selectedHeroId:null, returnFocus:null, confirmAction:null, toastTimer:null,
    actionBusy:false, shopBusy:false, enemyThinking:false, announcementTimer:null, announcementCallback:null, turnClock:null, liveTickBusy:false, liveTicker:null, healBusy:false, healTicker:null, selectedFoodType:'small', pendingFeed:null, feedBusy:false, autoNextAt:0, autoTowerNextAt:0, autoTowerBusy:false, autoRewardSeenAt:0, autoStallNotified:false, lastTurnIndicatorKey:null, lastCollectionSignature:null, lastBonusesSignature:null };

  function showToast(message){
    const el=$('toast');el.textContent=message;el.hidden=false;
    clearTimeout(STATE.toastTimer);STATE.toastTimer=setTimeout(()=>el.hidden=true,3400);
  }
  function showWarning(text){const el=$('storageWarning');el.textContent=text;el.hidden=false;}
  function clearWarning(){$('storageWarning').hidden=true;}
  function safeDate(iso){
    try {return new Date(iso).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'});} catch(_){return 'Date inconnue';}
  }
  function n(value){return Number.isSafeInteger(value)&&value>=0;}

  // Contrôles ajoutés sans briser l'import des sauvegardes V1/V1.1.
  function validTower(tower){
    if(!tower || !n(tower.floor) || tower.floor<1 || !n(tower.record) || tower.record<1) return false;
    if(tower.room!==undefined && !['rest','event'].includes(tower.room)) return false;
    // V1–V8 : activeTraps peut être absent ou vide.
    if(tower.activeTraps!==undefined && (!Array.isArray(tower.activeTraps) ||
      tower.activeTraps.some(entry=>!TRAPS.isEntry(entry))))return false;
    if(tower.event != null){
      const event=tower.event;
      if(typeof event!=='object'||Array.isArray(event)||!['combat','chest','trap'].includes(event.type)||
        !(event.type==='combat'?['pending','fighting','awaiting_switch','won','captured'].includes(event.state):['pending','opened'].includes(event.state))) return false;
      // V5 : butin éventuellement absent dans une sauvegarde V1–V4.
      if(event.reward!==undefined && !REWARDS.isReward(event.reward))return false;
      if(event.rewardAcknowledged!==undefined && typeof event.rewardAcknowledged!=='boolean')return false;
      if(event.reward!==undefined && !(event.type==='combat'?event.state==='won':event.state==='opened'))return false;
      if(event.trapType!==undefined && (event.type!=='trap' || event.state!=='opened' || !Object.hasOwn(TRAPS.TYPES,event.trapType) ||
        typeof event.trapAcknowledged!=='boolean'))return false;
      if(event.state==='captured'){
        if(event.type!=='combat'||typeof event.capturedWaifuId!=='string'||!event.capturedWaifuId||
          typeof event.captureAcknowledged!=='boolean'||event.reward!==undefined)return false;
      }
      if(event.type==='combat'){
        if(event.captureAttempts!==undefined && (!n(event.captureAttempts)||event.captureAttempts>3))return false;
        const enemy=event.enemy;
        if(enemy?.towerStatBonus!==undefined && (!n(enemy.towerStatBonus)||enemy.towerStatBonus>1000000))return false;
        if(!enemy || !classMap.has(enemy.classId)||!RANKS.includes(enemy.rank)||
          !(enemy.morph===null||['musclee','obese','chetive'].includes(enemy.morph))||
          !n(enemy.maxHp)||!n(enemy.hp)||enemy.hp>enemy.maxHp||!n(enemy.energy)||enemy.energy>100) return false;
      }
      if(event.type==='combat' && event.state!=='pending'){
        const c=tower.combat;
        if(!c || !n(c.turn) || typeof c.lastMessage!=='string' || c.lastMessage.length>1800)return false;
        if(['fighting','awaiting_switch'].includes(event.state) && (event.enemy.hp===0 || !event.enemy.maxHp))return false;
        if(c.knockedOutIds!==undefined && (!Array.isArray(c.knockedOutIds) || c.knockedOutIds.some(id=>typeof id!=='string')))return false;
        // Les anciennes parties n'ont pas usedHeroIds ; on les reconstruit à la volée.
        if(c.usedHeroIds!==undefined && (!Array.isArray(c.usedHeroIds) ||
          c.usedHeroIds.length>MAX_COMBAT_WAIFUS || new Set(c.usedHeroIds).size!==c.usedHeroIds.length ||
          c.usedHeroIds.some(id=>typeof id!=='string' || !id)))return false;
        if(event.state==='awaiting_switch' && (!Array.isArray(c.knockedOutIds)||!c.knockedOutIds.length))return false;
        if(event.state==='won' && event.enemy.hp!==0)return false;
      }
      if(tower.room==='rest') return false;
    }else if(tower.room==='event') return false;
    return true;
  }
  // Uniquement les rangs des étages comptent : pas de croissance cachée à l'intérieur d'un palier.
  function enemyRankForFloor(floor){
    return floor<=20?'E':floor<=40?'D':floor<=60?'C':floor<=80?'B':floor<=100?'A':'S';
  }
  // V15.8 : bonus de difficulté strictement réservés aux PNJ de rang S.
  // Étage 120–139 : +10 par statistique, puis +10 tous les 20 étages.
  function enemyTowerStatBonus(floor,rank){
    return rank==='S' && floor>=120 ? (Math.floor((floor-120)/20)+1)*10 : 0;
  }
  function createEnemy(floor){
    const rank=enemyRankForFloor(floor);
    const pool=rank==='E'?HERO_CLASSES.filter(item=>item.starter!==false):HERO_CLASSES;
    const cls=pool[Math.floor(Math.random()*pool.length)];
    const morph=rank==='E'?null:['musclee','obese','chetive'][Math.floor(Math.random()*3)];
    const coef=RANK_MULTIPLIERS[rank];
    const increments=RANKS.indexOf(rank);
    const morphBonus=morph?MORPH_BONUSES[morph]:{force:0,rapidite:0,constitution:0};
    const stats={};
    const towerStatBonus=enemyTowerStatBonus(floor,rank);
    for(const key of ['force','rapidite','constitution'])stats[key]=round(cls.stats[key]*coef)+increments*morphBonus[key]+towerStatBonus;
    const maxHp=round(cls.hp*coef);
    return {id:makeId(),classId:cls.id,rank,morph,stats,maxHp,hp:maxHp,energy:100,towerStatBonus};
  }
  function chooseEvent(floor){
    const roll=Math.random();
    if(roll<.6)return {type:'combat',state:'pending',enemy:createEnemy(floor)};
    if(roll<.9)return {type:'chest',state:'pending'};
    return {type:'trap',state:'pending'};
  }
  function appendTowerHistory(tower,message){
    const entries=Array.isArray(tower.history)?tower.history.filter(t=>typeof t==='string').slice(0,3):[];
    tower.history=[message,...entries].slice(0,4);
  }

  function validSlot(slot){
    if (!slot || typeof slot!=='object' || Array.isArray(slot) || slot.format!==FORMAT || slot.version!==1 ||
      (slot.saveRevision!==undefined && !n(slot.saveRevision)) ||
      typeof slot.id!=='string' || !slot.id || slot.id.length>90 ||
      typeof slot.label!=='string' || !safeText(slot.label) || slot.label.length>36 ||
      typeof slot.createdAt!=='string' || typeof slot.updatedAt!=='string') return false;
    const d=slot.data;
    if(!d || typeof d!=='object' || !d.profile || !Array.isArray(d.waifus) || d.waifus.length===0 ||
      typeof d.profile.pseudo!=='string' || !safeText(d.profile.pseudo) || d.profile.pseudo.length>22 ||
      !validTower(d.tower) ||
      typeof d.activeWaifuId!=='string' || !d.food || !n(d.food.small) || !n(d.food.large) ||
      (d.potions!==undefined && !SHOP.validInventory(d.potions)) ||
      !d.bonuses || !n(d.bonuses.force) || !n(d.bonuses.rapidite) || !n(d.bonuses.constitution) ||
      (d.autoCombat!==undefined && typeof d.autoCombat!=='boolean') ||
      (d.hospital!==undefined && (!d.hospital || !Array.isArray(d.hospital.slots) || d.hospital.slots.length>3 ||
        d.hospital.slots.some(s=>typeof s.heroId!=='string'||!n(s.readyAt)) ||
        new Set(d.hospital.slots.map(s=>s.heroId)).size!==d.hospital.slots.length))) return false;
    const ids=new Set();
    for(const hero of d.waifus){
      if(!hero || typeof hero.id!=='string' || !hero.id || ids.has(hero.id) || !classMap.has(hero.classId) ||
        !['E','D','C','B','A','S'].includes(hero.rank) ||
        !(hero.morph===null || ['musclee','obese','chetive'].includes(hero.morph)) ||
        !n(hero.evolutionPoints) || !n(hero.maxHp) || !n(hero.hp) || hero.hp>hero.maxHp ||
        !n(hero.energy) || hero.energy>100 || (hero.injuredUntil!==undefined && !n(hero.injuredUntil)) ||
        (hero.nickname!==undefined && (typeof hero.nickname!=='string' || !safeText(hero.nickname) || safeText(hero.nickname).length>24))) return false;
      ids.add(hero.id);
    }
    if(d.hospital?.slots.some(s=>!ids.has(s.heroId)))return false;
    if(d.tower.combat?.usedHeroIds?.some(id=>!ids.has(id)))return false;
    if(d.tower.event?.state==='captured' && !ids.has(d.tower.event.capturedWaifuId))return false;
    return ids.has(d.activeWaifuId);
  }
  function basicCharacter(classId){
    const chosen=classMap.get(classId);
    if(!chosen || chosen.starter===false)throw Error('Cette classe se capture dans la tour, elle ne peut pas être choisie au départ.');
    const maxHp=round(chosen.hp*RANK_E_MULTIPLIER);
    return {id:makeId(),classId:chosen.id,rank:'E',morph:null,evolutionPoints:0,
      stats:{force:round(chosen.stats.force*RANK_E_MULTIPLIER),rapidite:round(chosen.stats.rapidite*RANK_E_MULTIPLIER),constitution:round(chosen.stats.constitution*RANK_E_MULTIPLIER)},
      maxHp,hp:maxHp,energy:100,injuredUntil:0};
  }
  function newSlot(label,pseudo,classId){
    const hero=basicCharacter(classId), date=nowISO();
    return {format:FORMAT,version:1,id:makeId(),label,createdAt:date,updatedAt:date,
      data:{profile:{pseudo},waifus:[hero],activeWaifuId:hero.id,autoCombat:false,food:{small:0,large:0},potions:SHOP.empty(),
        bonuses:{force:0,rapidite:0,constitution:0},hospital:{slots:[]},
        tower:{floor:1,room:'rest',record:1,event:null,combat:null,activeTraps:[],history:['Première salle de repos.']},
        createdAt:date,lastSavedAt:date}};
  }

  function koIds(tower){
    return Array.isArray(tower?.combat?.knockedOutIds) ? tower.combat.knockedOutIds : [];
  }
  function heroAvailable(hero,tower=null){
    return !!hero && hero.hp>0 && !(hero.injuredUntil>0) &&
      !(['fighting','awaiting_switch'].includes(tower?.event?.state) && koIds(tower).includes(hero.id));
  }
  // Utilise d'abord le suivi V12.0.6. Pour une ancienne sauvegarde en combat,
  // déduit les héroïnes engagées des KO et de la titulaire active : aucune remise
  // à zéro gratuite du compteur lors d'une mise à jour.
  function combatParticipants(data){
    const combat=data?.tower?.combat;
    if(!combat)return [];
    const ids=Array.isArray(combat.usedHeroIds) && combat.usedHeroIds.length
      ?[...combat.usedHeroIds]
      :Array.isArray(combat.knockedOutIds)?[...combat.knockedOutIds]:[];
    const active=data.activeWaifuId;
    if(active && !ids.includes(active))ids.push(active);
    return [...new Set(ids)];
  }
  function availableReserves(data){
    const engaged=['fighting','awaiting_switch'].includes(data.tower.event?.state);
    const used=engaged?combatParticipants(data):[];
    if(engaged && used.length>=MAX_COMBAT_WAIFUS)return [];
    return data.waifus.filter(hero=>hero.id!==data.activeWaifuId &&
      (!engaged || !used.includes(hero.id)) && heroAvailable(hero,data.tower));
  }
  function canEngageRelay(data,heroId){
    return availableReserves(data).some(hero=>hero.id===heroId);
  }
  function makeHpBar(hero,extraClass=''){
    const ratio=hero.maxHp>0?hero.hp/hero.maxHp:0;
    const holder=mkEl('div',`waifu-health ${extraClass}`);
    const label=mkEl('span','waifu-health-label',`❤️ ${hero.hp} / ${hero.maxHp} PV`);
    const track=mkEl('div','waifu-health-track');
    const fill=mkEl('span',`waifu-health-fill ${ratio>0.65?'is-green':ratio>0.35?'is-yellow':'is-red'}`);
    fill.style.width=`${Math.max(0,Math.min(100,ratio*100))}%`;
    track.append(fill);holder.append(label,track);return holder;
  }
  function injurySeconds(hero){
    return Math.max(0,Math.ceil((Number(hero?.injuredUntil||0)-Date.now())/1000));
  }
  function currentHeroStatus(hero,tower=null){
    if(['fighting','awaiting_switch'].includes(tower?.event?.state) && koIds(tower).includes(hero.id))return '💀 KO — combat en cours';
    if(hero.injuredUntil>0)return `🏥 Hospitalisée · ${injurySeconds(hero)} s`;
    if(hero.hp<=0)return '💀 KO';
    return '';
  }
  // Les soins n'existent que dans les trois lits de l'hôpital. Le délai continue
  // hors ligne mais aucune blessure ne guérit spontanément sans hospitalisation.
  async function refreshRecoveredHeroes(){
    if(STATE.healBusy || STATE.actionBusy || !STATE.storage)return;
    STATE.healBusy=true;
    let changed=false;
    try{
      for(const saved of [...STATE.slots.values()]){
        if(!saved.data.hospital?.slots?.some(b=>b.readyAt<=Date.now()))continue;
        const copy=clone(saved),count=HOSPITAL.complete(copy.data);
        if(!count)continue;
        copy.updatedAt=nowISO();copy.data.lastSavedAt=copy.updatedAt;
        await saveSlot(copy);changed=true;
      }
      if(changed){if(STATE.screen==='play')renderGame();else renderSaveList();}
    }catch(err){console.error('Soins hospitaliers :',err);}
    finally{STATE.healBusy=false;}
    for(const node of document.querySelectorAll('[data-injury-until]')){
      const left=Math.max(0,Math.ceil((Number(node.dataset.injuryUntil)-Date.now())/1000));
      node.textContent=`🏥 ${left} s`;
    }
    if(STATE.screen==='play' && STATE.activeTab==='hopital')paintHospitalTimers();
  }

  // Les anciens identifiants IndexedDB/localStorage sont volontairement conservés.
  // Cela permet de migrer V1–V10 sans effacer les parties existantes.
  const revision=slot=>n(slot?.saveRevision)?slot.saveRevision:0;
  const SAVE_CONFLICT='Cette partie a été modifiée dans une autre fenêtre. Actualise le jeu avant de continuer pour ne rien écraser.';
  function storageStatus(message){
    const box=$('storageStatus');if(box)box.textContent=message;
  }
  function idbOpen(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB || typeof indexedDB.open!=='function'){reject(Error('IndexedDB indisponible'));return;}
      let req;try{req=indexedDB.open(DB_NAME,1);}catch(e){reject(e);return;}
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE_NAME))req.result.createObjectStore(STORE_NAME,{keyPath:'id'});};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||Error('Impossible d’ouvrir IndexedDB'));
      req.onblocked=()=>reject(Error('IndexedDB bloquée'));
    });
  }
  function idbAll(db){
    return new Promise((resolve,reject)=>{
      let req;try{req=db.transaction(STORE_NAME,'readonly').objectStore(STORE_NAME).getAll();}catch(e){reject(e);return;}
      req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error||Error('Lecture impossible'));
    });
  }
  function idbChange(db,method,value){
    return new Promise((resolve,reject)=>{
      let tx;try{tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME)[method](value);}catch(e){reject(e);return;}
      tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error||Error('Transaction annulée'));
      tx.onerror=()=>reject(tx.error||Error('Écriture impossible'));
    });
  }
  // Contrôle de révision DANS la même transaction. Deux onglets ne peuvent pas
  // modifier silencieusement la même sauvegarde à partir de copies anciennes.
  function idbGuardedPut(db,slot,expectedRevision,expectedUpdatedAt){
    return new Promise((resolve,reject)=>{
      let tx,conflict=false;
      try{
        tx=db.transaction(STORE_NAME,'readwrite');
        const store=tx.objectStore(STORE_NAME);
        const req=store.get(slot.id);
        req.onsuccess=()=>{
          const actual=req.result;
          if((actual?revision(actual):0)!==expectedRevision || (!actual && expectedRevision!==0) ||
            (actual?.updatedAt||null)!==expectedUpdatedAt){
            conflict=true;tx.abort();return;
          }
          store.put(slot);
        };
        req.onerror=()=>tx.abort();
      }catch(error){reject(error);return;}
      tx.oncomplete=()=>resolve();
      tx.onabort=()=>reject(conflict?Error(SAVE_CONFLICT):tx.error||Error('Écriture impossible'));
      tx.onerror=()=>{};
    });
  }
  function idbGuardedDelete(db,id,expectedRevision,expectedUpdatedAt){
    return new Promise((resolve,reject)=>{
      let tx,conflict=false;
      try{
        tx=db.transaction(STORE_NAME,'readwrite');
        const store=tx.objectStore(STORE_NAME);
        const request=store.get(id);
        request.onsuccess=()=>{
          if(!request.result || revision(request.result)!==expectedRevision ||
            request.result.updatedAt!==expectedUpdatedAt){
            conflict=true;tx.abort();return;
          }
          store.delete(id);
        };
        request.onerror=()=>tx.abort();
      }catch(error){reject(error);return;}
      tx.oncomplete=()=>resolve();
      tx.onabort=()=>reject(conflict?Error(SAVE_CONFLICT):tx.error||Error('Suppression impossible'));
      tx.onerror=()=>{};
    });
  }
  function localCheck(){
    const key=LOCAL_PREFIX+'_test';localStorage.setItem(key,'ok');localStorage.removeItem(key);
  }
  function readTombstones(){
    try{const raw=JSON.parse(localStorage.getItem(TOMBSTONE_KEY)||'[]');
      return new Set(Array.isArray(raw)?raw.filter(x=>typeof x==='string'&&x.length<=90):[]);
    }catch(_){return new Set();}
  }
  function markDeleted(id){
    const dead=readTombstones();dead.add(id);
    // Identifiants V1–V10: UUID uniques. Une limite évite un stockage sans fin.
    const ids=[...dead].slice(-3000);
    localStorage.setItem(TOMBSTONE_KEY,JSON.stringify(ids));
  }
  function localAll(){
    const slots=[];for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);if(!key||!key.startsWith(LOCAL_PREFIX))continue;
      try{const slot=JSON.parse(localStorage.getItem(key));if(validSlot(slot)&&key===LOCAL_PREFIX+slot.id)slots.push(slot);}catch(e){console.warn('Sauvegarde illisible, non effacée',key,e);}
    }
    return slots;
  }
  function preferSlot(a,b){
    if(!a)return b;if(!b)return a;
    if(revision(a)!==revision(b))return revision(a)>revision(b)?a:b;
    return (Date.parse(a.updatedAt)||0)>=(Date.parse(b.updatedAt)||0)?a:b;
  }
  async function initializeStorage(){
    clearWarning();
    let db=null,localOK=false,remote=[],onDisk=[],idbError=null;
    try{db=await idbOpen();remote=await idbAll(db);}catch(error){idbError=error;try{db?.close();}catch(_){}db=null;
      console.warn('IndexedDB indisponible :',error);}
    try{localCheck();localOK=true;onDisk=localAll();}catch(error){console.warn('Copie locale indisponible :',error);}
    if(!db && !localOK){STATE.storage=null;
      showWarning('Aucun stockage disponible. Le jeu ne peut pas sauvegarder : vérifie les autorisations du navigateur.');
      storageStatus('⚠ Sauvegardes indisponibles');return;
    }
    const removed=localOK?readTombstones():new Set();
    const chosen=new Map();
    for(const slot of remote){if(validSlot(slot)&&!removed.has(slot.id))chosen.set(slot.id,slot);}
    for(const slot of onDisk){if(!removed.has(slot.id))chosen.set(slot.id,preferSlot(chosen.get(slot.id),slot));}
    for(const slot of chosen.values()){HOSPITAL.ensure(slot.data);HOSPITAL.complete(slot.data);}
    STATE.slots=chosen;
    STATE.storage=db?{mode:'indexeddb',db,localBackup:localOK}:{mode:'localStorage',localBackup:localOK};
    // Les parties créées en mode secours local sont rapatriées sans écraser
    // les versions plus récentes de la base. Un échec de migration ne les efface pas.
    if(db){
      try{
        const existing=new Map(remote.filter(validSlot).map(slot=>[slot.id,slot]));
        for(const slot of chosen.values()){
          const fromDb=existing.get(slot.id);
          if(!fromDb || fromDb!==preferSlot(fromDb,slot))await idbChange(db,'put',clone(slot));
        }
      }catch(error){console.warn('Migration IndexedDB incomplète :',error);
        if(localOK){STATE.storage={mode:'localStorage',localBackup:true};
          showWarning('Stockage principal indisponible : les parties sont conservées dans le stockage local. Exporte-les en JSON par précaution.');}
      }
    }
    if(localOK){
      // Copie de secours : best effort. Ne supprime JAMAIS la source en cas d'échec.
      try{for(const slot of chosen.values())localStorage.setItem(LOCAL_PREFIX+slot.id,JSON.stringify(slot));}
      catch(error){console.warn('Copie de secours locale incomplète :',error);}
    }
    if(STATE.storage.mode==='indexeddb'){
      storageStatus(localOK?'💾 IndexedDB + copie de secours locale':'💾 IndexedDB (export JSON conseillé)');
    }else{
      storageStatus('💾 Stockage local · pense à exporter tes parties');
      if(idbError)console.info('Continuité V1–V10 : sauvegardes locales conservées.');
    }
    // Convertir les waifus déjà capturées, sur toutes les parties existantes.
    // Une conversion au milieu d'un duel attend sa résolution puis la prochaine sauvegarde.
    for(const saved of [...STATE.slots.values()]){
      const updated=clone(saved);
      if(!migrateV15_9Stats(updated))continue;
      updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
      try{await saveSlot(updated);}
      catch(error){console.warn('Conversion des statistiques V15.9 différée :',error);}
    }
  }
  async function saveSlot(slot){
    if(!STATE.storage)throw Error('Stockage indisponible');
    if(!validSlot(slot))throw Error('Sauvegarde invalide');
    const original=STATE.slots.get(slot.id);
    const expected=revision(original),expectedUpdatedAt=original?.updatedAt||null;
    const copy=clone(slot);
    migrateV15_9Stats(copy);
    copy.saveRevision=expected+1;
    if(STATE.storage.mode==='indexeddb'){
      try{await idbGuardedPut(STATE.storage.db,copy,expected,expectedUpdatedAt);}
      catch(error){
        if(error.message===SAVE_CONFLICT)throw error;
        // Si IndexedDB échoue à l'écriture, la sauvegarde reste possible
        // via localStorage, avec notification explicite au joueur.
        try{localCheck();
          const raw=localStorage.getItem(LOCAL_PREFIX+copy.id);
          if(raw && (revision(JSON.parse(raw))!==expected || JSON.parse(raw).updatedAt!==expectedUpdatedAt))throw Error(SAVE_CONFLICT);
          localStorage.setItem(LOCAL_PREFIX+copy.id,JSON.stringify(copy));
          STATE.storage={mode:'localStorage',localBackup:true};
          showWarning('⚠ IndexedDB a refusé une écriture. Sauvegarde conservée localement : export JSON conseillé.');
          storageStatus('💾 Stockage local de secours');
        }catch(localError){throw localError.message===SAVE_CONFLICT?localError:error;}
      }
      if(STATE.storage.mode==='indexeddb' && STATE.storage.localBackup){
        try{localStorage.setItem(LOCAL_PREFIX+copy.id,JSON.stringify(copy));}
        catch(error){console.warn('Copie locale de secours non mise à jour :',error);
          storageStatus('💾 IndexedDB actif · copie de secours indisponible');}
      }
    }else{
      const key=LOCAL_PREFIX+copy.id;
      const raw=localStorage.getItem(key);
      if(raw && (revision(JSON.parse(raw))!==expected || JSON.parse(raw).updatedAt!==expectedUpdatedAt))throw Error(SAVE_CONFLICT);
      if(!raw && expected!==0)throw Error(SAVE_CONFLICT);
      localStorage.setItem(key,JSON.stringify(copy));
    }
    STATE.slots.set(copy.id,copy);
  }
  async function removeSlot(id){
    if(!STATE.storage)throw Error('Stockage indisponible');
    // On vérifie d'abord si une autre fenêtre a enregistré une version plus récente.
    const local=(()=>{try{return JSON.parse(localStorage.getItem(LOCAL_PREFIX+id));}catch(_){return null;}})();
    if(STATE.storage.mode==='localStorage' && local &&
      (revision(local)!==revision(STATE.slots.get(id)) || local.updatedAt!==STATE.slots.get(id)?.updatedAt))throw Error(SAVE_CONFLICT);
    if(STATE.storage.mode==='indexeddb'){
      // La suppression IDB est effectuée avant toute suppression de secours.
      await idbGuardedDelete(STATE.storage.db,id,revision(STATE.slots.get(id)),STATE.slots.get(id)?.updatedAt);
    }
    try{markDeleted(id);localStorage.removeItem(LOCAL_PREFIX+id);}catch(error){
      if(STATE.storage.mode==='localStorage'){
        // Si le retrait local échoue, ne prétendons pas que la suppression a réussi.
        throw error;
      }
      console.warn('Suppression du miroir local impossible :',error);
    }
    STATE.slots.delete(id);
  }
  function listSlots(){return [...STATE.slots.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}
  function nextPartyName(){
    const used=new Set(listSlots().map(s=>s.label.toLocaleLowerCase('fr')));
    let i=1;while(used.has(`partie ${i}`))i++;
    return `Partie ${i}`;
  }
  function mkEl(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
  function mkButton(text,style,onClick){const b=mkEl('button',`btn ${style}`,text);b.type='button';b.addEventListener('click',onClick);return b;}
  function renderSaveList(){
    const slots=listSlots();const holder=$('saveList');holder.replaceChildren();
    $('saveCount').textContent=`${slots.length} PARTIE${slots.length===1?'':'S'}`;
    $('exportAllBtn').disabled=!slots.length;
    if(!slots.length){holder.append(mkEl('div','save-empty','Aucune partie pour le moment.\nCrée ta première aventure !'));return;}
    for(const slot of slots){
      const hero=slot.data.waifus.find(w=>w.id===slot.data.activeWaifuId)||slot.data.waifus[0];
      const cl=classMap.get(hero.classId);const card=mkEl('article','save-card');
      const img=mkEl('img','save-thumb');img.src=heroPortrait(hero);img.alt='Portrait de '+heroName(hero);img.loading='lazy';
      const info=mkEl('div','save-info');
      info.append(mkEl('h4','',slot.label));
      info.append(mkEl('p','',`${slot.data.profile.pseudo} · ${heroName(hero)}${hero.nickname?' ('+cl.name+')':''} · Rang ${hero.rank} · Étage ${slot.data.tower.floor}`));
      info.append(mkEl('small','',`Modifiée le ${safeDate(slot.updatedAt)}`));
      const buttons=mkEl('div','save-controls');
      buttons.append(mkButton('▶ Continuer','primary small',()=>loadGame(slot.id)));
      buttons.append(mkButton('↧ Exporter','subdued small',()=>exportSlot(slot.id)));
      buttons.append(mkButton('Supprimer','danger small',()=>confirmDelete(slot.id)));
      card.append(img,info,buttons);holder.append(card);
    }
  }
  // Les morceaux suivent automatiquement l'écran et l'état du combat.
  // La lecture est tentée dès le chargement ; certains navigateurs attendent un geste.
  function syncAudioScene(){
    const slot=STATE.slots.get(STATE.currentId);
    const ev=(STATE.screen==='play' || (STATE.screen==='guide'&&STATE.guideReturnScreen==='play'))?slot?.data.tower.event:null;
    AUDIO.setScene(ev?.type==='combat' && ['fighting','awaiting_switch'].includes(ev.state)
      ?'combat':'exploration');
  }
  function paintAudioSettings(){
    const config=AUDIO.getSettings();
    $('musicEnabled').checked=config.music;
    $('sfxEnabled').checked=config.sfx;
    $('musicVolume').value=config.musicVolume;
    $('sfxVolume').value=config.sfxVolume;
    $('musicVolume').disabled=!config.music;
    $('sfxVolume').disabled=!config.sfx;
    $('musicVolumeValue').textContent=`${config.musicVolume} %`;
    $('sfxVolumeValue').textContent=`${config.sfxVolume} %`;
    $('audioSettingsBtn').textContent=(config.music||config.sfx)?'🎵 Son':'🔇 Son';
  }
  function openAudioSettings(){paintAudioSettings();$('audioOverlay').hidden=false;$('audioClose').focus();}
  function closeAudioSettings(){$('audioOverlay').hidden=true;$('audioSettingsBtn').focus();}
  function showScreen(name){
    $('fighterOverlay').hidden=true;
    STATE.screen=name;
    if(name!=='play')$('relayOverlay').hidden=true;
    for(const key of ['menu','create','play','guide'])$(key+'Screen').hidden=key!==name;
    $('gameHeaderActions').hidden=name!=='play';
    if(name==='menu')renderSaveList();
    syncAudioScene();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function openGuide(){
    if(STATE.screen==='guide')return;
    STATE.guideReturnScreen=STATE.screen;
    // Un combat ne doit pas progresser pendant la lecture : pause immédiate.
    if(STATE.turnClock)pauseDecisions(STATE.turnClock,Date.now());
    window.BellymonGuide.show('classes');
    showScreen('guide');
    $('guideBackBtn').focus();
  }
  function closeGuide(){
    if(STATE.screen!=='guide')return;
    const previous=STATE.guideReturnScreen;
    showScreen(['menu','create','play'].includes(previous)?previous:'menu');
    $('openGuideBtn').focus();
  }
  function renderClassPicker(){
    const holder=$('classPicker');holder.replaceChildren();
    for(const cls of HERO_CLASSES.filter(c=>c.starter!==false)){
      const selected=cls.id===STATE.chosenClass;
      const item=mkEl('button',`class-option${selected?' selected':''}`);item.type='button';
      item.setAttribute('role','radio');item.setAttribute('aria-checked',String(selected));
      item.dataset.classId=cls.id;
      const img=mkEl('img');img.src=portrait(cls.id);img.alt=cls.name+' — rang E';img.loading='lazy';
      item.append(img,mkEl('strong','',`${cls.icon} ${cls.name}`),mkEl('small','',cls.role),mkEl('span','chosen-mark','✓'));
      item.addEventListener('click',()=>{STATE.chosenClass=cls.id;renderClassPicker();});
      holder.append(item);
    }
  }
  function openCreate(){
    $('partyName').value=nextPartyName();$('playerName').value='';$('createError').hidden=true;
    STATE.chosenClass='epeiste';renderClassPicker();showScreen('create');$('partyName').focus();
  }
  function createError(msg){$('createError').textContent=msg;$('createError').hidden=false;}
  async function handleCreate(event){
    event.preventDefault();$('createError').hidden=true;
    const label=safeText($('partyName').value),pseudo=safeText($('playerName').value);
    if(!label||label.length>36){createError('Le nom de partie doit contenir entre 1 et 36 caractères.');return;}
    if(pseudo.length<2||pseudo.length>22){createError('Le pseudo doit contenir entre 2 et 22 caractères.');return;}
    if(!STATE.storage){createError('Sauvegarde impossible : le stockage du navigateur est indisponible.');return;}
    const button=$('createForm').querySelector('[type=submit]');button.disabled=true;
    try{const slot=newSlot(label,pseudo,STATE.chosenClass);await saveSlot(slot);STATE.currentId=slot.id;STATE.activeTab='tour';renderGame();showScreen('play');showToast('Partie créée et sauvegardée !');}
    catch(e){console.error(e);createError('Impossible de créer la partie. Vérifie le stockage du navigateur.');}
    finally{button.disabled=false;}
  }
  function openTab(name){
    if (!['tour','waifus','bonus','boutique','hopital'].includes(name)) return;
    if(name!=='tour')$('fighterOverlay').hidden=true;
    STATE.activeTab=name;
    for (const key of ['tour','waifus','bonus','boutique','hopital']) {
      const panel=$('pane'+key[0].toUpperCase()+key.slice(1));
      const tab=$('tab'+key[0].toUpperCase()+key.slice(1));
      panel.hidden=key!==name;
      tab.classList.toggle('active',key===name);
      tab.setAttribute('aria-selected',String(key===name));
      tab.tabIndex=key===name?0:-1;
    }
    if(name==='hopital')renderHospital(STATE.slots.get(STATE.currentId));
    if(name==='boutique')renderShop(STATE.slots.get(STATE.currentId));
  }
  function renderOwnedGrid(slot){
    const owned=$('ownedGrid');owned.replaceChildren();
    // V14.6 : la combattante active est toujours la première carte de la collection.
    // Les autres gardent le tri habituel du rang S vers E, sans changer la sauvegarde.
    const heroes=rankedHeroes(slot.data.waifus);
    const activeIndex=heroes.findIndex(hero=>hero.id===slot.data.activeWaifuId);
    if(activeIndex>0)heroes.unshift(heroes.splice(activeIndex,1)[0]);
    $('collectionCount').textContent=`${heroes.length} WAIFU${heroes.length>1?'S':''}`;
    for(const hero of heroes){
      const cls=classMap.get(hero.classId);
      const displayName=heroName(hero);
      const isActive=hero.id===slot.data.activeWaifuId;
      const card=mkEl('button',`owned-card${isActive?' is-active':''}`);
      card.type='button';card.dataset.heroId=hero.id;
      card.setAttribute('aria-label',`${displayName}, ${cls.name}, rang ${hero.rank}${isActive?', combattante active':''}. Voir sa fiche`);
      const img=mkEl('img');img.src=heroPortrait(hero);img.alt=`Illustration de ${displayName}`;img.loading='lazy';
      const hdr=mkEl('div','owned-card-header');
      hdr.append(mkEl('strong','',`${cls.icon} ${displayName}`),mkEl('span','tiny-rank',hero.rank));
      card.append(img,hdr,mkEl('small','',`${isActive?'✓ Active · ':''}${hero.nickname?cls.name+' · ':''}${morphName(hero.morph)}`));
      card.append(makeHpBar(hero,'collection-life'));
      const status=currentHeroStatus(hero,slot.data.tower);
      if(status){
        const label=mkEl('span','owned-injury-status',status);
        if(hero.injuredUntil>0){label.dataset.injuryUntil=String(hero.injuredUntil);label.textContent=`🤕 ${injurySeconds(hero)} s`;}
        card.append(label);card.classList.add('is-injured');
      }
      card.addEventListener('click',()=>openHeroDetail(hero.id));
      owned.append(card);
    }
  }
  function paintHospitalTimers(){
    for(const node of document.querySelectorAll('[data-hospital-ready]')){
      const secs=Math.max(0,Math.ceil((Number(node.dataset.hospitalReady)-Date.now())/1000));
      node.textContent=`⏳ ${secs} s restantes`;
    }
  }
  // Boutique : les six anciennes classes, les combats et les récompenses restent inchangés.
  // Les anciennes sauvegardes sans inventaire de potions sont acceptées sans migration destructive.
  function renderShop(slot){
    if(!slot)return;
    const data=slot.data,food=data.food;
    const locked=data.tower.floor!==1;
    $('shopLocked').hidden=!locked;
    $('shopWorking').hidden=locked;
    if(locked)return;
    const fighting=SHOP.inCombat(data),canBuy=!fighting && !STATE.actionBusy && !STATE.shopBusy;
    const wallet=$('shopWallet');wallet.replaceChildren(
      mkEl('span','','🥩 Steaks : '+food.small),mkEl('span','','🍖 Gigots : '+food.large)
    );
    const notice=$('shopPurchaseNotice');
    notice.classList.toggle('is-locked',fighting);
    notice.textContent=fighting?'⚔️ Achats interdits pendant un combat.':
      '🏪 Boutique ouverte : achète des potions avec des steaks OU des gigots. Les potions s’utilisent dans la fiche de chaque waifu.';
    const offers=$('shopOffers');offers.replaceChildren();
    for(const type of SHOP.TYPES){
      const item=SHOP.POTIONS[type];
      const card=mkEl('article','shop-card');
      card.append(mkEl('span','shop-icon',item.icon),mkEl('h4','',item.name),
        mkEl('strong','shop-heal',`+${item.percent} % des PV max`),
        mkEl('p','',`Restaure les PV d’une waifu consciente depuis sa fiche.`));
      const options=mkEl('div','shop-purchase-buttons');
      for(const foodType of ['small','large']){
        const price=item[foodType],foodIcon=foodType==='small'?'🥩':'🍖';
        const btn=mkEl('button','btn subdued',`Acheter · ${price} ${foodIcon}`);
        btn.type='button';btn.dataset.shopBuy=type;btn.dataset.foodType=foodType;
        btn.disabled=!canBuy || food[foodType]<price;
        btn.title=`Coût d’évolution : ${price*(foodType==='small'?5:25)} points`;
        options.append(btn);
      }
      card.append(options);offers.append(card);
    }
  }
  async function purchasePotion(type,foodType){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot||STATE.actionBusy||STATE.shopBusy)return;
    STATE.shopBusy=true;
    try{
      const updated=clone(slot),result=SHOP.buy(updated.data,type,foodType);
      updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
      await saveSlot(updated);
      AUDIO.playEffect('ui');renderGame();
      showToast(`🧪 ${result.item.name} achetée pour ${result.price} ${foodType==='small'?'steaks':'gigots'} !`);
    }catch(err){console.error('Boutique (achat) :',err);showToast('⚠ Achat impossible : '+err.message);}
    finally{STATE.shopBusy=false;const current=STATE.slots.get(STATE.currentId);if(current&&STATE.activeTab==='boutique')renderShop(current);}
  }
  async function usePotion(type,heroId){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot||STATE.actionBusy||STATE.shopBusy||STATE.feedBusy)return;
    STATE.shopBusy=true;
    try{
      const updated=clone(slot),result=SHOP.use(updated.data,type,heroId);
      updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
      await saveSlot(updated);
      AUDIO.playEffect('heal');renderGame();
      const hero=updated.data.waifus.find(w=>w.id===heroId);
      showToast(`💚 ${heroName(hero)} : +${result.healed} PV (${result.after}/${result.maxHp}) !`);
    }catch(err){console.error('Potion (soin) :',err);showToast('⚠ Potion inutilisable : '+err.message);}
    finally{STATE.shopBusy=false;refreshFeedForm();}
  }

  function renderHospital(slot){
    if(!slot)return;
    const data=slot.data;
    HOSPITAL.ensure(data);
    const locked=data.tower.floor!==1;
    $('tabHopital').classList.toggle('hospital-tab-locked',locked);
    $('hospitalLocked').hidden=!locked;
    $('hospitalWorking').hidden=locked;
    $('hospitalOccupancy').textContent=`${data.hospital.slots.length} / 3 LITS`;
    if(locked)return;
    const beds=$('hospitalBeds');beds.replaceChildren();
    for(let i=0;i<HOSPITAL.CAPACITY;i++){
      const bed=data.hospital.slots[i],hero=bed&&data.waifus.find(h=>h.id===bed.heroId);
      const card=mkEl('div',`hospital-bed${hero?' occupied':''}`);
      card.append(mkEl('strong','',`🛏️ Lit ${i+1}`));
      if(hero){
        const info=mkEl('div','hospital-bed-info');
        const photo=mkEl('img');photo.src=heroPortrait(hero);photo.alt=heroName(hero);
        const labels=mkEl('div');labels.append(mkEl('b','',heroName(hero)),makeHpBar(hero));
        const timer=mkEl('span','hospital-timer');timer.dataset.hospitalReady=String(bed.readyAt);
        labels.append(timer);info.append(photo,labels);card.append(info);
      }else card.append(mkEl('p','hospital-empty','Lit disponible'));
      beds.append(card);
    }
    const patients=$('hospitalPatients');patients.replaceChildren();
    const damaged=rankedHeroes(data.waifus.filter(hero=>hero.hp<hero.maxHp &&
      !data.hospital.slots.some(b=>b.heroId===hero.id)));
    if(!damaged.length)patients.append(mkEl('p','hospital-empty','Toutes les waifus non hospitalisées sont en pleine santé.'));
    for(const hero of damaged){
      const row=mkEl('div','hospital-patient');
      const photo=mkEl('img');photo.src=heroPortrait(hero);photo.alt=heroName(hero);
      const name=mkEl('div','hospital-patient-text');name.append(mkEl('b','',`${heroName(hero)} · ${hero.rank}`),makeHpBar(hero));
      const seconds=(HOSPITAL.healDurationMs(hero)/1000).toLocaleString('fr-FR',{maximumFractionDigits:1});
      name.append(mkEl('small','',`⏳ ${seconds} s de soin`));
      const btn=mkEl('button','btn primary hospital-admit','🏥 Soigner');btn.type='button';
      btn.dataset.hospitalAdmit=hero.id;btn.disabled=data.hospital.slots.length>=HOSPITAL.CAPACITY || STATE.actionBusy || ['fighting','awaiting_switch'].includes(data.tower.event?.state);
      row.append(photo,name,btn);patients.append(row);
    }
    paintHospitalTimers();
  }
  async function admitHospital(heroId){
    const slot=STATE.slots.get(STATE.currentId);if(!slot)return;
    if(slot.data.tower.floor!==1){showToast('🔒 Retourne à l’étage 1 pour accéder à l’hôpital.');return;}
    try{HOSPITAL.start(clone(slot.data),heroId);}catch(err){showToast('⚠ '+err.message);return;}
    const ok=await commitBattle(data=>{HOSPITAL.start(data,heroId);});
    if(ok){
      AUDIO.playEffect('heal');
      const hero=slot.data.waifus.find(h=>h.id===heroId);
      const seconds=(HOSPITAL.healDurationMs(hero)/1000).toLocaleString('fr-FR',{maximumFractionDigits:1});
      showToast(`🏥 Soins commencés : ${seconds} secondes.`);
    }
  }
  function renderBonuses(slot){
    const bonuses=$('bonusesGrid');bonuses.replaceChildren();
    for(const bonus of [
      {key:'force',icon:'💪',label:'Force'},
      {key:'rapidite',icon:'⚡',label:'Rapidité'},
      {key:'constitution',icon:'🛡️',label:'Constitution'}]){
      const level=slot.data.bonuses[bonus.key]||0;
      const extra=BONUSES.points(level);
      const card=mkEl('div','bonus-tile');
      card.title=`Bonus global ${bonus.label} : niveau ${level}, +${extra} à chaque waifu, y compris les futures captures.`;
      card.setAttribute('aria-label',card.title);
      card.append(mkEl('span','bonus-symbol',bonus.icon),mkEl('strong','bonus-name',bonus.label),
        mkEl('span','bonus-level',`Niveau ${level}`),mkEl('b','bonus-value',`+${extra}`));
      bonuses.append(card);
    }
  }
  function setEventIcon(icon,label){
    $('eventIcon').textContent=icon;
    $('eventIconLabel').textContent=label;
    $('eventIconContent').hidden=false;
    $('eventEnemyPortrait').hidden=true;
    $('eventFrame').classList.add('event-placeholder');
  }
  function setDesktopJournal(title,description){
    const heading=$('desktopJournalStatus');
    heading.textContent=title;
    heading.hidden=!title;
    $('desktopJournalHint').textContent=description;
  }
  // L'effet affiché correspond au prochain tour à jouer et non au tour passé.
  function renderCombatHUD(slot){
    const tower=slot.data.tower;
    const ev=tower.event;
    const inFight=ev?.type==='combat' && ['fighting','awaiting_switch'].includes(ev.state);
    const hud=$('combatHud');
    hud.hidden=!inFight;
    for(const id of ['playerEffectsLine','enemyEffectsLine']){
      const line=$(id);line.replaceChildren();line.hidden=true;
    }
    if(!inFight){STATE.lastTurnIndicatorKey=null;return;}
    const view=COMBAT_UI.describe(tower.combat||{},tower.floor,tower.activeTraps);
    $('turnNumber').textContent=String(view.turn);
    const count=combatParticipants(slot.data).length;
    $('teamUsedCount').textContent=`👩 ${Math.min(count,MAX_COMBAT_WAIFUS)}/${MAX_COMBAT_WAIFUS}`;
    $('teamUsedCount').title=`${count} combattante(s) déjà engagée(s) sur ${MAX_COMBAT_WAIFUS} autorisées`;
    $('statusCount').textContent=String(view.count);
    $('statusDetailsBtn').classList.toggle('has-effects',view.count>0);
    $('statusDetailsBtn').title=view.count?`Consulter ${view.count} effet(s) actif(s)`:'Aucun effet en cours';
    const key=`${slot.id}|${tower.floor}|${ev.enemy.id}|${view.turn}`;
    if(STATE.lastTurnIndicatorKey!==key){
      STATE.lastTurnIndicatorKey=key;
      const chip=$('turnIndicator');
      chip.classList.remove('new-turn');
      void chip.offsetWidth;
      chip.classList.add('new-turn');
    }
    for(const [side,id] of [['player','playerEffectsLine'],['enemy','enemyEffectsLine']]){
      const items=view.sides[side];
      const line=$(id);line.hidden=!items.length;
      for(const item of items.slice(0,2)){
        const chip=mkEl('span','effect-chip',`${item.icon} ${item.label}`);
        chip.title=item.detail;line.append(chip);
      }
      if(items.length>2)line.append(mkEl('span','effect-chip',`+${items.length-2}`));
    }
  }
  function openEffectsDetails(){
    const slot=STATE.slots.get(STATE.currentId);
    if(slot?.data.tower.event?.type!=='combat' || !slot.data.tower.combat)return;
    const tower=slot.data.tower;
    const view=COMBAT_UI.describe(tower.combat,tower.floor,tower.activeTraps);
    const content=$('effectsContent');content.replaceChildren();
    const groups=[
      ['👩 Ta waifu',view.sides.player],
      ['⚔️ Adversaire',view.sides.enemy],
      ['☠️ Pièges de la tour',view.traps]
    ];
    for(const [heading,items] of groups){
      const section=mkEl('section','effect-section');
      section.append(mkEl('h3','effect-heading',heading));
      if(!items.length)section.append(mkEl('p','effect-none','Aucun effet en cours.'));
      for(const item of items)section.append(mkEl('div','effect-description',`${item.icon} ${item.detail}`));
      content.append(section);
    }
    $('effectsOverlay').hidden=false;$('effectsClose').focus();
  }
  function closeEffectsDetails(){
    if($('effectsOverlay').hidden)return;
    $('effectsOverlay').hidden=true;
    if(!$('combatHud').hidden)$('statusDetailsBtn').focus();
  }
  // Le MISS apparaît sur la carte de la cible, quelle que soit la cause :
  // échec du jet de précision, esquive normale ou intangibilité.
  function combatMissFeedback(details){
    return {
      playerMiss:!!(details?.enemy?.miss || details?.enemy?.dodged),
      enemyMiss:!!(details?.player?.miss || details?.player?.dodged)
    };
  }
  const FLOATING_TEXT_MS = 1800; // Durée réelle de chaque dégât, soin ou MISS, même pendant AUTO.
  function playBattleFeedback(feedback){
    if(!feedback || STATE.screen!=='play'||STATE.activeTab!=='tour'||document.hidden)return;
    const announce=(cardId,amount,heal=0,miss=false)=>{
      const card=$(cardId);
      if(!card)return;
      const hit=amount>0,healing=!hit && heal>0;
      if(!hit && !healing && !miss)return;
      // Les impacts physiques peuvent se relancer, mais chaque texte flottant
      // conserve sa propre durée, même lorsqu'AUTO lance un nouveau tour.
      clearTimeout(card._impactTimer);
      card.classList.remove('impact-hit','impact-heal');
      if(hit||healing){
        void card.offsetWidth;
        card.classList.add(hit?'impact-hit':'impact-heal');
      }
      const labels=[];
      if(hit||healing){
        const label=mkEl('span',`hit-pop${healing?' is-heal':''}`,hit?`−${amount}`:`+${heal}`);
        label.setAttribute('aria-hidden','true');
        card.append(label);labels.push(label);
      }
      if(miss){
        const label=mkEl('span',`hit-pop is-miss${hit||healing?' is-stacked':''}`,'MISS');
        label.setAttribute('aria-hidden','true');
        card.append(label);labels.push(label);
      }
      for(const label of labels)setTimeout(()=>label.remove(),FLOATING_TEXT_MS);
      card._impactTimer=setTimeout(()=>{
        card.classList.remove('impact-hit','impact-heal');
        card._impactTimer=null;
      },850);
    };
    announce('playerCombatCard',feedback.playerLost,feedback.playerHeal||0,feedback.playerMiss);
    announce('enemyCombatCard',feedback.enemyLost,feedback.enemyHeal||0,feedback.enemyMiss);
  }
  function renderTower(slot){
    const tower=slot.data.tower;
    const event=tower.room==='event'?tower.event:null;
    const buttons=['advanceBtn','openChestBtn','startCombatBtn','chooseFighterBtn','continueBtn'];
    const onFirstFloorRest=tower.floor===1 && !event;
    $('quitTowerBtn').hidden=onFirstFloorRest;
    $('shortcutActions').hidden=!onFirstFloorRest;
    if(onFirstFloorRest){
      const available=slot.data.waifus.some(h=>heroAvailable(h,tower));
      const funds=slot.data.food.small;
      $('shortcutWallet').textContent=`🥩 ${funds.toLocaleString('fr-FR')} steaks disponibles · raccourcis payants en steaks`;
      for(const [kind,id] of [['reduced','shortcutReducedBtn'],['record','shortcutRecordBtn']]){
        const button=$(id),plan=SHORTCUTS.plan(tower.record,kind);
        const title=kind==='reduced'?'Reprendre à l’étage n−5':'Reprendre à l’étage n';
        const line=button.querySelector('.shortcut-name'),cost=button.querySelector('.shortcut-cost');
        line.textContent=plan?`↥ Reprendre à l’étage ${plan.target}`:`🔒 ${title}`;
        cost.textContent=plan?`${plan.cost.toLocaleString('fr-FR')} 🥩`:'Non débloqué';
        button.disabled=STATE.actionBusy||!available||!plan||funds<plan.cost;
        button.title=!plan?'Atteins un étage supérieur pour débloquer ce raccourci.':!available?'Soigne au moins une waifu avant de repartir.':funds<plan.cost?`Il te manque ${(plan.cost-funds).toLocaleString('fr-FR')} steaks.`:`Payer ${plan.cost.toLocaleString('fr-FR')} steaks et commencer à l’étage ${plan.target}.`;
      }
    }
    for(const id of buttons){$(id).hidden=true;$(id).disabled=STATE.actionBusy;}
    $('quitTowerBtn').disabled=STATE.actionBusy || STATE.enemyThinking;
    $('actionPanel').classList.remove('combat-mode');
    $('combatActionsGrid').hidden=true;
    const autoEnabled=slot.data.autoCombat===true;
    const autoButton=$('combatAutoButton');
    autoButton.disabled=STATE.actionBusy || STATE.enemyThinking;
    autoButton.classList.toggle('is-auto',autoEnabled);
    autoButton.setAttribute('aria-pressed',String(autoEnabled));
    $('combatAutoLabel').textContent=autoEnabled?'ON':'OFF';
    autoButton.title=autoEnabled?'Désactiver AUTO (combat et ascension)':'Activer AUTO : combat et ascension, sans capture, achat ni changement de waifu';
    const towerAutoButton=$('towerAutoButton');
    towerAutoButton.hidden=(event?.type==='combat' && event.state==='fighting');
    towerAutoButton.disabled=STATE.actionBusy || STATE.enemyThinking || event?.state==='awaiting_switch';
    towerAutoButton.classList.toggle('is-auto',autoEnabled);
    towerAutoButton.setAttribute('aria-pressed',String(autoEnabled));
    $('towerAutoLabel').textContent=autoEnabled?'ON':'OFF';
    towerAutoButton.title=autoEnabled?'Désactiver l’ascension automatique':'Activer AUTO : avancer, combattre et continuer sans achats ni captures';
    const hero=slot.data.waifus.find(h=>h.id===slot.data.activeWaifuId);
    const turn=(tower.combat?.turn??0)+1;
    const effect=COMBAT.normalizeEffects(tower.combat?.effects,turn).player;
    for(const btn of document.querySelectorAll('[data-combat-action]')){
      const action=btn.dataset.combatAction;
      btn.disabled=STATE.actionBusy || STATE.enemyThinking || autoEnabled || (action==='capture'
        ?!(CAPTURE.canAttempt(hero,event?.enemy) && (event?.captureAttempts??0)<3)
        :action==='special'
          ?!COMBAT.canUseSpecial(hero,hero?.energy??0,turn,effect)
          :!COMBAT.canPay(hero?.energy??0,action));
    }
    const special=COMBAT.SPECIALS[hero?.classId];
    $('specialActionName').textContent=special?.name||'Spéciale';
    $('specialActionButton').title=special?.description||'';
    const rate=event?.type==='combat'?CAPTURE.chance(event.enemy):0;
    const capturesLeft=Math.max(0,3-(event?.captureAttempts??0));
    $('captureChanceLabel').textContent=`2 ⚡ · ${rate}% · ${capturesLeft}/3`;
    $('captureActionButton').title=`Capturer : ${rate} % de chance · coût : 2 énergie · ${capturesLeft} tentative(s) restante(s) pour cette adversaire`;
    $('enemyThinking').hidden=!(STATE.enemyThinking && !STATE.turnClock?.enemyAction);
    $('actionPanel').classList.toggle('enemy-is-thinking',STATE.enemyThinking && !STATE.turnClock?.enemyAction);
    $('combatTimer').hidden=true;
    if(event?.type==='combat' && event.state==='fighting')syncTurnClock(slot,autoEnabled);
    else {STATE.turnClock=null;STATE.enemyThinking=false;}

    $('eventRank').textContent='—';
    $('eventRank').classList.add('muted');
    $('eventCombatMeters').hidden=true;
    $('eventWaiting').hidden=false;
    $('eventCardName').textContent='La tour';
    $('actionContext').textContent='Exploration';
    const history=Array.isArray(tower.history)?tower.history:[];
    // Évite de dupliquer la dernière action si elle est déjà affichée en résumé.
    const latestTurn=event?.type==='combat' && event.state==='fighting' && tower.combat?.lastMessage
      ?`Tour ${tower.combat.turn} : ${tower.combat.lastMessage}`:null;
    const journalHistory=latestTurn && history[0]===latestTurn?history.slice(1):history;
    $('logTop').textContent=journalHistory[0]||'Ton aventure commence dans la salle de repos.';
    $('logBottom').textContent=journalHistory[1]||'Explore à ton rythme.';
    if(!event){
      const activeHero=slot.data.waifus.find(h=>h.id===slot.data.activeWaifuId);
      const anyAvailable=slot.data.waifus.some(h=>heroAvailable(h,tower));
      setEventIcon('🏰','Salle de repos');
      $('eventFrame').setAttribute('aria-label','Salle de repos');
      $('eventWaitingTitle').textContent='Aucun événement';
      $('eventWaitingMessage').textContent='La tour attend ton prochain pas.';
      $('sideSituation').textContent='Une salle paisible avant la prochaine rencontre.';
      $('sideSituationChip').textContent='🏰 Salle de repos';
      setDesktopJournal(`Salle de repos · Étage ${tower.floor}`,'Avance pour découvrir la prochaine salle.');
      
      $('advanceBtn').hidden=false;
      $('advanceBtn').disabled=STATE.actionBusy||!anyAvailable;
      if(!anyAvailable){$('sideSituation').textContent='Aucune waifu valide. Retourne à l’hôpital de l’étage 1.';
        setDesktopJournal('🏥 Soins nécessaires','Toutes tes waifus sont KO ou hospitalisées. Retourne à l’hôpital.');
        }
    } else if(event.type==='combat'){
      const enemy=event.enemy,cls=classMap.get(enemy.classId);
      $('eventCardName').textContent=cls.name;
      $('eventRank').textContent=enemy.rank;
      $('eventRank').classList.remove('muted');
      $('eventIconContent').hidden=true;
      $('eventEnemyPortrait').hidden=false;
      if($('eventEnemyPortrait').getAttribute('src')!==heroPortrait(enemy))$('eventEnemyPortrait').src=heroPortrait(enemy);
      $('eventEnemyPortrait').alt=`Adversaire : ${cls.name}, rang ${enemy.rank}, ${morphName(enemy.morph)}`;
      $('eventFrame').classList.remove('event-placeholder');
      $('eventFrame').setAttribute('aria-label','Waifu adverse');
      $('eventWaiting').hidden=true;
      $('eventCombatMeters').hidden=false;
      $('enemyHpText').textContent=`${enemy.hp} / ${enemy.maxHp}`;
      $('enemyHpFill').style.width=`${100*enemy.hp/Math.max(1,enemy.maxHp)}%`;
      $('enemyEnergyText').textContent=`${enemy.energy} / 100`;
      $('enemyEnergyFill').style.width=`${enemy.energy}%`;
      $('sideSituation').textContent=event.state==='pending'?'Waifu adverse repérée.':event.state==='won'?'Adversaire vaincue.':event.state==='captured'?'Waifu capturée !':'Combat en cours.';
      $('sideSituationChip').textContent=`⚔️ Combat · Rang ${enemy.rank}`;
      if(event.state==='pending'){
        $('actionContext').textContent='Choix de la combattante';
        setDesktopJournal(`⚔️ ${cls.name} · Rang ${enemy.rank}`,heroAvailable(hero,tower)
          ?'Choisis ta waifu avant le combat : elle compte pour la première des 3 combattantes autorisées.'
          :'Ta waifu est blessée : choisis une combattante disponible dans ta collection.');
        
        $('startCombatBtn').hidden=false;
        $('startCombatBtn').disabled=STATE.actionBusy || !heroAvailable(hero,tower);
        $('chooseFighterBtn').hidden=false;
      }else if(event.state==='awaiting_switch'){
        $('actionContext').textContent='Relais obligatoire';
        setDesktopJournal('💀 Waifu KO !','Choisis une autre waifu disponible pour poursuivre le combat. Le chrono est arrêté.');
        
        $('sideSituation').textContent='Ton personnage est KO. L’adversaire conserve ses PV, son énergie et ses malus.';
      }else if(event.state==='captured'){
        const captured=slot.data.waifus.find(w=>w.id===event.capturedWaifuId);
        $('actionContext').textContent='Capture réussie';
        setDesktopJournal('🎯 CAPTURE RÉUSSIE !',captured
          ?`${classMap.get(captured.classId).name} · Rang ${captured.rank} · ${morphName(captured.morph)} — ajoutée à ta collection !`
          :'Une nouvelle waifu rejoint ta collection.');
        
        $('continueBtn').hidden=false;
      }else if(event.state==='won'){
        $('actionContext').textContent='Victoire';
        setDesktopJournal('🏆 VICTOIRE !',event.reward?rewardLine(event.reward):tower.combat?.lastMessage||'Adversaire vaincue.');
        
        $('continueBtn').hidden=false;
      }else{
        $('actionContext').textContent=`Tour ${tower.combat?.turn+1||1} · ${autoEnabled?'Combat AUTO':'Combat manuel'}`;
        // Pendant le duel, le panneau PC affiche le compte rendu du dernier tour.
        setDesktopJournal('',tower.combat?.lastMessage||'À toi de jouer. La plus rapide agit en premier, sauf Défense.');
        
        $('actionPanel').classList.add('combat-mode');
        $('combatActionsGrid').hidden=false;
        $('combatTimer').hidden=autoEnabled;
        if(!autoEnabled)paintClock();
      }
    } else {
      const opened=event.state==='opened';
      const trapped=opened && event.type==='trap';
      setEventIcon(opened?(trapped?'💀':'🎁'):'🎁',opened?(trapped?'Piège découvert':'Coffre ouvert'):'Coffre mystérieux');
      $('eventFrame').setAttribute('aria-label',opened?(trapped?'Coffre piégé révélé':'Coffre ouvert'):'Coffre mystérieux');
      $('eventWaitingTitle').textContent=opened?(trapped?'Piège !':'Coffre ouvert'):'Un coffre !';
      $('eventWaitingMessage').textContent=opened?(trapped?(event.trapType?TRAPS.TYPES[event.trapType].description+' · 2 étages.':'Piège découvert.'):event.reward?rewardLine(event.reward):'Le coffre a été ouvert.'):'Son contenu est inconnu...';
      $('sideSituation').textContent=opened?(trapped?'Un piège était caché dans ce coffre.':'Un coffre a été ouvert.'):'Impossible de savoir ce que contient ce coffre.';
      $('sideSituationChip').textContent=opened?(trapped?'☠️ Piège révélé':'🎁 Coffre ouvert'):'🎁 Coffre mystérieux';
      $('actionContext').textContent=opened?'Événement terminé':'Ouverture automatique';
      setDesktopJournal(opened?(trapped?'☠️ Coffre piégé !':'🎁 Coffre découvert'):'🎁 Coffre trouvé',
        opened?(trapped?(event.trapType?TRAPS.TYPES[event.trapType].description+' sur toutes tes waifus, pendant 2 étages.':'Ce coffre contenait un piège.')
          :event.reward?rewardLine(event.reward):'Le coffre a été ouvert.')
          :'Le coffre s’ouvre automatiquement après l’annonce.');
      
      // Les coffres restent indiscernables avant ouverture ; aucun clic « Ouvrir » n’est nécessaire.
      if(opened)$('continueBtn').hidden=false;
    }
    renderCombatHUD(slot);
  }

  function closeAnnouncement(){
    clearTimeout(STATE.announcementTimer);
    STATE.announcementTimer=null;
    const wasVisible=!$('eventAnnouncement').hidden;
    $('eventAnnouncement').hidden=true;
    const next=STATE.announcementCallback;
    STATE.announcementCallback=null;
    if(wasVisible && typeof next==='function')next();
  }
  function announceEvent(icon,title,subtitle,callback=null){
    closeAnnouncement();
    $('announcementIcon').textContent=icon;
    $('announcementTitle').textContent=title;
    $('announcementSubtitle').textContent=subtitle;
    STATE.announcementCallback=callback;
    $('eventAnnouncement').hidden=false;
    $('eventAnnouncement').focus();
    STATE.announcementTimer=setTimeout(closeAnnouncement,EVENT_ANNOUNCEMENT_MS);
    if(title==='COMBAT')AUDIO.playEffect('encounter');
    else if(title==='PIÈGE')AUDIO.playEffect('trap');
  }
  const BONUS_NAMES={force:'Force',rapidite:'Rapidité',constitution:'Constitution'};
  const BONUS_ICONS={force:'💪',rapidite:'⚡',constitution:'🛡️'};
  function rewardLine(reward){
    const parts=[];
    if(reward.food.small)parts.push(`🥩 Steak ×${reward.food.small}`);
    if(reward.food.large)parts.push(`🍖 Gigot ×${reward.food.large}`);
    if(reward.bonus)parts.push(`${BONUS_ICONS[reward.bonus]} ${BONUS_NAMES[reward.bonus]} +1 niveau (+2)`);
    return parts.join(' · ') || 'Aucun objet';
  }
  function renderRewardItems(reward){
    const grid=$('resultLootItems');grid.replaceChildren();
    const items=[];
    if(reward.food.small)items.push({icon:'🥩',name:'Steak',value:`×${reward.food.small}`});
    if(reward.food.large)items.push({icon:'🍖',name:'Gigot',value:`×${reward.food.large}`});
    if(reward.bonus){
      const slot=STATE.slots.get(STATE.currentId);
      const currentLevel=slot?.data.bonuses?.[reward.bonus];
      const value=Number.isSafeInteger(currentLevel)&&currentLevel>0
        ?`Niveau ${currentLevel} · +${BONUSES.points(currentLevel)} pour toutes`
        :'Niveau +1 · Stat +2';
      items.push({icon:BONUS_ICONS[reward.bonus],name:`Bonus ${BONUS_NAMES[reward.bonus]}`,value});
    }
    for(const item of items){
      const card=mkEl('div','loot-item');
      card.append(mkEl('span','loot-icon',item.icon),mkEl('strong','loot-title',item.name),mkEl('span','loot-quantity',item.value));
      grid.append(card);
    }
    grid.hidden=!items.length;
  }
  function displayResult(icon,title,description,reward=null){
    $('capturedPortrait').hidden=true;
    $('capturedPortrait').removeAttribute('src');
    $('eventResultIcon').textContent=icon;
    $('eventResultTitle').textContent=title;
    $('eventResultText').textContent=description;
    $('eventResultClose').textContent=reward?'RÉCUPÉRER ✓':'OK';
    if(reward)renderRewardItems(reward);
    else {$('resultLootItems').replaceChildren();$('resultLootItems').hidden=true;}
    $('eventResultOverlay').hidden=false;
    $('eventResultClose').focus();
  }
  function showPendingReward(){
    const slot=STATE.slots.get(STATE.currentId);
    if(STATE.screen!=='play'||!slot||!$('eventResultOverlay').hidden||!$('eventAnnouncement').hidden)return;
    const event=slot.data.tower.event;
    if(event?.type==='trap' && event.state==='opened' && event.trapType && !event.trapAcknowledged){
      const def=TRAPS.TYPES[event.trapType];
      displayResult('☠️','COFFRE PIÉGÉ !',`${def.icon} ${def.description} sur toutes tes waifus pendant 2 étages (celui-ci inclus).`);
      return;
    }
    if(event?.state==='captured' && !event.captureAcknowledged){
      const captured=slot.data.waifus.find(w=>w.id===event.capturedWaifuId);
      if(captured){
        displayResult('🎯','CAPTURE RÉUSSIE !',
          `${classMap.get(captured.classId).name} · Rang ${captured.rank} · ${morphName(captured.morph)} rejoint ta collection !`);
        $('capturedPortrait').src=heroPortrait(captured);
        $('capturedPortrait').alt=`Waifu capturée : ${classMap.get(captured.classId).name}`;
        $('capturedPortrait').hidden=false;
      }
      return;
    }
    if(event?.reward && !event.rewardAcknowledged &&
      (event.type==='combat'?event.state==='won':event.state==='opened')){
      displayResult('🎁',event.type==='combat'?'BUTIN DE VICTOIRE':'COFFRE OUVERT',
        'Récompenses ajoutées à ta partie !',event.reward);
    }
  }
  async function closeEventResult(){
    const overlay=$('eventResultOverlay');
    if(overlay.hidden)return;
    const slot=STATE.slots.get(STATE.currentId);
    const event=slot?.data.tower.event;
    if(event?.type==='trap' && event.state==='opened' && event.trapType && !event.trapAcknowledged){
      const ok=await commitBattle(data=>{
        if(data.tower.event?.type==='trap' && data.tower.event.state==='opened')data.tower.event.trapAcknowledged=true;
      });
      if(!ok)return;
    }else if(event?.state==='captured' && !event.captureAcknowledged){
      const ok=await commitBattle(data=>{
        const current=data.tower.event;
        if(current?.state==='captured')current.captureAcknowledged=true;
      });
      if(!ok)return;
    }else if(event?.reward && !event.rewardAcknowledged){
      // Le butin a déjà été accordé dans la même transaction que la victoire/l'ouverture.
      // Ici on mémorise seulement que le joueur a lu sa récompense.
      const ok=await commitBattle(data=>{
        const current=data.tower.event;
        if(current?.reward && !current.rewardAcknowledged)current.rewardAcknowledged=true;
      });
      if(!ok)return;
    }
    overlay.hidden=true;
    const next=$('continueBtn').hidden?$('advanceBtn'):$('continueBtn');
    if(!next.hidden)next.focus();
  }
  async function commitTower(mutator){
    if(STATE.actionBusy)return false;
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot)return false;
    STATE.actionBusy=true;
    try{
      const updated=clone(slot);
      HOSPITAL.ensure(updated.data);
      mutator(updated.data.tower);
      updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
      await saveSlot(updated);
      renderGame();
      return true;
    }catch(err){console.error('Écriture progression :',err);showToast(err.message===SAVE_CONFLICT?'⚠ Modifiée dans un autre onglet : actualise le jeu.':'⚠ Progression non enregistrée : réessaye.');return false;}
    finally{STATE.actionBusy=false;const current=STATE.slots.get(STATE.currentId);if(current)renderTower(current);}
  }
  async function commitBattle(mutator){
    if(STATE.actionBusy)return false;
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot)return false;
    STATE.actionBusy=true;
    try{
      const updated=clone(slot);
      HOSPITAL.ensure(updated.data);
      mutator(updated.data);
      updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
      await saveSlot(updated);
      renderGame();return true;
    }catch(err){console.error('Enregistrement du combat :',err);showToast(err.message===SAVE_CONFLICT?'⚠ Modifiée dans un autre onglet : actualise le jeu.':'⚠ Combat non enregistré : réessaye.');return false;}
    finally{STATE.actionBusy=false;const current=STATE.slots.get(STATE.currentId);if(current)renderGame();}
  }
  function fightKey(slot){
    const tower=slot.data.tower;
    return `${slot.id}|${tower.floor}|${tower.event?.enemy?.id}|${tower.combat?.turn}|${slot.data.activeWaifuId}`;
  }
  // Deux décisions indépendantes démarrent au début du même tour :
  // l'IA ne commence PAS à réfléchir quand le joueur clique.
  // Le joueur et l'IA partagent la même échéance de 15 secondes.
  function setEnemyThinking(thinking){
    STATE.enemyThinking=thinking;
    const pending=thinking && !STATE.turnClock?.enemyAction;
    $('enemyThinking').hidden=!pending;
    $('actionPanel').classList.toggle('enemy-is-thinking',pending);
    const slot=STATE.slots.get(STATE.currentId);
    if(slot && STATE.screen==='play')renderTower(slot);
  }
  function sameCombatTurn(slot,key){
    return !!slot && STATE.screen==='play' && fightKey(slot)===key &&
      slot.data.tower.event?.type==='combat' && slot.data.tower.event.state==='fighting';
  }
  function syncTurnClock(slot,auto=slot.data.autoCombat===true){
    const key=fightKey(slot);
    if(STATE.turnClock?.key===key)return;
    const now=Date.now();
    const thinkMs=auto
      ?ENEMY_DECISION_AUTO_MIN_MS+Math.floor(Math.random()*ENEMY_DECISION_AUTO_SPAN_MS)
      :ENEMY_DECISION_MIN_MS+Math.floor(Math.random()*ENEMY_DECISION_SPAN_MS);
    STATE.turnClock={key,remainingMs:TURN_SECONDS*1000,deadline:now+TURN_SECONDS*1000,
      enemyRemainingMs:thinkMs,enemyDecisionAt:now+thinkMs,enemyAction:null,playerAction:null,resolving:false};
    STATE.enemyThinking=false;
  }
  function pauseDecisions(clock,now){
    if(clock.deadline!==null){
      clock.remainingMs=Math.max(0,clock.deadline-now);
      clock.deadline=null;
    }
    if(clock.enemyDecisionAt!==null){
      clock.enemyRemainingMs=Math.max(0,clock.enemyDecisionAt-now);
      clock.enemyDecisionAt=null;
    }
  }
  function resumeDecisions(clock,now){
    if(clock.deadline===null)clock.deadline=now+clock.remainingMs;
    if(clock.enemyAction===null && clock.enemyDecisionAt===null)
      clock.enemyDecisionAt=now+clock.enemyRemainingMs;
  }
  function decideEnemyAction(slot,clock){
    if(clock.enemyAction!==null)return;
    const combat=slot.data.tower.combat;
    const enemy=slot.data.tower.event.enemy;
    const turn=combat.turn+1;
    const effect=COMBAT.normalizeEffects(combat.effects,turn).enemy;
    clock.enemyAction=COMBAT.chooseEnemyAction(enemy.energy,Math.random,enemy,turn,effect);
    clock.enemyDecisionAt=null;
    clock.enemyRemainingMs=0;
  }
  function queueCombatAction(action,automated=false){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot || !sameCombatTurn(slot,fightKey(slot)) || STATE.actionBusy || STATE.enemyThinking ||
       (slot.data.autoCombat===true&&!automated))return;
    const hero=slot.data.waifus.find(h=>h.id===slot.data.activeWaifuId);
    const turn=slot.data.tower.combat.turn+1;
    const effects=COMBAT.normalizeEffects(slot.data.tower.combat.effects,turn);
    const valid=action==='capture'?(CAPTURE.canAttempt(hero,slot.data.tower.event.enemy) && (slot.data.tower.event.captureAttempts??0)<3)
      :action==='special'?COMBAT.canUseSpecial(hero,hero?.energy??0,turn,effects.player)
      :COMBAT.canPay(hero?.energy??0,action);
    if(!valid){showToast(action==='capture' && (slot.data.tower.event.captureAttempts??0)>=3?'🎯 Les 3 tentatives de capture sont épuisées pour cette adversaire.':'⚡ Action impossible : énergie ou compétence indisponible.');return;}
    syncTurnClock(slot);
    const clock=STATE.turnClock;
    // Le clic ne prolonge jamais les 15 secondes : délai expiré => action sautée.
    clock.playerAction=(!automated && clock.deadline!==null && Date.now()>=clock.deadline)?'idle':action;
    setEnemyThinking(true);
    // Si l'IA a déjà décidé pendant que le joueur réfléchissait, résolution immédiate.
    if(clock.enemyAction!==null)resolveQueuedTurn().catch(e=>console.error('Résolution du tour :',e));
  }
  async function resolveQueuedTurn(){
    const clock=STATE.turnClock;
    const slot=STATE.slots.get(STATE.currentId);
    if(!clock || clock.resolving || !slot || !sameCombatTurn(slot,clock.key) ||
       clock.playerAction===null || clock.enemyAction===null || STATE.actionBusy)return;
    clock.resolving=true;
    let action=clock.playerAction;
    const aiAction=clock.enemyAction;
    // Le Siphon peut retirer de l'énergie pendant l'attente de l'IA.
    // Une action devenue impayable ne doit pas bloquer le tour : la waifu
    // se défend à la place, avec un avertissement visible.
    if(action!=='idle' && action!=='defend'){
      const hero=slot.data.waifus.find(h=>h.id===slot.data.activeWaifuId);
      const effects=COMBAT.normalizeEffects(slot.data.tower.combat.effects,slot.data.tower.combat.turn+1);
      const available=action==='capture'
        ?(CAPTURE.canAttempt(hero,slot.data.tower.event.enemy) && (slot.data.tower.event.captureAttempts??0)<3)
        :action==='special'
          ?COMBAT.canUseSpecial(hero,hero?.energy??0,slot.data.tower.combat.turn+1,effects.player)
          :COMBAT.canPay(hero?.energy??0,action);
      if(!available){action='defend';showToast('⚡ Action indisponible (énergie ou recharge). Ta waifu se défend.');}
    }
    try{
      if(action==='capture')await resolveCaptureAction(aiAction);
      else await resolveCombatAction(action,aiAction);
    }finally{
      // Si une sauvegarde échoue, libérer le tour pour permettre de réessayer.
      if(STATE.turnClock===clock){STATE.turnClock=null;setEnemyThinking(false);}
    }
  }
  function paintClock(){
    const clock=STATE.turnClock;
    const remain=clock?(clock.deadline===null?clock.remainingMs:Math.max(0,clock.deadline-Date.now())):TURN_SECONDS*1000;
    $('combatTimer').textContent=`⏱ ${Math.max(0,Math.ceil(remain/1000))} s`;
    $('combatTimer').classList.toggle('urgent',remain<=5000);
  }
  function isCombatVisible(){
    const slot=STATE.slots.get(STATE.currentId);
    const ev=slot?.data.tower.event;
    return !!(slot && STATE.screen==='play' && STATE.activeTab==='tour' && !document.hidden && ev?.type==='combat' &&
      ev.state==='fighting' && $('confirmOverlay').hidden && $('fighterOverlay').hidden && $('waifuDetailOverlay').hidden &&
      $('portraitOverlay').hidden && $('effectsOverlay').hidden && $('eventResultOverlay').hidden && $('eventAnnouncement').hidden);
  }
  // Les onglets cachés et les fenêtres modales suspendent ENSEMBLE les deux
  // décisions et la durée du tour ; rien ne se déroule hors écran.
  async function liveCombatTick(){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot?.data.tower.combat || slot.data.tower.event?.state!=='fighting'){
      STATE.turnClock=null;STATE.autoNextAt=0;STATE.autoStallNotified=false;return;
    }
    const autoEnabled=slot.data.autoCombat===true;
    if(!STATE.turnClock)syncTurnClock(slot,autoEnabled);
    const active=isCombatVisible();
    if(!active){
      STATE.autoNextAt=0;
      if(STATE.turnClock)pauseDecisions(STATE.turnClock,Date.now());
      // Pas de siphon ni de malédiction chronométrée hors de la vue combat :
      // une fenêtre modale, un onglet caché ou le menu suspendent l'horloge.
      if(!STATE.actionBusy && !STATE.liveTickBusy){
        const fx=slot.data.tower.combat.effects;
        if(fx)for(const side of ['player','enemy'])for(const key of ['siphon','curse']){
          if(fx[side]?.[key])fx[side][key].nextTickAt=0;
        }
      }
      return;
    }
    const now=Date.now();
    resumeDecisions(STATE.turnClock,now);
    if(!autoEnabled)paintClock();
    if(STATE.actionBusy || STATE.liveTickBusy || STATE.turnClock.resolving)return;
    // La décision de l'ennemie arrive selon son propre délai, indépendant du clic.
    if(STATE.turnClock.enemyAction===null && now>=STATE.turnClock.enemyDecisionAt){
      decideEnemyAction(slot,STATE.turnClock);
      if(STATE.turnClock.playerAction!==null){
        // Les boutons restent bloqués jusqu'à l'enregistrement du tour.
        // Le spinner disparaît car enemyAction est désormais connu.
        renderTower(slot);
        await resolveQueuedTurn();
        return;
      }
    }
    const nextTurn=slot.data.tower.combat.turn+1;
    const effects=COMBAT.normalizeEffects(slot.data.tower.combat.effects,nextTurn);
    if(COMBAT.timedTickDue(effects,now)){
      STATE.liveTickBusy=true;
      try{
        await commitBattle(data=>{
          const hero=data.waifus.find(h=>h.id===data.activeWaifuId);
          const tick=COMBAT.tickTimedEffects(data.tower.combat.effects,hero,data.tower.event.enemy,Date.now(),data.tower.combat.turn+1);
          data.tower.combat.effects=tick.effects;
        });
      }finally{STATE.liveTickBusy=false;}
    }
    if(autoEnabled){
      if(STATE.actionBusy || STATE.liveTickBusy || STATE.turnClock?.playerAction!==null)return;
      const hero=slot.data.waifus.find(w=>w.id===slot.data.activeWaifuId);
      const enemy=slot.data.tower.event.enemy;
      // À 0 EN, AUTO se défend ; la fatigue réciproque évite les impasses.
      STATE.autoStallNotified=false;
      if(!STATE.autoNextAt)STATE.autoNextAt=Date.now()+AUTO_INTERVAL_MS;
      if(Date.now()>=STATE.autoNextAt){
        STATE.autoNextAt=Date.now()+AUTO_INTERVAL_MS;
        const move=AUTO.chooseAction(hero,enemy,slot.data.tower.combat.turn+1,slot.data.tower.combat.effects,Math.random);
        if(move)await takeCombatAction(move,true);
      }
      return;
    }
    if(STATE.turnClock && STATE.turnClock.deadline!==null && Date.now()>=STATE.turnClock.deadline && !STATE.actionBusy){
      // Les deux partagent les 15 s : si le joueur n'a rien choisi, il passe son tour.
      // L'IA doit impérativement avoir choisi au plus tard à cette échéance.
      if(STATE.turnClock.enemyAction===null)decideEnemyAction(slot,STATE.turnClock);
      if(STATE.turnClock.playerAction===null){
        STATE.turnClock.playerAction='idle';
        setEnemyThinking(true);
      }
      await resolveQueuedTurn();
    }
  }

  // AUTO est un mode unique pour le combat et la progression entre les salles.
  // Il n'achète jamais de raccourci et ne tente jamais de capture.
  async function toggleAutoCombat(){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot || STATE.screen!=='play' || STATE.actionBusy || STATE.enemyThinking ||
       slot.data.tower.event?.state==='awaiting_switch')return;
    const enabled=slot.data.autoCombat!==true;
    const saved=await commitBattle(data=>{data.autoCombat=enabled;});
    if(saved){
      STATE.turnClock=null;
      STATE.autoNextAt=0;
      STATE.autoTowerNextAt=Date.now()+AUTO_TOWER_INTERVAL_MS;
      STATE.autoRewardSeenAt=0;
      STATE.autoStallNotified=false;
      renderGame();
      showToast(enabled?'🤖 AUTO activé : ascension et combats, sans capture ni achat.':'🤖 AUTO désactivé : commandes manuelles.');
    }
  }

  // Le même ticker qui orchestre les combats orchestre l'exploration.
  // Une seule transition enregistrée à la fois, uniquement si la tour est visible.
  async function liveAutoTowerTick(){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot || slot.data.autoCombat!==true || STATE.screen!=='play' || STATE.activeTab!=='tour' ||
       document.hidden || STATE.actionBusy || STATE.autoTowerBusy || STATE.enemyThinking)return;
    const tower=slot.data.tower,ev=tower.event;
    if(ev?.type==='combat' && ev.state==='fighting')return;
    if(ev?.state==='awaiting_switch'){
      // Le relais reste un choix du joueur : on coupe AUTO pour éviter une impasse.
      STATE.autoTowerBusy=true;
      try{
        const ok=await commitBattle(data=>{data.autoCombat=false;});
        if(ok)showToast('🤖 AUTO arrêté : choisis une waifu pour le relais.');
      }finally{STATE.autoTowerBusy=false;}
      return;
    }
    // Une fenêtre de confirmation, les fiches, le menu ou l'annonce d'un événement
    // suspendent AUTO. Les résultats de butin sont les seules fenêtres auto-fermées.
    const blocking=['confirmOverlay','fighterOverlay','waifuDetailOverlay','portraitOverlay',
      'effectsOverlay','renameHeroOverlay','morphOverlay','audioOverlay','eventAnnouncement','relayOverlay'];
    if(blocking.some(id=>!$(id).hidden))return;
    const resultOverlay=$('eventResultOverlay');
    if(!resultOverlay.hidden){
      if(!STATE.autoRewardSeenAt)STATE.autoRewardSeenAt=Date.now();
      if(Date.now()-STATE.autoRewardSeenAt<AUTO_REWARD_PAUSE_MS)return;
      STATE.autoTowerBusy=true;
      try{await closeEventResult();}
      finally{STATE.autoTowerBusy=false;STATE.autoRewardSeenAt=0;STATE.autoTowerNextAt=Date.now()+AUTO_TOWER_INTERVAL_MS;}
      return;
    }
    STATE.autoRewardSeenAt=0;
    if(Date.now()<STATE.autoTowerNextAt)return;
    STATE.autoTowerBusy=true;
    try{
      if(tower.room==='rest'){
        if(!slot.data.waifus.some(hero=>heroAvailable(hero,tower))){
          const ok=await commitBattle(data=>{data.autoCombat=false;});
          if(ok)showToast('🏥 AUTO arrêté : aucune waifu disponible.');
        }else await advanceInTower();
      }else if(tower.room==='event' && ev){
        if(ev.type==='combat' && ev.state==='pending'){
          const hero=slot.data.waifus.find(w=>w.id===slot.data.activeWaifuId);
          if(heroAvailable(hero,tower))await startCombat();
          else{
            const ok=await commitBattle(data=>{data.autoCombat=false;});
            if(ok)showToast('🤖 AUTO arrêté : sélectionne une combattante disponible.');
          }
        }else if(['chest','trap'].includes(ev.type) && ev.state==='pending')await openChest();
        else if((ev.type==='combat' && ['won','captured'].includes(ev.state)) ||
                (['chest','trap'].includes(ev.type) && ev.state==='opened')){
          // Un résultat non acquitté déclenche normalement sa fenêtre au rendu ;
          // ne jamais passer à l'étage suivant avant de l'avoir affiché.
          if((ev.reward && !ev.rewardAcknowledged) ||
             (ev.type==='trap' && ev.trapType && !ev.trapAcknowledged) ||
             (ev.state==='captured' && !ev.captureAcknowledged)){
            showPendingReward();
          }else await finishCurrentEvent();
        }
      }
    }finally{
      STATE.autoTowerBusy=false;
      STATE.autoTowerNextAt=Date.now()+AUTO_TOWER_INTERVAL_MS;
    }
  }

  async function startCombat(){
    const slot=STATE.slots.get(STATE.currentId);
    const ev=slot?.data.tower.event;
    if(slot?.data.tower.room!=='event'||ev?.type!=='combat'||ev.state!=='pending')return;
    const hero=slot.data.waifus.find(h=>h.id===slot.data.activeWaifuId);
    if(!heroAvailable(hero,slot.data.tower)){showToast('Choisis une waifu disponible dans Collection.');return;}
    const started=await commitBattle(data=>{
      data.tower.event.state='fighting';
      data.tower.combat={turn:0,lastMessage:'Le combat commence ! Choisis ton action.',effects:COMBAT.normalizeEffects(),knockedOutIds:[],usedHeroIds:[data.activeWaifuId]};
      appendTowerHistory(data.tower,'Combat engagé : '+classMap.get(data.tower.event.enemy.classId).name+'.');
    });
    if(started)AUDIO.playEffect('start');
  }
  function takeCombatAction(action,automated=false){queueCombatAction(action,automated);}
  async function resolveCombatAction(action,aiAction){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot || slot.data.tower.event?.state!=='fighting')return;
    let outcome='fighting';
    let feedback=null;
    let ok=false;
    try{
    ok=await commitBattle(data=>{
      const hero=data.waifus.find(h=>h.id===data.activeWaifuId);
      const event=data.tower.event;
      const result=COMBAT.resolveTurn(hero,event.enemy,action,data.bonuses,Math.random,{turn:data.tower.combat.turn+1,effects:data.tower.combat.effects,
        enemyAction:aiAction,trapPenalties:TRAPS.penalties(data.tower.activeTraps,data.tower.floor)});
      feedback={playerLost:Math.max(0,hero.hp-result.player.hp),enemyLost:Math.max(0,event.enemy.hp-result.enemy.hp),
        playerHeal:Math.max(0,result.player.hp-hero.hp),enemyHeal:Math.max(0,result.enemy.hp-event.enemy.hp),
        ...combatMissFeedback(result.details)};
      hero.hp=result.player.hp;hero.energy=result.player.energy;
      event.enemy.hp=result.enemy.hp;event.enemy.energy=result.enemy.energy;
      data.tower.combat.effects=result.effects;
      data.tower.combat.turn++;
      data.tower.combat.lastMessage=result.summary;
      data.tower.combat.lastAction=action;
      data.tower.combat.lastEnemyAction=result.aiAction;
      appendTowerHistory(data.tower,`Tour ${data.tower.combat.turn} : ${result.summary}`);
      outcome=result.result;
      if(outcome==='won'){
        event.state='won';
        // Attribué UNE SEULE fois, dans la même sauvegarde que la victoire.
        if(!event.reward){
          event.reward=REWARDS.combatReward(event.enemy.rank);
          event.rewardAcknowledged=false;
          REWARDS.grant(data,event.reward);
        }
        // V12.0.18 : blessure persistante même pour les survivantes.
        // Seule l'énergie se recharge ; les KO restent à 0 PV jusqu'à l'hôpital.
        for(const w of data.waifus)w.energy=100;
        data.tower.combat.lastMessage+=' Victoire ! '+rewardLine(event.reward)+'.';
        appendTowerHistory(data.tower,'Butin de combat : '+rewardLine(event.reward));
      }else if(outcome==='lost'){
        const knocked=data.tower.combat.knockedOutIds||(data.tower.combat.knockedOutIds=[]);
        if(!knocked.includes(hero.id))knocked.push(hero.id);
        hero.hp=0;hero.injuredUntil=0;
        if(availableReserves(data).length){
          event.state='awaiting_switch';
          data.tower.combat.lastMessage+=` Choisis ton relais (${combatParticipants(data).length}/${MAX_COMBAT_WAIFUS} engagées).`;
          appendTowerHistory(data.tower,'Waifu KO : relais nécessaire.');
          outcome='switch';
        }else{
          // Après le 3e KO, défaite, même si d'autres waifus attendent en collection.
          const record=data.tower.record;
          const log=`Défaite à l’étage ${data.tower.floor}. Retour à l’étage 1.`;
          data.autoCombat=false; // Une défaite interrompt l'ascension automatique.
          data.tower.floor=1;data.tower.room='rest';data.tower.event=null;
          data.tower.combat=null;data.tower.activeTraps=[];data.tower.record=record;
          for(const w of data.waifus)w.energy=100;
          appendTowerHistory(data.tower,log);
        }
      }
    });
    }finally{
      setEnemyThinking(false);
    }
    if(ok){
      if(action==='light')AUDIO.playEffect('light');
      if(action==='heavy')AUDIO.playEffect('heavy');
      if(action==='special')AUDIO.playEffect('special');
      if(action==='defend')AUDIO.playEffect('defend');
      if(action==='idle')AUDIO.playEffect('miss');
      if(feedback?.playerLost>0 || feedback?.enemyLost>0)AUDIO.playEffect('hit');
      if((STATE.slots.get(STATE.currentId)?.data.tower.combat?.lastMessage||'').includes('CRITIQUE'))AUDIO.playEffect('crit');
      if(outcome==='won')AUDIO.playEffect('victory');
      if(outcome==='lost')AUDIO.playEffect('defeat');
      playBattleFeedback(feedback);
    }
    if(ok && outcome==='lost'){
      displayResult('💀','DÉFAITE','Les 3 combattantes autorisées ont été mises KO, ou aucun relais n’est disponible. Retour à l’étage 1. Les blessures persistent : utilise l’hôpital pour soigner tes waifus.');
    }
  }


  // La capture est une action de combat : 2 EN, une tentative par tour.
  // En cas d'échec, l'ennemie joue normalement. Aucune nourriture n'est gagnée
  // si la capture réussit, et on ne peut pas capturer une ennemie KO.
  function takeCaptureAction(){queueCombatAction('capture');}
  async function resolveCaptureAction(aiAction){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot || slot.data.tower.event?.state!=='fighting')return;
    let outcome='fighting';
    let feedback=null;
    const ok=await commitBattle(data=>{
      const target=data.tower.event;
      if(!target || target.type!=='combat' || target.state!=='fighting')throw Error('Combat non disponible');
      if((target.captureAttempts??0)>=3)throw Error('Trois tentatives de capture déjà utilisées.');
      const player=data.waifus.find(w=>w.id===data.activeWaifuId);
      const result=CAPTURE.attempt(player,target.enemy,data.bonuses,Math.random,
        {turn:data.tower.combat.turn+1,effects:data.tower.combat.effects,enemyAction:aiAction,
          trapPenalties:TRAPS.penalties(data.tower.activeTraps,data.tower.floor)});
      feedback={playerLost:Math.max(0,player.hp-result.player.hp),enemyLost:Math.max(0,target.enemy.hp-result.enemy.hp),
        playerHeal:Math.max(0,result.player.hp-player.hp),enemyHeal:Math.max(0,result.enemy.hp-target.enemy.hp),
        ...combatMissFeedback(result.details)};
      player.hp=result.player.hp;player.energy=result.player.energy;
      target.enemy.hp=result.enemy.hp;target.enemy.energy=result.enemy.energy;
      data.tower.combat.effects=result.effects;
      data.tower.combat.turn++;
      data.tower.combat.lastMessage=result.summary;
      target.captureAttempts=(target.captureAttempts??0)+1;
      data.tower.combat.lastAction='capture';
      data.tower.combat.lastEnemyAction=result.aiAction;
      appendTowerHistory(data.tower,`Tour ${data.tower.combat.turn} : ${result.summary}`);
      if(!result.success && target.captureAttempts>=3){
        data.tower.combat.lastMessage+=' 🎯 Trois tentatives épuisées : capture impossible sur cette adversaire.';
        appendTowerHistory(data.tower,'🎯 Trois tentatives de capture épuisées pour cette adversaire.');
      }
      outcome=result.result;
      if(result.success){
        // Identité distincte pour chaque copie. La morphologie, la classe et le
        // rang sont ceux de l'ennemie au moment exact de la capture.
        const enemy=target.enemy;
        // Le bonus de difficulté n'appartient PAS à la waifu capturée.
        // Ses bonus de collection seront calculés depuis la collection du joueur.
        const captiveStats=clone(enemy.stats);
        for(const stat of ['force','rapidite','constitution'])
          captiveStats[stat]=Math.max(0,captiveStats[stat]-(enemy.towerStatBonus||0));
        const captive={id:makeId(),classId:enemy.classId,rank:enemy.rank,morph:enemy.morph,
          evolutionPoints:0,stats:captiveStats,maxHp:enemy.maxHp,
          hp:enemy.maxHp,energy:100,injuredUntil:0};
        data.waifus.push(captive);
        target.state='captured';
        target.capturedWaifuId=captive.id;
        target.captureAcknowledged=false;
        // La capture ne guérit personne : les PV restent à leur valeur de fin de combat.
        for(const owned of data.waifus)owned.energy=100;
        appendTowerHistory(data.tower,`${classMap.get(captive.classId).name} capturée — rang ${captive.rank}. Aucun butin de combat.`);
      }else if(outcome==='lost'){
        const knocked=data.tower.combat.knockedOutIds||(data.tower.combat.knockedOutIds=[]);
        if(!knocked.includes(player.id))knocked.push(player.id);
        player.hp=0;player.injuredUntil=0;
        if(availableReserves(data).length){
          target.state='awaiting_switch';
          data.tower.combat.lastMessage+=` Choisis ton relais (${combatParticipants(data).length}/${MAX_COMBAT_WAIFUS} engagées).`;
          appendTowerHistory(data.tower,'Waifu KO après une capture ratée : relais nécessaire.');
          outcome='switch';
        }else{
          const record=data.tower.record;
          const log=`Défaite à l’étage ${data.tower.floor}. Retour à l’étage 1.`;
          data.autoCombat=false; // Une défaite interrompt l'ascension automatique.
          data.tower.floor=1;data.tower.room='rest';data.tower.event=null;
          data.tower.combat=null;data.tower.activeTraps=[];data.tower.record=record;
          for(const owned of data.waifus)owned.energy=100;
          appendTowerHistory(data.tower,log);
        }
      }
    });
    if(ok){
      AUDIO.playEffect(outcome==='captured'?'capture':'captureFail');
      if(feedback?.playerLost>0)AUDIO.playEffect('hit');
      if(outcome==='lost')AUDIO.playEffect('defeat');
      playBattleFeedback(feedback);
    }
    if(ok && outcome==='lost')displayResult('💀','DÉFAITE',
      'Les 3 combattantes autorisées sont KO, ou aucun relais n’est disponible. Retour à l’étage 1 : tes waifus restent blessées et doivent être soignées à l’hôpital.');
  }

  // Choix rapide d'une combattante avant un combat, sans changement de page.
  function openFighterPicker(){
    const slot=STATE.slots.get(STATE.currentId);
    if(slot?.data.tower.event?.type!=='combat'||slot.data.tower.event.state!=='pending')return;
    const grid=$('fighterGrid');grid.replaceChildren();
    for(const waifu of rankedHeroes(slot.data.waifus)){
      const cls=classMap.get(waifu.classId);
      const card=mkEl('button',`fighter-card${waifu.id===slot.data.activeWaifuId?' selected':''}`);
      card.type='button';card.dataset.fighterHeroId=waifu.id;
      const eligible=heroAvailable(waifu,slot.data.tower);
      card.disabled=!eligible;
      const img=mkEl('img');img.src=heroPortrait(waifu);img.alt=cls.name;
      card.append(img,mkEl('strong','',`${cls.icon} ${heroName(waifu)} · ${waifu.rank}`),
        mkEl('small','',eligible
          ?`❤️ ${waifu.hp}/${waifu.maxHp} · ⚡ ${waifu.energy}/100`
          :currentHeroStatus(waifu,slot.data.tower)||'Indisponible'));
      card.addEventListener('click',()=>chooseFighter(waifu.id));grid.append(card);
    }
    $('fighterOverlay').hidden=false;
    $('fighterClose').focus();
  }
  function closeFighterPicker(){$('fighterOverlay').hidden=true;}
  async function chooseFighter(id){
    const slot=STATE.slots.get(STATE.currentId);
    if(slot?.data.tower.event?.state!=='pending'||
      !slot.data.waifus.some(w=>w.id===id&&heroAvailable(w,slot.data.tower)))return;
    if(id!==slot.data.activeWaifuId){
      const ok=await commitBattle(data=>{
        if(data.tower.event?.state!=='pending')throw Error('Sélection hors du précombat');
        data.activeWaifuId=id;
      });
      if(!ok)return;
    }
    closeFighterPicker();
    showToast('👩 Combattante sélectionnée !');
  }


  // Relais exclusivement après KO, jamais un échange tactique libre.
  function renderRelayPicker(){
    const slot=STATE.slots.get(STATE.currentId);
    const waiting=STATE.screen==='play' && slot?.data.tower.event?.state==='awaiting_switch';
    $('relayOverlay').hidden=!waiting;
    if(!waiting)return;
    const holder=$('relayGrid');holder.replaceChildren();
    const reserves=availableReserves(slot.data);
    $('relaySubtitle').textContent=`${combatParticipants(slot.data).length}/${MAX_COMBAT_WAIFUS} combattantes déjà utilisées · ${reserves.length} remplaçante${reserves.length>1?'s':''} disponible${reserves.length>1?'s':''} · adversaire : ${slot.data.tower.event.enemy.hp} PV`;
    for(const hero of rankedHeroes(reserves)){
      const cls=classMap.get(hero.classId);
      const btn=mkEl('button','relay-card');btn.type='button';btn.dataset.relayHeroId=hero.id;
      const img=mkEl('img');img.src=heroPortrait(hero);img.alt=`Portrait de ${cls.name}`;
      btn.append(img,mkEl('strong','',`${cls.icon} ${heroName(hero)}`),
        mkEl('small','',`Rang ${hero.rank} · ❤️ ${hero.hp}/${hero.maxHp} · ⚡ ${hero.energy}/100`));
      btn.addEventListener('click',()=>chooseRelay(hero.id));holder.append(btn);
    }
  }
  async function chooseRelay(heroId){
    const slot=STATE.slots.get(STATE.currentId);
    if(slot?.data.tower.event?.state!=='awaiting_switch' || !canEngageRelay(slot.data,heroId))return;
    const ok=await commitBattle(data=>{
      if(!canEngageRelay(data,heroId))throw Error('Relais impossible : quota de trois combattantes atteint');
      // Le relais devient la 2e ou 3e combattante du duel, comptabilisée une seule fois.
      data.tower.combat.usedHeroIds=[...combatParticipants(data),heroId];
      const hero=data.waifus.find(w=>w.id===heroId);
      data.activeWaifuId=hero.id;
      data.tower.event.state='fighting';
      // Les malus subis par l'ancienne waifu ne sont pas transmis au relais ;
      // ceux de l'adversaire restent intacts, ainsi que ses PV et EN.
      const effects=COMBAT.normalizeEffects(data.tower.combat.effects);
      effects.player=COMBAT.emptyEffect();
      data.tower.combat.effects=effects;
      data.tower.combat.lastMessage=`${classMap.get(hero.classId).name} entre dans le combat ! L’adversaire conserve ses dégâts.`;
      appendTowerHistory(data.tower,`${classMap.get(hero.classId).name} prend le relais.`);
    });
    if(ok){AUDIO.playEffect('switch');showToast('⚔️ Nouvelle combattante en place !');}
  }

  // Une seule annonce avant d’ouvrir le coffre : récompense OU piège révélé juste après.
  function announceChestThenOpen(){
    announceEvent('🎁','COFFRE','Un coffre mystérieux apparaît !',()=>{void openChest();});
  }

  function requestPaidResume(kind){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot || STATE.actionBusy || slot.data.tower.floor!==1 || slot.data.tower.room!=='rest' || slot.data.tower.event)return;
    const available=slot.data.waifus.some(h=>heroAvailable(h,slot.data.tower));
    if(!available){showToast('🏥 Soigne au moins une waifu avant de repartir.');return;}
    const plan=SHORTCUTS.plan(slot.data.tower.record,kind);
    if(!plan){showToast('🔒 Ce raccourci n’est pas encore débloqué.');return;}
    if(slot.data.food.small<plan.cost){showToast(`🥩 Il te manque ${(plan.cost-slot.data.food.small).toLocaleString('fr-FR')} steaks.`);return;}
    openConfirm('🏰 Reprendre à l’étage '+plan.target+' ?',
      `Ce raccourci coûte ${plan.cost.toLocaleString('fr-FR')} steaks. Il te restera ${(slot.data.food.small-plan.cost).toLocaleString('fr-FR')} steaks. Tu arriveras dans la salle de repos de l’étage ${plan.target}, sans nouvelles récompenses ni soin gratuit. Continuer ?`,
      async()=>{
        const okay=await commitBattle(data=>{
          if(!data.waifus.some(h=>heroAvailable(h,data.tower)))throw Error('Aucune waifu disponible');
          const applied=SHORTCUTS.apply(data,kind);
          appendTowerHistory(data.tower,`Ascenseur : reprise à l’étage ${applied.target} pour ${applied.cost} steaks.`);
        });
        if(okay){STATE.activeTab='tour';renderGame();showToast(`🏰 Étage ${plan.target} atteint · −${plan.cost.toLocaleString('fr-FR')} steaks !`);}
      });
    $('confirmAccept').textContent='Payer et reprendre';
  }
  async function advanceInTower(){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot||slot.data.tower.room!=='rest')return;
    if(!slot.data.waifus.some(h=>heroAvailable(h,slot.data.tower))){showToast('🏥 Soigne au moins une waifu avant de repartir.');return;}
    const floor=slot.data.tower.floor;
    const event=chooseEvent(floor);
    const okay=await commitTower(tower=>{
      tower.room='event';tower.event=event;tower.combat=null;
      appendTowerHistory(tower,event.type==='combat'?`Étage ${floor} : waifu ennemie rencontrée.`:`Étage ${floor} : coffre découvert.`);
    });
    if(okay){
      if(event.type==='combat')announceEvent('⚔️','COMBAT','Une adversaire apparaît !');
      else announceChestThenOpen();
    }
  }
  async function openChest(){
    const slot=STATE.slots.get(STATE.currentId);
    const event=slot?.data.tower.event;
    if(!event || slot.data.tower.room!=='event'||!['chest','trap'].includes(event.type)||event.state!=='pending')return;
    const trapped=event.type==='trap';
    const reward=trapped?null:REWARDS.chestReward(Math.random);
    const trapType=trapped?TRAPS.select(Math.random):null;
    const okay=await commitBattle(data=>{
      const current=data.tower.event;
      if(!current||current.state!=='pending')throw Error('Coffre déjà ouvert');
      current.state='opened';
      if(trapped){
        current.trapType=trapType;current.trapAcknowledged=false;
        TRAPS.apply(data.tower,trapType);
      }else{
        current.reward=reward;
        current.rewardAcknowledged=false;
        REWARDS.grant(data,reward);
      }
      appendTowerHistory(data.tower,trapped?'Piège : '+TRAPS.TYPES[trapType].description+' (2 étages).':'Coffre ouvert : '+rewardLine(reward));
    });
    if(!okay){
      // Rare échec d’écriture : conserver une possibilité de réessayer sans perdre le coffre.
      $('openChestBtn').hidden=false;
      $('openChestBtn').textContent='🎁 RÉESSAYER';
      return;
    }
    // La fenêtre de résultat est ouverte par le rendu APRÈS la sauvegarde.
    // Ni double annonce ni seconde interaction : le piège est révélé ici.
    AUDIO.playEffect(trapped?'trap':'chest');
  }
  async function finishCurrentEvent(){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot||slot.data.tower.room!=='event')return;
    const event=slot.data.tower.event;
    if(!event)return;
    if(event.type==='combat'?!['won','captured'].includes(event.state):event.state!=='opened')return;
    const floor=slot.data.tower.floor;
    const ok=await commitTower(tower=>{
      tower.floor+=1;
      TRAPS.advance(tower); // expiration en entrant dans le 3e étage.
      tower.record=Math.max(tower.record,tower.floor);
      tower.room='rest';tower.event=null;tower.combat=null;
      appendTowerHistory(tower,`Étage ${floor} terminé. Étage ${tower.floor} atteint.`);
    });
    if(ok)showToast(`🏰 Étage ${floor+1} atteint !`);
  }
  function requestQuitTower(){
    const slot=STATE.slots.get(STATE.currentId);if(!slot)return;
    openConfirm('Quitter la tour ?',
      `Ton ascension actuelle (étage ${slot.data.tower.floor}) sera abandonnée et tu reviendras à l’étage 1 pour accéder à l’hôpital et à la boutique. Les PV perdus restent perdus. Ta collection, tes bonus et ton record seront conservés.`,
      async()=>{
        const ok=await commitBattle(data=>{
          const tower=data.tower;
          tower.floor=1;tower.room='rest';tower.event=null;tower.combat=null;tower.activeTraps=[];
          for(const w of data.waifus)w.energy=100;
          data.autoCombat=false; // Quitter la tour doit réellement arrêter AUTO.
          appendTowerHistory(tower,'Ascension abandonnée : retour à l’étage 1.');
        });
        if(ok){STATE.activeTab='tour';renderGame();showToast('Retour à l’étage 1.');}
      });
    $('confirmAccept').textContent='Quitter la tour';
  }
  function renderGame(){
    const slot=STATE.slots.get(STATE.currentId);if(!slot){showScreen('menu');return;}
    syncAudioScene();
    const data=slot.data,hero=data.waifus.find(h=>h.id===data.activeWaifuId)||data.waifus[0];
    const cls=classMap.get(hero.classId);
    $('playingLabel').textContent=slot.label.toLocaleUpperCase('fr');
    $('playingPlayer').textContent=data.profile.pseudo;
    $('floorLabel').textContent=String(data.tower.floor);
    $('sideFloor').textContent=String(data.tower.floor);
    $('sideRecord').textContent=String(data.tower.record);
    const traps=TRAPS.normalize(data.tower.activeTraps,data.tower.floor);
    const status=$('activeTrapsLine');
    status.hidden=!traps.length;
    status.replaceChildren();
    for(const entry of traps){
      const t=TRAPS.TYPES[entry.type];
      const chip=mkEl('span','trap-status-chip',`${t.icon} ${t.description} · ${TRAPS.remaining(entry,data.tower.floor)} ét.`);
      chip.title=`${t.description}. Toutes les waifus. Fin à l’étage ${entry.expiresAtFloor}.`;
      status.append(chip);
    }
    $('heroCardName').textContent=heroName(hero);
    $('heroRank').textContent=hero.rank;
    if($('activePortrait').getAttribute('src')!==heroPortrait(hero))$('activePortrait').src=heroPortrait(hero);
    $('activePortrait').alt=`${heroName(hero)}, ${cls.name}, rang ${hero.rank}`;
    $('hpText').textContent=`${hero.hp} / ${hero.maxHp}`;
    $('hpFill').style.width=`${Math.max(0,Math.min(100,100*hero.hp/Math.max(1,hero.maxHp)))}%`;
    $('energyText').textContent=`${hero.energy} / 100`;
    $('energyFill').style.width=`${Math.max(0,Math.min(100,hero.energy))}%`;
    renderTower(slot);
    // V12 : ne plus reconstruire la totalité de la collection (et ses images)
    // à chaque tour ni à chaque seconde d'effet : rafraîchissement sur changement pertinent.
    const collectionSignature=`${slot.id}|${data.activeWaifuId}|${data.tower.event?.state||''}|${data.waifus.map(w=>
      `${w.id}:${w.rank}:${w.morph}:${w.nickname||''}:${w.injuredUntil}:${w.hp}/${w.maxHp}`).join('|')}`;
    if(STATE.lastCollectionSignature!==collectionSignature){
      renderOwnedGrid(slot);STATE.lastCollectionSignature=collectionSignature;
    }
    const bonusSignature=`${slot.id}|${data.bonuses.force}|${data.bonuses.rapidite}|${data.bonuses.constitution}`;
    if(STATE.lastBonusesSignature!==bonusSignature){
      renderBonuses(slot);STATE.lastBonusesSignature=bonusSignature;
    }
    openTab(STATE.activeTab);
    renderRelayPicker();
    showPendingReward();
    if(!$('waifuDetailOverlay').hidden && STATE.selectedHeroId){
      const detailed=data.waifus.find(w=>w.id===STATE.selectedHeroId);
      if(detailed)renderHeroDetail(slot,detailed);
    }
  }
  function openHeroDetail(heroId){
    const slot=STATE.slots.get(STATE.currentId);
    const hero=slot?.data.waifus.find(h=>h.id===heroId);if(!hero)return;
    STATE.selectedHeroId=heroId;
    STATE.selectedFoodType=slot.data.food.small>0?'small':slot.data.food.large>0?'large':'small';
    $('feedQuantity').value='1';
    STATE.returnFocus=document.activeElement;
    renderHeroDetail(slot,hero);
    $('waifuDetailOverlay').hidden=false;
    $('detailClose').focus();
  }
  function renderHeroDetail(slot,hero){
    const cls=classMap.get(hero.classId);
    $('detailTitle').textContent=`${cls.icon} ${heroName(hero)}`;
    $('detailMeta').textContent=`${cls.name} · Rang ${hero.rank} · ${morphName(hero.morph)}`;
    $('detailPortrait').src=heroPortrait(hero);
    $('detailPortrait').alt=`${heroName(hero)}, rang ${hero.rank}, ${morphName(hero.morph)}`;
    $('detailHealth').replaceChildren(makeHpBar(hero,'detail-life'));
    const breakdown=BONUSES.breakdown(hero.stats,slot.data.bonuses);
    const trapPenalties=TRAPS.penalties(slot.data.tower.activeTraps,slot.data.tower.floor);
    const effective=COMBAT.combatStats(hero,slot.data.bonuses,{},trapPenalties);
    const detailStats=[['force','detailForce','Force'],['rapidite','detailSpeed','Rapidité'],['constitution','detailConst','Constitution']];
    for(const [key,id,label] of detailStats){
      const stat=breakdown[key];
      $(id).textContent=String(effective[key]);
      const personalAfterTrap=Math.round(stat.personal*(1-trapPenalties[key]));
      $(id).parentElement.title=trapPenalties[key]
        ?`${label} : ${stat.personal} personnels, pièges −${Math.round(trapPenalties[key]*100)} % = ${personalAfterTrap} ; +${stat.bonus} de collection (intouchables) = ${effective[key]}`
        :`${label} : ${stat.personal} personnels + ${stat.bonus} de collection = ${stat.total}`;
    }
    const hasTraps=Object.values(trapPenalties).some(v=>v>0);
    $('detailTrapNote').hidden=!hasTraps;
    $('detailTrapNote').textContent=hasTraps?'☠️ Piège actif : statistiques temporairement réduites.':'';
    const anyGlobal=detailStats.some(([key])=>breakdown[key].bonus>0);
    $('detailAccountBonuses').hidden=!anyGlobal;
    const bonusIcons={force:'💪',rapidite:'⚡',constitution:'🛡️'};
    const activeBonuses=detailStats.filter(([key])=>breakdown[key].bonus>0)
      .map(([key])=>`${bonusIcons[key]} +${breakdown[key].bonus}`);
    $('detailAccountBonuses').textContent=anyGlobal?`🏆 Collection : ${activeBonuses.join(' · ')}`:'';
    $('detailSmallFood').textContent=`×${slot.data.food.small}`;
    $('detailLargeFood').textContent=`×${slot.data.food.large}`;
    for(const type of SHOP.TYPES){
      $('detailPotion'+type[0].toUpperCase()+type.slice(1)).textContent=`×${(slot.data.potions||SHOP.empty())[type]||0}`;
    }
    const inFight=slot.data.tower.event?.type==='combat' && slot.data.tower.event.state==='fighting';
    const pendingInjury=hero.injuredUntil>0;
    $('detailSelect').disabled=inFight || pendingInjury || hero.hp<=0 || hero.id===slot.data.activeWaifuId;
    $('detailSelect').textContent=inFight?'🔒 Combat en cours':pendingInjury?`🏥 ${injurySeconds(hero)} s de soins`:hero.hp<=0?'💀 KO — Hôpital':hero.id===slot.data.activeWaifuId?'✓ Déjà active':'✓ Sélectionner';
    $('detailDelete').disabled=slot.data.waifus.length<2 || ['fighting','awaiting_switch'].includes(slot.data.tower.event?.state) || (slot.data.tower.event?.state==='captured' && slot.data.tower.event.capturedWaifuId===hero.id) || STATE.actionBusy;
    $('detailDelete').title=slot.data.waifus.length<2?'Impossible de supprimer ta dernière waifu':$('detailDelete').disabled?'Indisponible pendant cet événement':'Supprimer définitivement cette waifu';
    const target=EVOLUTION.TARGETS[hero.rank];
    $('detailEvolutionText').textContent=target?`${hero.evolutionPoints} / ${target}`:'RANG MAXIMUM';
    $('detailEvolutionFill').style.width=target?`${Math.min(100,Math.round(hero.evolutionPoints/target*100))}%`:'100%';
    updateFeedingForm(slot,hero);
  }
  function updateFeedingForm(slot,hero){
    const food=slot.data.food, selected=STATE.selectedFoodType;
    const potionSelected=SHOP.TYPES.includes(selected);
    const atMax=hero.rank==='S';
    const activeCombat=SHOP.inCombat(slot.data);
    const inventory=slot.data.potions||SHOP.empty();
    for(const btn of document.querySelectorAll('.hero-detail-right [data-food-type],.hero-detail-right [data-potion-type]')){
      const type=btn.dataset.foodType||btn.dataset.potionType;
      const isFood=Object.hasOwn(food,type);
      const isSelected=type===selected;
      btn.classList.toggle('is-selected',isSelected);
      btn.setAttribute('aria-pressed',String(isSelected));
      btn.disabled=activeCombat || STATE.feedBusy || STATE.shopBusy || (isFood ? (atMax||!food[type]) : !inventory[type]);
    }
    $('feedQuantityLabel').hidden=potionSelected;
    $('feedQuantityControls').hidden=potionSelected;
    $('feedConfirm').textContent=potionSelected?'Utiliser':'🍽️ Nourrir';
    if(potionSelected){
      const item=SHOP.POTIONS[selected],count=inventory[selected]||0;
      const eligible=SHOP.eligible(slot.data,hero.id);
      $('feedConfirm').disabled=!count||!eligible||STATE.actionBusy||STATE.shopBusy||STATE.feedBusy;
      if(activeCombat){$('feedPreview').textContent='⚔️ Potions indisponibles pendant un combat.';return;}
      if(!count){$('feedPreview').textContent='Tu ne possèdes pas cette potion. Achète-en à la boutique (étage 1).';return;}
      if(hero.hp<=0){$('feedPreview').textContent='💀 Une potion ne réanime pas une waifu KO.';return;}
      if(hero.injuredUntil>0||slot.data.hospital?.slots?.some(b=>b.heroId===hero.id)){
        $('feedPreview').textContent='🏥 Cette waifu est hospitalisée.';return;
      }
      if(hero.hp>=hero.maxHp){$('feedPreview').textContent='❤️ PV déjà au maximum.';return;}
      const amount=Math.min(hero.maxHp-hero.hp,Math.max(1,Math.round(hero.maxHp*item.percent/100)));
      $('feedPreview').textContent=`${item.name} · +${amount} PV (${hero.hp} → ${hero.hp+amount}/${hero.maxHp}) · 1 potion utilisée`;
      return;
    }
    const quantity=$('feedQuantity');
    const available=food[selected]||0;
    quantity.max=String(Math.max(1,available));
    // Ne pas effacer brutalement une saisie incomplète avant sa validation.
    const raw=Number(quantity.value);
    const number=Number.isSafeInteger(raw)&&raw>0?raw:0;
    const controlsDisabled=atMax||activeCombat||available===0||STATE.feedBusy||STATE.shopBusy;
    quantity.disabled=controlsDisabled;
    $('feedMinus').disabled=controlsDisabled||number<=1;
    $('feedPlus').disabled=controlsDisabled||number>=available;
    $('feedMax').disabled=controlsDisabled||number>=available;
    $('feedConfirm').disabled=controlsDisabled||number<1||number>available;
    if(atMax){$('feedPreview').textContent='⭐ Rang S atteint : évolution terminée.';return;}
    if(activeCombat){$('feedPreview').textContent='⚔️ Nourrissage indisponible pendant un combat.';return;}
    if(!available){$('feedPreview').textContent='Aucun aliment de ce type disponible.';return;}
    if(number<1||number>available){$('feedPreview').textContent='Entre une quantité disponible.';return;}
    const plan=EVOLUTION.planFeed(hero,food,selected,number);
    const next=plan.evolves?` → Rang ${plan.rankAfter}${plan.remaining?' (+'+plan.remaining+' pts reportés)':''}`:'';
    $('feedPreview').textContent=`${plan.consumed} utilisé${plan.consumed>1?'s':''} · ${plan.returned} rendu${plan.returned>1?'s':''} · +${plan.earned} pts${next}`;
  }
  function refreshFeedForm(){
    const slot=STATE.slots.get(STATE.currentId);
    const hero=slot?.data.waifus.find(w=>w.id===STATE.selectedHeroId);
    if(hero && !$('waifuDetailOverlay').hidden)updateFeedingForm(slot,hero);
  }
  function chooseFood(type){
    if(!['small','large',...SHOP.TYPES].includes(type))return;
    STATE.selectedFoodType=type;
    $('feedQuantity').value='1';
    refreshFeedForm();
  }
  function changeFeedQuantity(delta){
    const current=Number($('feedQuantity').value);
    $('feedQuantity').value=String(Math.max(1,(Number.isSafeInteger(current)?current:1)+delta));
    refreshFeedForm();
  }
  function chooseMaxFood(){
    const slot=STATE.slots.get(STATE.currentId);
    const hero=slot?.data.waifus.find(w=>w.id===STATE.selectedHeroId);
    if(!slot || !hero || hero.rank==='S' || SHOP.TYPES.includes(STATE.selectedFoodType) || STATE.feedBusy || STATE.actionBusy ||
      ['fighting','awaiting_switch'].includes(slot.data.tower.event?.state))return;
    const available=slot.data.food[STATE.selectedFoodType]||0;
    if(!available)return;
    $('feedQuantity').value=String(available);
    refreshFeedForm();
  }
  function closeMorphChooser(){
    $('morphOverlay').hidden=true;
    STATE.pendingFeed=null;
  }
  async function requestFeed(){
    const slot=STATE.slots.get(STATE.currentId);
    const hero=slot?.data.waifus.find(w=>w.id===STATE.selectedHeroId);
    if(!slot||!hero||STATE.feedBusy||STATE.shopBusy||STATE.actionBusy||!$('morphOverlay').hidden)return;
    if(['fighting','awaiting_switch'].includes(slot.data.tower.event?.state)){
      showToast('Impossible de nourrir pendant un combat.');return;
    }
    const type=STATE.selectedFoodType,quantity=Number($('feedQuantity').value);
    if(SHOP.TYPES.includes(type)){await usePotion(type,hero.id);return;}
    let plan;
    try{plan=EVOLUTION.planFeed(hero,slot.data.food,type,quantity);}
    catch(err){showToast('⚠ '+err.message);refreshFeedForm();return;}
    if(plan.morphRequired){
      STATE.pendingFeed={slotId:slot.id,heroId:hero.id,type,quantity};
      for(const morph of ['musclee','obese','chetive']){
        $('morph'+morph[0].toUpperCase()+morph.slice(1)+'Image').src=`assets/characters/${hero.classId}/${morph}/D.png`;
      }
      $('morphOverlay').hidden=false;
      $('morphCancel').focus();
      return;
    }
    await commitFeed({slotId:slot.id,heroId:hero.id,type,quantity});
  }
  async function commitFeed(request,morph=null){
    if(!request||STATE.feedBusy||STATE.actionBusy)return;
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot||slot.id!==request.slotId)return;
    const hero=slot.data.waifus.find(w=>w.id===request.heroId);
    if(!hero||['fighting','awaiting_switch'].includes(slot.data.tower.event?.state))return;
    STATE.feedBusy=true;
    try{
      const updated=clone(slot);
      const index=updated.data.waifus.findIndex(w=>w.id===request.heroId);
      const classes=Object.fromEntries(HERO_CLASSES.map(c=>[c.id,c]));
      const result=EVOLUTION.applyFeed(updated.data.waifus[index],updated.data.food,request.type,request.quantity,morph,classes);
      updated.data.waifus[index]=result.hero;
      updated.data.food=result.food;
      updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
      await saveSlot(updated);
      closeMorphChooser();
      $('feedQuantity').value='1';
      if(updated.data.food[STATE.selectedFoodType]===0 && updated.data.food[request.type==='small'?'large':'small']>0)
        STATE.selectedFoodType=request.type==='small'?'large':'small';
      renderGame();
      const {plan}=result;
      AUDIO.playEffect(plan.evolves?'evolution':'feed');
      const foodName=request.type==='small'?'steak':'gigot';
      const taken=plan.consumed?`${plan.consumed} ${foodName}${plan.consumed>1?'s':''} utilisé${plan.consumed>1?'s':''}`:'Aucun aliment nécessaire';
      const returned=plan.returned?` · ${plan.returned} rendu${plan.returned>1?'s':''}`:'';
      showToast(plan.evolves?`✨ Rang ${plan.rankAfter} ! ${taken}${returned}${plan.remaining?' · +'+plan.remaining+' pts reportés':''}`:`🍽️ +${plan.earned} pts ! ${taken}${returned}`);
    }catch(err){console.error('Nourrissage :',err);showToast('⚠ Nourrissage impossible : '+err.message);}
    finally{STATE.feedBusy=false;refreshFeedForm();}
  }
  async function chooseMorph(morph){
    const request=STATE.pendingFeed;
    if(!request || !Object.hasOwn(EVOLUTION.MORPH_BONUSES,morph))return;
    await commitFeed(request,morph);
  }
  function closeHeroDetail(restoreFocus=true){
    closeMorphChooser();
    closeRenameHero();
    $('waifuDetailOverlay').hidden=true;
    STATE.selectedHeroId=null;
    if(restoreFocus && STATE.returnFocus?.isConnected)STATE.returnFocus.focus();
  }
  function viewLargeHero(){
    if($('waifuDetailOverlay').hidden)return;
    const img=$('detailPortrait');
    $('largePortrait').src=img.src;
    $('largePortrait').alt=img.alt;
    $('portraitOverlay').hidden=false;
    $('portraitClose').focus();
  }
  function closeLargeHero(){
    $('portraitOverlay').hidden=true;
    $('largePortrait').removeAttribute('src');
    if(!$('waifuDetailOverlay').hidden)$('detailView').focus();
  }
  async function selectHero(){
    const slot=STATE.slots.get(STATE.currentId);
    if(!slot||!slot.data.waifus.some(h=>h.id===STATE.selectedHeroId))return;
    const chosen=STATE.selectedHeroId;
    if(chosen===slot.data.activeWaifuId)return;
    if(!heroAvailable(slot.data.waifus.find(h=>h.id===chosen),slot.data.tower)){
      showToast('Cette waifu est blessée ou KO.');return;
    }
    if(slot.data.tower.event?.type==='combat' && slot.data.tower.event.state==='fighting'){
      showToast('Impossible de changer de waifu pendant un combat : relais uniquement après KO.');return;
    }
    const updated=clone(slot);
    updated.data.activeWaifuId=chosen;
    updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
    try{await saveSlot(updated);closeHeroDetail();renderGame();showToast('Combattante sélectionnée !');}
    catch(e){console.error(e);showToast('⚠ Sélection impossible : sauvegarde indisponible.');}
  }
  function openRenameHero(){
    const slot=STATE.slots.get(STATE.currentId);
    const hero=slot?.data.waifus.find(h=>h.id===STATE.selectedHeroId);
    if(!hero || STATE.actionBusy || STATE.feedBusy || ['fighting','awaiting_switch'].includes(slot.data.tower.event?.state)){
      showToast('Renommage indisponible pendant un combat.');return;
    }
    $('renameHeroInput').value=heroName(hero);
    $('renameHeroOverlay').hidden=false;
    $('renameHeroInput').focus();$('renameHeroInput').select();
  }
  function closeRenameHero(){
    if($('renameHeroOverlay').hidden)return;
    $('renameHeroOverlay').hidden=true;
    if(!$('waifuDetailOverlay').hidden)$('detailRename').focus();
  }
  async function commitRenameHero(event){
    event.preventDefault();
    const slot=STATE.slots.get(STATE.currentId);
    const chosen=STATE.selectedHeroId;
    const hero=slot?.data.waifus.find(h=>h.id===chosen);
    if(!hero || STATE.actionBusy || STATE.feedBusy || ['fighting','awaiting_switch'].includes(slot.data.tower.event?.state))return;
    const nickname=safeText($('renameHeroInput').value);
    if(!nickname || nickname.length>24){showToast('⚠ Choisis un nom de 1 à 24 caractères.');return;}
    const updated=clone(slot);
    updated.data.waifus.find(h=>h.id===chosen).nickname=nickname;
    updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
    $('renameHeroSave').disabled=true;
    try{
      await saveSlot(updated);
      closeRenameHero();renderGame();showToast(`✏️ Waifu renommée : ${nickname}`);
    }catch(err){console.error('Renommage :',err);showToast('⚠ Renommage non enregistré : '+err.message);}
    finally{$('renameHeroSave').disabled=false;}
  }
  function requestDeleteHero(){
    const slot=STATE.slots.get(STATE.currentId);
    const chosen=STATE.selectedHeroId;
    const hero=slot?.data.waifus.find(h=>h.id===chosen);
    if(!hero || STATE.actionBusy || STATE.feedBusy)return;
    const ev=slot.data.tower.event;
    if(slot.data.waifus.length===1){showToast('Impossible de supprimer ta dernière waifu.');return;}
    if(['fighting','awaiting_switch'].includes(ev?.state)){
      showToast('Impossible de supprimer une waifu pendant un combat.');return;
    }
    if(ev?.state==='captured' && ev.capturedWaifuId===chosen){
      showToast('Confirme d’abord la capture avant de supprimer cette waifu.');return;
    }
    openConfirm('Supprimer cette waifu ?',`« ${heroName(hero)} » (rang ${hero.rank}) sera définitivement supprimée de ta collection. Cette action est irréversible.`,async()=>{
      const live=STATE.slots.get(STATE.currentId);
      if(!live || live.id!==slot.id || live.data.waifus.length<2 || !live.data.waifus.some(h=>h.id===chosen))return;
      if(['fighting','awaiting_switch'].includes(live.data.tower.event?.state))return;
      const updated=clone(live);
      HOSPITAL.remove(updated.data,chosen);
      updated.data.waifus=updated.data.waifus.filter(h=>h.id!==chosen);
      // Si la combattante active est supprimée, on désigne une survivante
      // disponible, de rang le plus élevé. Aucune waifu n'est inventée.
      if(updated.data.activeWaifuId===chosen){
        const sorted=rankedHeroes(updated.data.waifus);
        updated.data.activeWaifuId=(sorted.find(h=>heroAvailable(h,updated.data.tower))||sorted[0]).id;
      }
      updated.updatedAt=nowISO();updated.data.lastSavedAt=updated.updatedAt;
      try{
        await saveSlot(updated);
        closeHeroDetail(false);renderGame();showToast('🗑️ Waifu supprimée de la collection.');
      }catch(err){console.error('Suppression de waifu :',err);showToast('⚠ Suppression impossible : '+err.message);}
    });
    $('confirmAccept').textContent='Supprimer la waifu';
  }
  function loadGame(id){
    if(!STATE.slots.has(id)){showToast('Partie introuvable.');renderSaveList();return;}
    // Au rechargement / retour au jeu, aucune seconde passée hors écran
    // ne doit être décomptée par une ancienne échéance de malus chronométré.
    const slot=STATE.slots.get(id);
    for(const side of ['player','enemy'])for(const effect of ['siphon','curse']){
      const timed=slot.data.tower.combat?.effects?.[side]?.[effect];
      if(timed)timed.nextTickAt=0;
    }
    STATE.turnClock=null;
    closeMorphChooser();
    if(!$('waifuDetailOverlay').hidden)closeHeroDetail(false);
    STATE.currentId=id;STATE.activeTab='tour';STATE.selectedShopHeroId=null;showScreen('play');renderGame();
    // Reprise d’une ancienne sauvegarde avec coffre encore fermé : même enchaînement automatique.
    if(slot.data.tower.event?.state==='pending' && ['chest','trap'].includes(slot.data.tower.event.type))announceChestThenOpen();
    refreshRecoveredHeroes().catch(e=>console.error('Récupération à l’ouverture :',e));
    showToast('Partie chargée !');
  }
  async function manualSave(){
    const slot=STATE.slots.get(STATE.currentId);if(!slot)return;
    const copy=clone(slot);copy.updatedAt=nowISO();copy.data.lastSavedAt=copy.updatedAt;
    try{await saveSlot(copy);renderGame();showToast('Sauvegarde effectuée !');}
    catch(e){console.error(e);showToast(e.message===SAVE_CONFLICT?'⚠ Modifiée dans un autre onglet : actualise le jeu.':'⚠ Sauvegarde impossible.');}
  }
  function downloadJSON(value,filename){
    const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=mkEl('a');link.href=url;link.download=filename;
    document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  function exportSlot(id){
    const slot=STATE.slots.get(id);if(!slot)return;
    downloadJSON(slot,`BELLYMON_partie_${slot.id.slice(0,8)}.json`);
    showToast('Sauvegarde JSON exportée.');
  }
  function exportAllSlots(){
    const slots=listSlots();if(!slots.length){showToast('Aucune partie à exporter.');return;}
    const archive={format:ARCHIVE_FORMAT,version:1,exportedAt:nowISO(),slots:slots.map(clone)};
    downloadJSON(archive,`BELLYMON_TOUTES_PARTIES_${new Date().toISOString().slice(0,10)}.json`);
    showToast(`💾 ${slots.length} partie${slots.length>1?'s':''} exportée${slots.length>1?'s':''} !`);
  }
  function openConfirm(title,message,action){
    $('confirmTitle').textContent=title;$('confirmMessage').textContent=message;
    STATE.confirmAction=action;$('confirmAccept').textContent='Confirmer';$('confirmOverlay').hidden=false;$('confirmCancel').focus();
  }
  function closeConfirm(){STATE.confirmAction=null;$('confirmOverlay').hidden=true;}
  function confirmDelete(id){
    const slot=STATE.slots.get(id);if(!slot)return;
    openConfirm('Supprimer cette partie ?',`« ${slot.label} » sera définitivement supprimée de ce jeu. Cette action est irréversible. Pense à l’exporter si tu veux la conserver.`,async()=>{
      try{await removeSlot(id);if(STATE.currentId===id)STATE.currentId=null;renderSaveList();showToast('Partie supprimée.');}
      catch(e){console.error(e);showToast('⚠ Suppression impossible.');}
    });
  }
  async function importJSON(json){
    if(typeof json!=='string'||json.length>40_000_000)throw Error('Fichier trop volumineux (40 Mo maximum).');
    let source;try{source=JSON.parse(json);}catch(_){throw Error('JSON illisible.');}
    let originals;
    if(source?.format===ARCHIVE_FORMAT){
      if(source.version!==1 || !Array.isArray(source.slots) || !source.slots.length || source.slots.length>1000)
        throw Error('Archive BELLYMON invalide.');
      originals=source.slots;
    }else originals=[source];
    // Tous les éléments sont contrôlés AVANT la première importation.
    if(!originals.every(validSlot))throw Error('Sauvegarde incompatible ou endommagée : aucune partie importée.');
    if(!STATE.storage)throw Error('Stockage indisponible.');
    const timestamp=nowISO();
    const imported=originals.map(original=>{
      const slot=clone(original);slot.id=makeId();slot.saveRevision=0;HOSPITAL.ensure(slot.data);HOSPITAL.complete(slot.data);SHOP.ensure(slot.data);
      slot.createdAt=timestamp;slot.updatedAt=timestamp;slot.data.lastSavedAt=timestamp;
      slot.label=(safeText(original.label).slice(0,27)+' (import)').slice(0,36);
      return slot;
    });
    const added=[];
    try{
      for(const slot of imported){await saveSlot(slot);added.push(slot.id);}
    }catch(error){
      // Ne pas laisser une importation à moitié terminée si le quota est atteint.
      for(const id of added.reverse()){
        try{await removeSlot(id);}catch(rollbackError){console.error('Annulation d’import impossible :',rollbackError);}
      }
      renderSaveList();throw Error(`Import interrompu : ${error.message}. Vérifie tes parties avant de réessayer.`);
    }
    renderSaveList();
    showToast(`💾 ${imported.length} partie${imported.length>1?'s':''} importée${imported.length>1?'s':''} sans écrasement !`);
  }
  function wireEvents(){
    // Un toucher mobile n'autorise souvent le son qu'à la remontée du doigt.
    // On garde ces reprises légères : si un navigateur refuse la première lecture,
    // la suivante peut démarrer la musique du menu sans recharger la page.
    const unlockOnGesture=()=>AUDIO.unlock();
    document.addEventListener('pointerup',unlockOnGesture,true);
    document.addEventListener('keydown',unlockOnGesture,true);
    document.addEventListener('click',unlockOnGesture,true);
    $('openGuideBtn').addEventListener('click',openGuide);
    $('guideBackBtn').addEventListener('click',closeGuide);
    document.querySelectorAll('[data-guide-tab]').forEach(button=>button.addEventListener('click',()=>window.BellymonGuide.show(button.dataset.guideTab)));
    $('audioSettingsBtn').addEventListener('click',openAudioSettings);
    $('audioClose').addEventListener('click',closeAudioSettings);
    $('audioDoneBtn').addEventListener('click',closeAudioSettings);
    $('audioOverlay').addEventListener('click',e=>{if(e.target===$('audioOverlay'))closeAudioSettings();});
    $('audioPreviewBtn').addEventListener('click',()=>{AUDIO.unlock();AUDIO.playEffect('evolution');});
    for(const [input,key] of [['musicEnabled','music'],['sfxEnabled','sfx'],['musicVolume','musicVolume'],['sfxVolume','sfxVolume']]){
      $(input).addEventListener(input.endsWith('Enabled')?'change':'input',e=>{
        AUDIO.update({[key]:input.endsWith('Enabled')?e.target.checked:Number(e.target.value)});
        paintAudioSettings();
        if(input==='sfxEnabled' && e.target.checked)AUDIO.playEffect('ui');
      });
    }
    document.querySelectorAll('[data-game-tab]').forEach(tab=>tab.addEventListener('click',()=>openTab(tab.dataset.gameTab)));
    const tabNames=['tour','waifus','bonus','boutique','hopital'];
    document.querySelector('.arena-tabs').addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      const index=tabNames.indexOf(STATE.activeTab);
      const next=e.key==='Home'?0:e.key==='End'?tabNames.length-1:
        (index+(e.key==='ArrowRight'?1:tabNames.length-1))%tabNames.length;
      openTab(tabNames[next]);$('tab'+tabNames[next][0].toUpperCase()+tabNames[next].slice(1)).focus();e.preventDefault();
    });
    $('advanceBtn').addEventListener('click',advanceInTower);
    $('shortcutReducedBtn').addEventListener('click',()=>requestPaidResume('reduced'));
    $('shortcutRecordBtn').addEventListener('click',()=>requestPaidResume('record'));
    $('shopOffers').addEventListener('click',event=>{
      const button=event.target.closest('[data-shop-buy]');
      if(button)void purchasePotion(button.dataset.shopBuy,button.dataset.foodType);
    });
    $('shopReturn').addEventListener('click',requestQuitTower);
    $('hospitalPatients').addEventListener('click',event=>{
      const id=event.target.closest('[data-hospital-admit]')?.dataset.hospitalAdmit;
      if(id)void admitHospital(id);
    });
    $('hospitalReturn').addEventListener('click',requestQuitTower);
    $('chooseFighterBtn').addEventListener('click',openFighterPicker);
    $('fighterClose').addEventListener('click',closeFighterPicker);
    $('fighterOverlay').addEventListener('click',e=>{if(e.target===$('fighterOverlay'))closeFighterPicker();});
    $('openChestBtn').addEventListener('click',openChest);
    $('startCombatBtn').addEventListener('click',startCombat);
    $('combatAutoButton').addEventListener('click',toggleAutoCombat);
    $('towerAutoButton').addEventListener('click',toggleAutoCombat);
    $('statusDetailsBtn').addEventListener('click',openEffectsDetails);
    $('effectsClose').addEventListener('click',closeEffectsDetails);
    $('effectsOverlay').addEventListener('click',e=>{if(e.target===$('effectsOverlay'))closeEffectsDetails();});
    document.querySelectorAll('[data-combat-action]').forEach(btn=>
      btn.addEventListener('click',()=>btn.dataset.combatAction==='capture'
        ?takeCaptureAction():takeCombatAction(btn.dataset.combatAction)));
    $('continueBtn').addEventListener('click',finishCurrentEvent);
    $('quitTowerBtn').addEventListener('click',requestQuitTower);
    $('relayQuitBtn').addEventListener('click',requestQuitTower);
    $('eventAnnouncement').addEventListener('click',closeAnnouncement);
    $('eventAnnouncement').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();closeAnnouncement();}});
    $('eventResultClose').addEventListener('click',closeEventResult);
    $('eventResultOverlay').addEventListener('click',e=>{if(e.target===$('eventResultOverlay'))closeEventResult();});
    $('detailClose').addEventListener('click',()=>closeHeroDetail());
    $('waifuDetailOverlay').addEventListener('click',e=>{if(e.target===$('waifuDetailOverlay'))closeHeroDetail();});
    $('detailView').addEventListener('click',viewLargeHero);
    $('detailSelect').addEventListener('click',selectHero);
    $('detailRename').addEventListener('click',openRenameHero);
    $('detailDelete').addEventListener('click',requestDeleteHero);
    $('renameHeroForm').addEventListener('submit',commitRenameHero);
    $('renameHeroCancel').addEventListener('click',closeRenameHero);
    $('renameHeroOverlay').addEventListener('click',e=>{if(e.target===$('renameHeroOverlay'))closeRenameHero();});
    document.querySelectorAll('.hero-detail-right [data-food-type],.hero-detail-right [data-potion-type]').forEach(btn=>btn.addEventListener('click',()=>chooseFood(btn.dataset.foodType||btn.dataset.potionType)));
    $('feedQuantity').addEventListener('input',refreshFeedForm);
    $('feedQuantity').addEventListener('change',refreshFeedForm);
    $('feedMinus').addEventListener('click',()=>changeFeedQuantity(-1));
    $('feedPlus').addEventListener('click',()=>changeFeedQuantity(1));
    $('feedMax').addEventListener('click',chooseMaxFood);
    $('feedConfirm').addEventListener('click',requestFeed);
    document.querySelectorAll('[data-choose-morph]').forEach(btn=>btn.addEventListener('click',()=>chooseMorph(btn.dataset.chooseMorph)));
    $('morphCancel').addEventListener('click',closeMorphChooser);
    $('morphClose').addEventListener('click',closeMorphChooser);
    $('morphOverlay').addEventListener('click',e=>{if(e.target===$('morphOverlay'))closeMorphChooser();});
    $('portraitClose').addEventListener('click',closeLargeHero);
    $('portraitOverlay').addEventListener('click',e=>{if(e.target===$('portraitOverlay'))closeLargeHero();});
    $('newGameBtn').addEventListener('click',openCreate);
    $('createBack').addEventListener('click',()=>showScreen('menu'));
    $('createForm').addEventListener('submit',handleCreate);
    $('menuBtn').addEventListener('click',()=>showScreen('menu'));
    $('manualSaveBtn').addEventListener('click',manualSave);
    $('exportAllBtn').addEventListener('click',exportAllSlots);
    $('importFileBtn').addEventListener('click',()=>$('importFile').click());
    $('importFile').addEventListener('change',async event=>{
      const file=event.target.files?.[0];if(!file)return;
      try{if(file.size>40_000_000)throw Error('Fichier trop volumineux (40 Mo maximum).');await importJSON(await file.text());}
      catch(e){showToast('⚠ '+e.message);}finally{event.target.value='';}
    });
    $('pasteBtn').addEventListener('click',()=>{$('pastePanel').hidden=!$('pastePanel').hidden;if(!$('pastePanel').hidden)$('pasteInput').focus();});
    $('pasteCancel').addEventListener('click',()=>{$('pastePanel').hidden=true;$('pasteInput').value='';});
    $('pasteConfirm').addEventListener('click',async()=>{
      try{await importJSON($('pasteInput').value);$('pasteInput').value='';$('pastePanel').hidden=true;}
      catch(e){showToast('⚠ '+e.message);}
    });
    $('confirmCancel').addEventListener('click',closeConfirm);
    $('confirmAccept').addEventListener('click',async()=>{const action=STATE.confirmAction;closeConfirm();if(action)await action();});
    $('confirmOverlay').addEventListener('click',e=>{if(e.target===$('confirmOverlay'))closeConfirm();});
    window.addEventListener('storage',e=>{
      if(e.key&&(e.key.startsWith(LOCAL_PREFIX)||e.key===TOMBSTONE_KEY))
        showWarning('Une autre fenêtre BELLYMON a modifié les sauvegardes. Actualise cette page avant de continuer pour éviter un conflit.');
    });
    document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;
      if(!$('eventAnnouncement').hidden)closeAnnouncement();
      else if(!$('eventResultOverlay').hidden)closeEventResult();
      else if(!$('morphOverlay').hidden)closeMorphChooser();
      else if(!$('portraitOverlay').hidden)closeLargeHero();
      else if(!$('effectsOverlay').hidden)closeEffectsDetails();
      else if(!$('fighterOverlay').hidden)closeFighterPicker();
      else if(!$('confirmOverlay').hidden)closeConfirm();
      else if(!$('renameHeroOverlay').hidden)closeRenameHero();
      else if(!$('audioOverlay').hidden)closeAudioSettings();
      else if(!$('waifuDetailOverlay').hidden)closeHeroDetail();
      else if(STATE.screen==='guide')closeGuide();
    });
  }
  async function initialize(){
    paintAudioSettings();
    window.BellymonGuide.init({classes:HERO_CLASSES,morphBonuses:MORPH_BONUSES});
    wireEvents();AUDIO.start();await initializeStorage();renderSaveList();showScreen('menu');
    STATE.liveTicker=setInterval(()=>{
      liveCombatTick().catch(e=>console.error('Chrono combat :',e));
      liveAutoTowerTick().catch(e=>console.error('Ascension AUTO :',e));
    },200);
    STATE.healTicker=setInterval(()=>refreshRecoveredHeroes().catch(e=>console.error('Convalescence :',e)),1000);
    await refreshRecoveredHeroes();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
})();
