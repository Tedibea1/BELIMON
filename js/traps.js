/* BELLYMON V9 — Coffres piégés : effets temporaires de deux étages.
   Les malus touchent uniquement les statistiques PERSONNELLES ; les bonus
   permanents du compte ne sont jamais réduits par un piège.
   Une occurrence du même type rafraîchit son échéance sans s'empiler.
*/
(() => {
  'use strict';
  const TYPES=Object.freeze({
    force:Object.freeze({id:'force',icon:'💪',label:'Force',description:'Force −20 %',penalty:{force:0.20,rapidite:0,constitution:0}}),
    rapidite:Object.freeze({id:'rapidite',icon:'⚡',label:'Rapidité',description:'Rapidité −20 %',penalty:{force:0,rapidite:0.20,constitution:0}}),
    constitution:Object.freeze({id:'constitution',icon:'🛡️',label:'Constitution',description:'Constitution −20 %',penalty:{force:0,rapidite:0,constitution:0.20}}),
    all:Object.freeze({id:'all',icon:'☠️',label:'Malédiction',description:'Toutes les stats −10 %',penalty:{force:0.10,rapidite:0.10,constitution:0.10}})
  });
  const KEYS=Object.freeze(['force','rapidite','constitution','all']);
  const EMPTY=()=>({force:0,rapidite:0,constitution:0});
  const validFloor=f=>Number.isSafeInteger(f)&&f>=1;
  function isEntry(e){return !!e && typeof e==='object' && !Array.isArray(e) && KEYS.includes(e.type) && validFloor(e.expiresAtFloor);}
  function normalize(entries,floor){
    if(!Array.isArray(entries) || !validFloor(floor))return [];
    const result=new Map();
    for(const e of entries){
      if(!isEntry(e) || e.expiresAtFloor<=floor)continue;
      const old=result.get(e.type);
      if(!old || e.expiresAtFloor>old.expiresAtFloor)result.set(e.type,{type:e.type,expiresAtFloor:e.expiresAtFloor});
    }
    return [...result.values()].sort((a,b)=>KEYS.indexOf(a.type)-KEYS.indexOf(b.type));
  }
  function select(rng=Math.random){
    const raw=rng();
    const index=Math.min(3,Math.max(0,Math.floor((Number.isFinite(raw)?raw:0)*4)));
    return KEYS[index];
  }
  function apply(tower,type){
    if(!tower || !validFloor(tower.floor) || !Object.hasOwn(TYPES,type))throw Error('Piège invalide');
    const old=normalize(tower.activeTraps,tower.floor);
    const expiry=tower.floor+2;
    if(!Number.isSafeInteger(expiry))throw Error('Étage trop élevé');
    const previous=old.find(e=>e.type===type);
    const kept=old.filter(e=>e.type!==type);
    tower.activeTraps=normalize([...kept,{type,expiresAtFloor:Math.max(expiry,previous?.expiresAtFloor||0)}],tower.floor);
    return tower.activeTraps;
  }
  function advance(tower){
    if(!tower || !validFloor(tower.floor))throw Error('Étage invalide');
    tower.activeTraps=normalize(tower.activeTraps,tower.floor);
    return tower.activeTraps;
  }
  function penalties(entries,floor){
    const total=EMPTY();
    for(const trap of normalize(entries,floor)){
      const p=TYPES[trap.type].penalty;
      for(const key of ['force','rapidite','constitution'])total[key]+=p[key];
    }
    for(const key of ['force','rapidite','constitution'])total[key]=Math.min(1,total[key]);
    return total;
  }
  function remaining(trap,floor){return validFloor(floor)&&isEntry(trap)?Math.max(0,trap.expiresAtFloor-floor):0;}
  window.BellymonTraps=Object.freeze({TYPES,KEYS,isEntry,normalize,select,apply,advance,penalties,remaining});
})();
