/* BELLYMON V8 — règles des bonus permanents du compte.
   Une niveau de collection vaut TOUJOURS +2 points plats de la statistique,
   sans multiplication de rang, quel que soit le rang ou la morphologie.
   Calcul pur : n'altère jamais la fiche enregistrée des waifus.
*/
(() => {
  'use strict';
  const KEYS=Object.freeze(['force','rapidite','constitution']);
  const POINTS_PER_LEVEL=2;
  function level(value){return Number.isSafeInteger(value)&&value>=0?value:0;}
  function points(value){return level(value)*POINTS_PER_LEVEL;}
  function breakdown(personal={},levels={}){
    const output={};
    for(const key of KEYS){
      const base=Number.isFinite(personal?.[key])?Math.max(0,personal[key]):0;
      const bonus=points(levels?.[key]);
      output[key]=Object.freeze({personal:base,level:level(levels?.[key]),bonus,total:base+bonus});
    }
    return output;
  }
  function totalStats(personal={},levels={}){
    const parts=breakdown(personal,levels);
    return {force:parts.force.total,rapidite:parts.rapidite.total,constitution:parts.constitution.total};
  }
  window.BellymonBonuses=Object.freeze({KEYS,POINTS_PER_LEVEL,points,breakdown,totalStats});
})();
