const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{},console,Math,Date};vm.createContext(context);
for(const f of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),context,{filename:f});
const C=context.window.TDWCombat;
const waifu=(classId,rapidite,force=60)=>({classId,stats:{force,rapidite,constitution:0},hp:2000,maxHp:2000,energy:100});
const step=(playerRap,enemyRap,roll,options={})=>C.resolveTurn(
  waifu('griffeuse',playerRap),waifu(options.enemyClass||'epeiste',enemyRap),
  'special',options.bonuses||{},()=>roll,
  {enemyAction:options.enemyAction||'defend',turn:options.turn||1,effects:options.effects,trapPenalties:options.trapPenalties}
);
let checks=0;function check(condition,message){assert.ok(condition,message);checks++}
for(const [delta,pct] of [[-200,0],[-117,0],[-100,0],[-99,0.5],[-75,12.5],[-50,25],[-10,45],[0,50],[10,55],[50,75],[93,96.5],[100,100],[117,100],[200,100]]){
  const chance=C.griffesHitChance({rapidite:200+delta},{rapidite:200});
  check(chance===pct,`écart ${delta}: ${chance} % au lieu de ${pct} %`);
  const low=step(200+delta,200,Math.max(0,(pct/100)-0.001));
  if(pct>0){check(low.details.player.damage>0&&low.details.player.critical,`écart ${delta}: critique x3 sous le seuil`)}
  else check(low.details.player.miss,`écart ${delta}: pas de réussite à 0 %`);
  if(pct<100){const high=step(200+delta,200,pct/100);check(high.details.player.miss,`écart ${delta}: échec à la borne supérieure`)}
  else {const high=step(200+delta,200,.999);check(high.details.player.critical&&high.details.player.damage>0,`écart ${delta}: réussit toujours`)}
}
// 50/50 exact : ni esquive générique supplémentaire, ni critique ordinaire ; 1 tirage de réussite.
let draws=0;
const s=C.resolveTurn(waifu('griffeuse',50),waifu('epeiste',50),'special',{},()=>{draws++;return .499;},{enemyAction:'defend'});
check(s.details.player.damage===90,'égalité : Force 60 x3 puis Défense 50 %');
check(s.details.player.critical,'égalité : toujours un critique quand le coup passe');
check(draws===1,'Griffes fatales : un seul jet, sans esquive secondaire');
check(s.player.energy===80,'coût 20 EN conservé');
const lost=step(50,50,.5);check(lost.details.player.miss&&!lost.details.player.critical&&lost.details.player.damage===0,'égalité : échec à 50 %');
// La cible très rapide échoue à se protéger avec l'ancienne esquive alors que la spéciale a déjà réussi.
const c=step(300,200,.01);check(c.details.player.critical&&!c.details.player.dodged,'100 % de réussite sans esquive ordinaire');
// Tests des bonus : les points ajoutés aux stats du joueur comptent.
const boosted=step(100,150,.4,{bonuses:{rapidite:20}}); // +40 RAP => écart -10, chance 45 %
check(boosted.details.player.critical,'bonus de collection influence la chance, ici 45 %');
const noBoost=step(100,150,.4);check(noBoost.details.player.miss,'sans le bonus même tirage est raté (25 %)');
// Les pénalités de pièges influencent seulement les stats personnelles, comme auparavant.
const trapped=step(100,50,.7,{trapPenalties:{rapidite:.5}});check(trapped.details.player.miss,'piège : perte de rapidité => chance de réussite redescend à 50 %');
// Protection spéciale inchangée : Spectre intangible bloque le coup même si chance 100 %.
const effects=C.normalizeEffects();effects.enemy.intangible={startTurn:1,expiresTurn:1};
const blocked=step(200,1,.1,{enemyClass:'spectre',effects,enemyAction:'defend'});
check(blocked.details.player.dodged&&blocked.details.player.damage===0,'intangibilité reste prioritaire');
// Parité PNJ : même formule si Griffes fatales est utilisée par une adversaire.
const enemyClaws=C.resolveTurn(waifu('epeiste',200),waifu('griffeuse',100),'defend',{},()=>.01,{enemyAction:'special'});
check(enemyClaws.details.enemy.miss&&enemyClaws.details.enemy.damage===0,'PNJ moins rapide (-100) rate');
const enemyFast=C.resolveTurn(waifu('epeiste',100),waifu('griffeuse',200),'defend',{},()=>.999,{enemyAction:'special'});
check(enemyFast.details.enemy.critical&&enemyFast.details.enemy.damage===90,'PNJ plus rapide (+100) critique x3 garanti à la réussite');
// V15 : l'attaque lourde adopte aussi le jet comparatif, sans deuxième esquive.
const heavy=C.resolveTurn(waifu('epeiste',200),waifu('griffeuse',100),'heavy',{},()=>.9,{enemyAction:'defend'});
check(heavy.details.player.damage>0 && !heavy.details.player.miss, 'lourde +100 RAP réussit à 100 %');
// La description affichée aux joueuses reflète les changements.
check(C.SPECIALS.griffeuse.description.includes('50 %'),'texte du sort mis à jour');
console.log(`V14.9 GRIFFES : ${checks} vérifications réussies`);
