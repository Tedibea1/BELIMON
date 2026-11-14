/* BELLYMON V12.0.18 — Hôpital : 3 places, soin réel de 18 s et blessures persistantes. */
(()=>{
  'use strict';
  const CAPACITY=3,HEAL_MS=18000;
  function ensure(data,now=Date.now()){
    if(!data.hospital || !Array.isArray(data.hospital.slots)){
      // Conversion douce des anciennes convalescences : 3 premières places reprises.
      // Les autres blessées conservent leurs blessures pour les soins manuels.
      const old=data.waifus.filter(h=>Number(h.injuredUntil)>0);
      data.hospital={slots:old.slice(0,CAPACITY).filter(h=>h.hp<h.maxHp).map(h=>({heroId:h.id,readyAt:h.injuredUntil}))};
      for(const h of data.waifus){if(!data.hospital.slots.some(s=>s.heroId===h.id))h.injuredUntil=0;}
    }
    return data.hospital;
  }
  function complete(data,now=Date.now()){
    const slots=ensure(data,now).slots;
    let healed=0;
    for(const bed of slots){
      if(bed.readyAt<=now){
        const h=data.waifus.find(x=>x.id===bed.heroId);
        if(h){h.hp=h.maxHp;h.energy=100;h.injuredUntil=0;healed++;}
      }
    }
    data.hospital.slots=slots.filter(b=>b.readyAt>now && data.waifus.some(h=>h.id===b.heroId));
    return healed;
  }
  function start(data,heroId,now=Date.now()){
    complete(data,now);
    if(data.tower.floor!==1)throw Error('Retourne à l’étage 1 pour accéder à l’hôpital.');
    if(['fighting','awaiting_switch'].includes(data.tower.event?.state))throw Error('Soins indisponibles pendant un combat.');
    const h=data.waifus.find(x=>x.id===heroId);
    if(!h)throw Error('Waifu introuvable.');
    if(h.hp>=h.maxHp)throw Error('Cette waifu possède déjà tous ses PV.');
    if(data.hospital.slots.some(x=>x.heroId===heroId))throw Error('Cette waifu est déjà hospitalisée.');
    if(data.hospital.slots.length>=CAPACITY)throw Error('Les trois lits sont occupés.');
    const readyAt=now+HEAL_MS;
    data.hospital.slots.push({heroId,readyAt});h.injuredUntil=readyAt;
    return readyAt;
  }
  function remove(data,heroId){
    ensure(data);
    data.hospital.slots=data.hospital.slots.filter(b=>b.heroId!==heroId);
  }
  window.BellymonHospital=Object.freeze({CAPACITY,HEAL_MS,ensure,complete,start,remove});
})();
