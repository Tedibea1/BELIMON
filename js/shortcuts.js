/* BELLYMON V15.3 — raccourcis payants rééquilibrés.
   Prix d'un étage n = max(1, arrondi(n² / 12)) steaks.
   Progression quadratique moins chère que l'ancien prix exponentiel :
   n=15 : 19 ; n=30 : 75 ; n=60 : 300 ; n=100 : 833 ; n=226 : 4256.
   Reprise n−5 : 50 % du prix de l’étage n−5, arrondi au pair en cas de .5.
   Module autonome : transactions atomiques par le contrôleur, sans butin/soin gratuit.
*/
(() => {
  'use strict';
  const price = floor => {
    if(!Number.isSafeInteger(floor)||floor<2)return null;
    // Le coût reste raisonnable en début de tour et monte avec la distance évitée.
    const raw=(floor*floor)/12;
    if(!Number.isFinite(raw)||raw>Number.MAX_SAFE_INTEGER)return null;
    return Math.max(1,Math.round(raw));
  };
  const halfEven = value => {
    const base=Math.floor(value/2);
    return value%2===0 ? base : base+(base%2===1?1:0);
  };
  function plan(record,kind){
    if(!Number.isSafeInteger(record)||record<2)return null;
    if(kind!=='reduced'&&kind!=='record')return null;
    const target=kind==='reduced'?record-5:record;
    if(target<=1)return null;
    const exact=price(target);
    if(exact===null)return null;
    return Object.freeze({kind,target,cost:kind==='reduced'?halfEven(exact):exact});
  }
  function apply(data,kind){
    if(!data || !data.tower || data.tower.floor!==1 || data.tower.room!=='rest' || data.tower.event!=null)
      throw Error('Le raccourci est réservé à la salle de repos de l’étage 1.');
    const selected=plan(data.tower.record,kind);
    if(!selected)throw Error('Raccourci non débloqué.');
    if(!data.food || !Number.isSafeInteger(data.food.small) || data.food.small<selected.cost)
      throw Error('Pas assez de steaks.');
    // Les gigots et les potions ne sont ni débités ni convertis.
    data.food.small-=selected.cost;
    data.tower.floor=selected.target;
    data.tower.room='rest';
    data.tower.event=null;
    data.tower.combat=null;
    data.tower.activeTraps=[];
    // record est conservé ; aucun événement ni récompense n’est déclenché.
    return selected;
  }
  window.BellymonShortcuts=Object.freeze({price,plan,apply});
})();
