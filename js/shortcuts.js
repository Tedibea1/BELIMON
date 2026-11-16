/* BELIMON V16.2 — raccourcis payants à prix linéaire.
   Reprise au record n : n steaks, soit 1 steak par étage ciblé.
   Reprise à n−5 : 50 % de (n−5) steaks, arrondi au pair en cas de .5.
   Exemples : record 100 => 100 steaks ; retour étage 95 => 48 steaks.
   Les destinations restent limitées au record déjà atteint.
   Module autonome : transactions atomiques, sans butin/soin gratuit.
*/
(() => {
  'use strict';
  const price = floor => {
    if(!Number.isSafeInteger(floor)||floor<2)return null;
    // Prix de reprise = étage ciblé, sans multiplicateur ni formule quadratique.
    return floor;
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
