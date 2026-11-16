/* BELLYMON V12 — représentation lisible des effets de combat.
   Aucune règle modifiée ici : les effets proviennent du moteur de combat et des pièges. */
(() => {
 'use strict';
 const C=window.TDWCombat, T=window.BellymonTraps;
 function describe(battle={},floor=1,traps=[]){
   const nextTurn=(Number.isInteger(battle.turn)?battle.turn:0)+1;
   const effects=C.normalizeEffects(battle.effects,nextTurn);
   const sides={player:[],enemy:[]};
   for(const key of ['player','enemy']){
     const fx=effects[key];
     if(fx.swordCons) sides[key].push({icon:'🛡️',label:'CONS −15 %',detail:'Flèche perforante : Constitution −15 % jusqu’à la fin du combat.',kind:'debuff'});
     if(fx.curse && nextTurn<=fx.curse.expiresTurn){
       const remaining=fx.curse.expiresTurn-nextTurn+1;
       const percent=fx.curse.percent;
       sides[key].push({icon:'🔮',label:`Stats −${percent}% · ${remaining} t.`,detail:`Malédiction abyssale : Force, Rapidité et Constitution −${percent} % actuellement, progression de 2 % par seconde de combat active (maximum −50 %). Encore ${remaining} tour${remaining>1?'s':''} ; relancer le sort renouvelle la durée sans cumuler ni réinitialiser le malus.`,kind:'debuff'});
     }
     if(fx.siphon && nextTurn<=fx.siphon.expiresTurn){
       const remaining=fx.siphon.expiresTurn-nextTurn+1;
       sides[key].push({icon:'⚡',label:`Absorption · ${remaining} t.`,detail:`Absorption : −3 énergies par seconde active, pendant encore ${remaining} tour${remaining>1?'s':''}.`,kind:'debuff'});
     }
     function addTimed(field,icon,label,detail,kind){
       const t=fx[field];if(!t||nextTurn<t.startTurn||nextTurn>t.expiresTurn)return;
       const left=t.expiresTurn-nextTurn+1;
       sides[key].push({icon,label:`${label} · ${left} t.`,detail:`${detail} Encore ${left} tour${left>1?'s':''}.`,kind});
     }
     addTimed('intangible','👻','Intangible','Frappe spectrale : esquive garantie contre les attaques.', 'buff');
     addTimed('mirror','🪞','Miroir 40 %','Miroir magique : renvoie 40 % des dégâts réellement reçus.', 'buff');
     addTimed('bloodCurse','🩸','Sang maudit','Malédiction du sang : malus impossible à esquiver, sauf avec Purification. Chaque attaque offensive coûte 10 % des PV max à son auteur.', 'debuff');
     addTimed('powerGain','🔮',`FOR +${fx.powerGain?.amount||0}`,'Vol de puissance : transfert de 20 % de la Force ennemie au lancement, actif temporairement.', 'buff');
     addTimed('powerLoss','🔻',`FOR −${fx.powerLoss?.amount||0}`,'Vol de puissance : 20 % de la Force prélevés au lancement, temporairement.', 'debuff');
     addTimed('purification','✨','Purifié','Purification : protection contre les nouveaux malus.', 'buff');
   }
   const activeTraps=T.normalize(traps,floor).filter(trap=>trap.startsAtFloor===undefined || floor>=trap.startsAtFloor).map(trap=>{
     const type=T.TYPES[trap.type],remaining=T.remaining(trap,floor);
     return {icon:type.icon,label:`${type.description} · ${remaining} ét.`,detail:`Piège de la tour : ${type.description} sur toutes tes waifus (hors bonus permanents). ${remaining} étage${remaining>1?'s':''} encore affecté${remaining>1?'s':''}, étage actuel compris.`,kind:'trap'};
   });
   return {sides,traps:activeTraps, count:sides.player.length+sides.enemy.length+activeTraps.length,turn:nextTurn};
 }
 window.BellymonCombatUI=Object.freeze({describe});
})();
