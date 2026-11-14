/* BELLYMON V14.3 — Boutique de potions : tarifs dégressifs. */
(()=>{
  'use strict';
  const POTIONS=Object.freeze({
    petite:Object.freeze({id:'petite',icon:'🧪',name:'Petite potion',percent:30,small:9,large:3}),
    grande:Object.freeze({id:'grande',icon:'🧴',name:'Grande potion',percent:60,small:15,large:5}),
    supreme:Object.freeze({id:'supreme',icon:'💎',name:'Potion suprême',percent:90,small:21,large:7})
  });
  const TYPES=Object.freeze(Object.keys(POTIONS));
  const isCount=v=>Number.isSafeInteger(v)&&v>=0;
  const empty=()=>({petite:0,grande:0,supreme:0});
  function validInventory(inv){
    return !!inv && typeof inv==='object' && !Array.isArray(inv) && TYPES.every(k=>isCount(inv[k]));
  }
  function ensure(data){
    if(data.potions===undefined)data.potions=empty();
    if(!validInventory(data.potions))throw Error('Inventaire de potions invalide.');
    return data.potions;
  }
  function potion(type){
    if(!Object.hasOwn(POTIONS,type))throw Error('Potion inconnue.');
    return POTIONS[type];
  }
  function inCombat(data){return ['fighting','awaiting_switch'].includes(data?.tower?.event?.state);}
  function buy(data,type,foodType){
    const item=potion(type);
    if(!['small','large'].includes(foodType))throw Error('Choisis des steaks ou des gigots.');
    if(data?.tower?.floor!==1)throw Error('La boutique vend ses potions uniquement à l’étage 1.');
    if(inCombat(data))throw Error('Achats indisponibles pendant un combat.');
    const inventory=ensure(data),price=item[foodType];
    if(!data.food || !isCount(data.food[foodType]) || data.food[foodType]<price)
      throw Error('Tu ne possèdes pas assez de nourriture.');
    if(inventory[type]>=Number.MAX_SAFE_INTEGER)throw Error('Inventaire plein.');
    data.food[foodType]-=price;
    inventory[type]+=1;
    return {item,foodType,price,owned:inventory[type]};
  }
  function eligible(data,heroId){
    if(inCombat(data))return false;
    const hero=data?.waifus?.find(h=>h.id===heroId);
    return !!hero && isCount(hero.hp) && Number.isSafeInteger(hero.maxHp) && hero.maxHp>0 &&
      hero.hp>0 && hero.hp<hero.maxHp && !(hero.injuredUntil>0) &&
      !data.hospital?.slots?.some(b=>b.heroId===hero.id);
  }
  function use(data,type,heroId){
    const item=potion(type),inventory=ensure(data);
    if(inCombat(data))throw Error('Potions indisponibles pendant un combat.');
    if(!inventory[type])throw Error('Tu ne possèdes pas cette potion.');
    if(!eligible(data,heroId))throw Error('Choisis une waifu blessée, consciente et non hospitalisée.');
    const hero=data.waifus.find(h=>h.id===heroId);
    const before=hero.hp;
    const amount=Math.max(1,Math.round(hero.maxHp*item.percent/100));
    hero.hp=Math.min(hero.maxHp,hero.hp+amount);
    inventory[type]-=1;
    return {item,heroId,healed:hero.hp-before,after:hero.hp,maxHp:hero.maxHp};
  }
  window.BellymonShop=Object.freeze({POTIONS,TYPES,empty,ensure,validInventory,inCombat,buy,eligible,use});
})();
