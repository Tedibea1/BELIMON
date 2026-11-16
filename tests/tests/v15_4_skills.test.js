const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={window:{},console,Math,Date};vm.createContext(ctx);
for(const file of ['bonuses.js','traps.js','combat.js','combat-ui.js','auto.js'])
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),ctx,{filename:file});
const C=ctx.window.TDWCombat,UI=ctx.window.BellymonCombatUI,AUTO=ctx.window.BellymonAuto;
let checks=0;
const eq=(a,b,why)=>{assert.equal(a,b,why);checks++;};
const yes=(v,why)=>{assert.ok(v,why);checks++;};
const ch=(id,{force=30,rapidite=40,constitution=20,hp=2000,maxHp=2000,energy=100}={})=>({classId:id,hp,maxHp,energy,stats:{force,rapidite,constitution}});
const turn=(s,t,a,b,rand=()=>.99,bonuses={})=>C.resolveTurn(s.player,s.enemy,a,bonuses,rand,{turn:t,effects:s.effects,enemyAction:b});
const start=(p,e)=>({player:p,enemy:e,effects:C.normalizeEffects()});
// Les quatre textes, paramètres et sorts ordinaires conservent leur identité.
for(const id of ['maudite','envouteuse']){
 yes(C.SPECIALS[id].description.includes('×1,0'),id+' puissance ×1');
 yes(C.SPECIALS[id].description.includes('3 tours'),id+' durée 3 tours');
}
for(const id of ['nemesis','exorciste'])yes(C.SPECIALS[id].description.includes('5 tours'),id+' durée 5 tours');
eq(C.COST.special,20,'coût 20 EN');
eq(C.ACTIONS.heavy.power,1.5,'lourde ×1.5 inchangée');
eq(C.combatChances({rapidite:20}).critical,10,'critique RAP/2');
eq(C.combatChances({rapidite:20}).dodge,10,'esquive RAP/2');
// Attaque Maudite : dégâts normaux, crit possible et durée T+1 à T+3.
{
 let s=start(ch('maudite',{force:100,rapidite:80}),ch('epeiste',{force:0,rapidite:10,constitution:0}));
 s=turn(s,1,'special','light');
 eq(s.details.player.damage,100,'Maudite dégâts directs Force ×1');
 eq(s.details.player.critical,false,'Maudite peut ne pas critiquer');
 eq(s.enemy.hp,1900,'seulement les dégâts directs au tour 1');
 eq(s.effects.enemy.bloodCurse.startTurn,2,'curse commence T+1');
 eq(s.effects.enemy.bloodCurse.expiresTurn,4,'curse finit T+3');
 const badge=UI.describe({turn:1,effects:s.effects},1,[]).sides.enemy;
 yes(badge.some(v=>v.label.includes('3 t.')),'UI indique trois tours restants');
 for(let t=2;t<=4;t++){
  const before=s.enemy.hp;
  s=turn(s,t,'defend','light');
  eq(s.enemy.hp,before-200,'10 % des PV max à chaque offensive, 2-4');
 }
 const before=s.enemy.hp;
 s=turn(s,5,'defend','light');eq(s.enemy.hp,before,'expiration au début tour 5');
}
// Une Maudite peut critiquer, sans augmenter les dégâts de son malus (10% fixe).
{
 let s=start(ch('maudite',{force:30,rapidite:200}),ch('epeiste',{force:0,rapidite:0,constitution:0}));
 s=turn(s,1,'special','defend',()=>.01);
 eq(s.details.player.critical,true,'critique ordinaire Maudite');
 eq(s.details.player.damage,30,'30 ×2 critique ×0.5 défense');
 eq(s.effects.enemy.bloodCurse.startTurn,2,'critique applique curse');
}
// V15.18 : Maudite applique le sang maudit même sur une esquive ; l’Envoûteuse exige toujours une touche.
for(const id of ['maudite','envouteuse']){
 let s=start(ch(id,{rapidite:10,force:100}),ch('epeiste',{rapidite:100,force:1}));
 s=turn(s,1,'special','defend',()=>.01);
 eq(s.details.player.dodged,true,`${id} esquive adverse`);
 eq(s.details.player.damage,0,`${id} pas de dégâts si esquive`);
 if(id==='maudite')eq(s.effects.enemy.bloodCurse.startTurn,2,'Maudite malus inévitable sur esquive');
 else eq(s.effects.enemy.bloodCurse,null,'Envoûteuse aucun sang maudit');
 eq(s.effects.enemy.powerLoss,null,`${id} pas de vol sur esquive`);
}
// Intangibilité du Spectre bloque les dégâts, mais pas la malédiction inévitable de la Maudite.
for(const id of ['maudite','envouteuse']){
 let s=start(ch(id,{rapidite:100}),ch('spectre',{rapidite:1}));
 s.effects.enemy.intangible={startTurn:1,expiresTurn:2};
 s=turn(s,1,'special','defend');
 eq(s.details.player.dodged,true,`${id} bloqué par le Spectre`);
 if(id==='maudite')eq(s.effects.enemy.bloodCurse.startTurn,2,'Maudite malus inévitable sur intangible');
 else eq(s.effects.enemy.bloodCurse,null,'Envoûteuse aucun sang maudit');
 eq(s.effects.enemy.powerLoss,null,`${id} pas de vol sur intangible`);
}
// Maudite peut punir une attaque qui rate, mais pas une défense, repos ou attaque du tour d'activation.
{
 let s=start(ch('maudite',{rapidite:70,force:20}),ch('epeiste',{rapidite:5,force:1,maxHp:300,hp:300}));
 s=turn(s,1,'special','light'); const startHp=s.enemy.hp;
 eq(startHp<300,true,'dégâts initiaux');
 s=turn(s,2,'defend','heavy',()=>.99);
 eq(s.details.enemy.miss,true,'lourde ennemie ratée');
 eq(s.enemy.hp,startHp-30,'punition malgré échec');
 s=turn(s,3,'defend','defend'); eq(s.enemy.hp,startHp-30,'défense sans punition');
 s=turn(s,4,'defend','light'); eq(s.enemy.hp,startHp-60,'punition active T4');
}
// Vol de puissance : dégâts directs, transfert fixe et 3 tours à compter du lendemain.
for(const force of [0,1,7,19,20,21,60,600]){
 let s=start(ch('envouteuse',{rapidite:80,force:30}),ch('epeiste',{rapidite:1,force}));
 s=turn(s,1,'special','defend'); const amount=Math.min(force,20);
 eq(s.details.player.damage>0,true,'Vol fait des dégâts');
 eq(s.effects.player.powerGain.amount,amount,'vol plafonné 20 et à la Force disponible');
 eq(s.effects.enemy.powerLoss.amount,amount,'perte symétrique');
 eq(s.effects.player.powerGain.startTurn,2,'début T2');
 eq(s.effects.enemy.powerLoss.expiresTurn,4,'fin T4');
 eq(C.penaltyFor(s.effects.player,1).forceFlat,0,'pas de gain T1');
 eq(C.penaltyFor(s.effects.enemy,1).forceFlat,0,'pas de perte T1');
 for(let t=2;t<=4;t++){
  eq(C.penaltyFor(s.effects.player,t).forceFlat,amount,'gain effectif T2-4');
  eq(C.penaltyFor(s.effects.enemy,t).forceFlat,amount===0?0:-amount,'perte effective T2-4');
 }
 eq(C.penaltyFor(s.effects.player,5).forceFlat,0,'gain expiré T5');
 eq(C.penaltyFor(s.effects.enemy,5).forceFlat,0,'perte expirée T5');
}
// Relances de vol et malédiction : durée renouvelée, jamais de cumul.
for(const id of ['maudite','envouteuse']){
 let s=start(ch(id,{rapidite:80,force:50}),ch('epeiste',{rapidite:5,force:100,maxHp:2000}));
 s=turn(s,1,'special','defend');
 s=turn(s,2,'special','defend');
 if(id==='maudite'){
  eq(s.effects.enemy.bloodCurse.startTurn,3,'renouvellement maudite T+1');
  eq(s.effects.enemy.bloodCurse.expiresTurn,5,'renouvellement maudite fin T+3');
 } else {
  eq(s.effects.player.powerGain.amount,20,'pas de vol en double');
  eq(s.effects.enemy.powerLoss.amount,20,'pas de perte en double');
  eq(s.effects.player.powerGain.startTurn,3,'renouvellement envouteuse T+1');
  eq(s.effects.player.powerGain.expiresTurn,5,'renouvellement envouteuse fin T+3');
 }
 eq(s.player.energy,60,'deux sorts coûtent 40 EN');
}
// Les bonus de collection sont comptabilisés pour les joueurs, pas pour les PNJ.
{
 let s=start(ch('envouteuse',{rapidite:100,force:10}),ch('epeiste',{rapidite:10,force:17}));
 s=turn(s,1,'special','defend',()=>.99,{force:5});
 eq(s.effects.player.powerGain.amount,17,'max vol selon force adverse réelle');
 const baseline=turn(start(ch('envouteuse',{rapidite:100,force:10}),ch('epeiste',{rapidite:10,force:17})),1,'special','defend',()=>.99);
 eq(s.details.player.damage>baseline.details.player.damage,true,'bonus de collection des dégâts');
}
// Purification bloque un nouveau malus même si l'attaquante agit avant.
for(const id of ['maudite','envouteuse']){
 let s=start(ch(id,{rapidite:200,force:100}),ch('exorciste',{rapidite:1,force:1}));
 s=turn(s,1,'special','special');
 yes(s.details.player.damage>0,'attaque directe touche même Purification');
 eq(s.effects.enemy.purification.expiresTurn,5,'protection même tour');
 eq(s.effects.enemy.bloodCurse,null,'malédiction bloquée');
 eq(s.effects.enemy.powerLoss,null,'vol bloqué');
}
// Purification enlève un malus existant et coupe le bonus associé dans l'autre équipe.
{
 let s=start(ch('exorciste',{rapidite:1}),ch('envouteuse',{rapidite:200}));
 s.effects.player.powerLoss={startTurn:1,expiresTurn:8,amount:20};
 s.effects.enemy.powerGain={startTurn:1,expiresTurn:8,amount:20};
 s.effects.player.bloodCurse={startTurn:1,expiresTurn:8};
 s.effects.player.swordCons=true;
 s=turn(s,1,'special','defend');
 eq(s.effects.player.powerLoss,null,'Purification enlève le vol');
 eq(s.effects.enemy.powerGain,null,'Purification coupe le buff ennemie correspondant');
 eq(s.effects.player.bloodCurse,null,'Purification enlève le sang');
 eq(s.effects.player.swordCons,false,'Purification enlève Constitution négative');
 eq(s.effects.player.purification.startTurn,1,'Purification immédiate');
 eq(s.effects.player.purification.expiresTurn,5,'Purification active 1-5');
 for(let t=2;t<=5;t++)yes(C.normalizeEffects(s.effects,t).player.purification?.expiresTurn>=t,'protection encore valide '+t);
 s=turn(s,5,'defend','defend');eq(s.effects.player.purification,null,'effet expiré à fin tour 5');
}
// Miroir Némésis : 5 tours activation incluse, toujours 40% des dégâts réellement reçus.
{
 let s=start(ch('nemesis',{rapidite:1,force:10}),ch('epeiste',{rapidite:100,force:70}));
 s=turn(s,1,'special','light');
 eq(s.effects.player.mirror.startTurn,1,'Miroir immédiat même si Némésis est lente');
 eq(s.effects.player.mirror.expiresTurn,5,'Miroir expire tour5');
 eq(s.details.player.support!==undefined,true,'Miroir reste un buff sans attaque');
 yes(s.summary.includes('Miroir magique :'),'Miroir renvoie bien des dégâts au lancement');
 for(let t=2;t<=5;t++){
  s=turn(s,t,'defend','light');
  eq(s.summary.includes('Miroir magique :'),true,'Miroir active tour '+t);
 }
 s=turn(s,6,'defend','light');eq(s.summary.includes('Miroir magique :'),false,'Miroir expiré T6');
}
// IA AUTO peut encore utiliser ces compétences et n'ajoute pas de cooldown.
for(const id of ['nemesis','maudite','envouteuse','exorciste']){
 yes(C.canUseSpecial(ch(id),100,1,C.emptyEffect()),id+' sort disponible');
 yes(typeof AUTO.chooseAction(ch(id),ch('epeiste'),1,C.normalizeEffects(),()=>.1)==='string',id+' AUTO fonctionne');
}
console.log(`V15.4 SKILLS : ${checks} vérifications réussies`);
