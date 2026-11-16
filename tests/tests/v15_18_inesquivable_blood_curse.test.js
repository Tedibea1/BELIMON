'use strict';
// BELLYMON V15.18 : dégâts ×0,5 esquivables, malus de la Maudite impossible à esquiver.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../..'),context={window:{},console,Math,Date};
vm.createContext(context);
for(const f of ['bonuses.js','traps.js','combat.js','combat-ui.js'])
 vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),context,{filename:f});
const C=context.window.TDWCombat,UI=context.window.BellymonCombatUI;
const h=(classId,{hp=300,maxHp=300,force=30,rapidite=10,constitution=0,energy=100}={})=>({classId,hp,maxHp,energy,stats:{force,rapidite,constitution}});
const state=(p,e)=>({player:p,enemy:e,effects:C.normalizeEffects()});
const act=(s,t,a,b,random=()=>.99)=>C.resolveTurn(s.player,s.enemy,a,{},random,{turn:t,enemyAction:b,effects:s.effects});
let checks=0;
const eq=(actual,expected,why)=>{assert.equal(actual,expected,why);checks++};
const yes=(value,why)=>{assert.ok(value,why);checks++};
eq(C.SPECIALS.maudite.name,'Malédiction du sang','nom intact');
yes(C.SPECIALS.maudite.description.includes('Force ×0,5'),'coefficient ×0,5 inchangé');
yes(C.SPECIALS.maudite.description.includes('impossible à esquiver'),'effet documenté');
eq(C.COST.special,5,'coût 5 énergie inchangé');
// 1. Coup esquivé par 100 % d'esquive : aucun dégât direct, mais malédiction active pour T+1…T+3.
{
 let s=state(h('maudite',{force:80,rapidite:10}),h('epeiste',{force:0,rapidite:200}));
 s=act(s,1,'special','defend');
 eq(s.details.player.dodged,true,'attaque physique esquivée');
 eq(s.details.player.damage,0,'aucun dégât x0,5 après esquive');
 eq(s.enemy.hp,300,'cible indemne au tour du lancement');
 eq(s.effects.enemy.bloodCurse.startTurn,2,'effet appliqué malgré esquive en T+1');
 eq(s.effects.enemy.bloodCurse.expiresTurn,4,'durée inchangée T+1 à T+3');
 yes(s.summary.includes('Malédiction du sang appliquée'),'journal annonce le malus même après esquive');
 eq(UI.describe({turn:1,effects:s.effects},1,[]).sides.enemy.some(x=>x.detail.includes('impossible à esquiver')),true,'badge de statut actualisé');
 s=act(s,2,'defend','light');
 eq(s.enemy.hp,270,'attaque offensive ennemie déclenche 10 % PV max malgré le coup esquivé auparavant');
}
// 2. Une attaque qui touche inflige toujours des dégâts ×0,5 ET applique le malus.
{
 let s=state(h('maudite',{force:80,rapidite:10}),h('epeiste',{force:0,rapidite:0}));
 s=act(s,1,'special','light');
 eq(s.details.player.dodged,false,'touche sans esquive');
 eq(s.details.player.damage,40,'dégâts calculés à Force x0,5 (pas de coefficient modifié)');
 eq(s.effects.enemy.bloodCurse.startTurn,2,'malus également appliqué au toucher');
}
// 3. L'intangibilité Spectre annule le hit, mais pas le statut : esquive ≠ Purification.
{
 let s=state(h('maudite',{force:80,rapidite:10}),h('spectre',{force:0,rapidite:10}));
 s.effects.enemy.intangible={startTurn:1,expiresTurn:2};
 s=act(s,1,'special','defend');
 eq(s.details.player.dodged,true,'intangibilité esquive le hit');
 eq(s.details.player.damage,0,'intangibilité empêche les dégâts');
 eq(s.effects.enemy.bloodCurse.startTurn,2,'la malédiction reste inévitable');
}
// 4. L'Exorciste peut toujours contrer le statut avec Purification, même en même tour.
{
 let s=state(h('maudite',{force:80,rapidite:200}),h('exorciste',{force:0,rapidite:200}));
 s=act(s,1,'special','special');
 eq(s.effects.enemy.purification.expiresTurn,5,'purification active dès ce tour');
 eq(s.details.player.dodged,true,'Exorciste esquive le hit');
 eq(s.effects.enemy.bloodCurse,null,'Purification bloque le malus inévitable');
 yes(s.summary.includes('bloquée par Purification'),'journal indique le contre');
}
// 5. Ancien effet Purification bloque aussi le lancement, sans immunité aux dégâts.
{
 let s=state(h('maudite',{force:80,rapidite:200}),h('epeiste',{force:0,rapidite:0}));
 s.effects.enemy.purification={startTurn:1,expiresTurn:5};
 s=act(s,1,'special','defend');
 yes(s.details.player.damage>0,'les dégâts directs restent possibles sous Purification');
 eq(s.effects.enemy.bloodCurse,null,'pas de malus sous Purification');
}
// 6. Même règle pour la Maudite côté PNJ face au joueur qui esquive.
{
 let s=state(h('griffeuse',{force:0,rapidite:200}),h('maudite',{force:80,rapidite:10}));
 s=act(s,1,'defend','special');
 eq(s.details.enemy.dodged,true,'le joueur esquive le coup de la Maudite PNJ');
 eq(s.details.enemy.damage,0,'pas de dégâts de la Maudite PNJ');
 eq(s.effects.player.bloodCurse.startTurn,2,'le joueur est quand même maudit');
 s=act(s,2,'light','defend');
 eq(s.player.hp,270,'le joueur perd 10 % PV max sur son attaque suivante');
}
// 7. Relancer la malédiction renouvelle la durée sans cumuler ; défense sans punition.
{
 let s=state(h('maudite',{force:0,rapidite:10}),h('epeiste',{force:0,rapidite:200}));
 s=act(s,1,'special','defend');
 s=act(s,2,'special','defend');
 eq(s.effects.enemy.bloodCurse.startTurn,3,'renouvellement débute au prochain tour');
 eq(s.effects.enemy.bloodCurse.expiresTurn,5,'renouvellement pour trois tours');
 eq(s.enemy.hp,300,'aucune pénalité sur défense');
 s=act(s,3,'defend','light');
 eq(s.enemy.hp,270,'dégâts statut restent fixés à 10 %');
 s=act(s,4,'defend','defend');
 eq(s.enemy.hp,270,'défense ne déclenche pas le malus');
}
// 8. Si la Maudite est KO avant son action, aucun malus n'est lancé.
{
 let s=state(h('maudite',{hp:1,maxHp:300,force:80,rapidite:0}),h('epeiste',{force:100,rapidite:200}));
 s=act(s,1,'special','light');
 eq(s.player.hp,0,"Maudite KO avant d'agir");
 eq(s.effects.enemy.bloodCurse,null,"pas de malus si le sort n'est pas lancé");
 eq(s.player.energy,100,'énergie inchangée si KO avant le lancement');
}
// 9. Les autres sorts restent esquivables ET leurs malus restent conditionnels au toucher.
{
 let s=state(h('envouteuse',{force:80,rapidite:10}),h('epeiste',{force:0,rapidite:200}));
 s=act(s,1,'special','defend');
 eq(s.details.player.dodged,true,'esquive du vol de force');
 eq(s.effects.enemy.powerLoss,null,'pas de vol de force après esquive');
 s=state(h('archere_arcanique',{force:80,rapidite:10}),h('epeiste',{force:0,rapidite:200}));
 s=act(s,1,'special','defend');
 eq(s.details.player.dodged,true,'esquive de la flèche');
 eq(s.effects.enemy.swordCons,false,'pas de malus de Constitution après esquive');
}
const guide=fs.readFileSync(path.join(root,'js/guide.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
yes(guide.includes('même si le coup est esquivé'),'Guide annonce la règle');
yes(index.includes('BELLYMON · V16.0 LAB')&&index.includes('RPG · VERSION 16.0 TEST'),'version affichée');
console.log('BELLYMON V15.18 : '+checks+' tests ciblés réussis.');
