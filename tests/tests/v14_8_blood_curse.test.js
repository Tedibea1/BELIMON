// Régression V14.8 actualisée en V15.18 : 10 % PV MAX par attaque tentée,
// malus indépendant d'une attaque réussie, de T+1 à T+3.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context={window:{},console,Math,Date};vm.createContext(context);
for(const file of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),context,{filename:file});
const C=context.window.TDWCombat;
const c=(classId,rapidite=30,force=0,maxHp=300)=>({classId,hp:maxHp,maxHp,energy:100,stats:{force,rapidite,constitution:20}});
const run=(s,turn,action,enemyAction,rng=()=>.99)=>C.resolveTurn(s.player,s.enemy,action,{},rng,{turn,effects:s.effects,enemyAction});
let checks=0;const eq=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++};
{
 let s={player:c('maudite',90,20),enemy:c('griffeuse',20),effects:C.normalizeEffects()};
 s=run(s,1,'special','light');
 eq(s.details.player.damage>0,true,'attaque Maudite frappe immédiatement');
 eq(s.enemy.hp,300-s.details.player.damage,'pas de malédiction au tour du lancement');
 eq(s.effects.enemy.bloodCurse.startTurn,2,'début tour 2');
 eq(s.effects.enemy.bloodCurse.expiresTurn,4,'fin tour 4');
 for(const turn of [2,3,4]){
   const before=s.enemy.hp;
   s=run(s,turn,'defend','light');
   eq(s.enemy.hp,before-30,'10 % de 300 PV max à chaque attaque');
 }
 const after=s.enemy.hp;
 s=run(s,5,'defend','light');eq(s.enemy.hp,after,'la malédiction a expiré');
}
{
 // Une lourde ratée déclenche quand même la perte de PV lorsqu'elle est maudite.
 let s={player:c('maudite',90,20),enemy:c('griffeuse',10),effects:C.normalizeEffects()};
 s=run(s,1,'special','defend');
 const before=s.enemy.hp;
 s=run(s,2,'defend','heavy',()=>.99);
 eq(s.details.enemy.miss,true,'lourde ratée');
 eq(s.enemy.hp,before-30,'la tentative offensive déclenche quand même la punition');
}
{
 // L'ennemie Maudite doit suivre la même logique.
 let s={player:c('griffeuse',10),enemy:c('maudite',90,20),effects:C.normalizeEffects()};
 s=run(s,1,'defend','special');
 eq(s.details.enemy.damage>0,true,'Maudite PNJ attaque');
 eq(s.effects.player.bloodCurse.startTurn,2,"l’effet PNJ démarre au tour suivant");
 const before=s.player.hp;
 s=run(s,2,'light','defend');
 eq(s.player.hp,before-30,'Maudite PNJ punit le joueur au tour 2');
}
{
 // La protection bloque le malus, mais pas les dégâts immédiats.
 const fx=C.normalizeEffects();fx.enemy.purification={startTurn:1,expiresTurn:5};
 const s=run({player:c('maudite',90,20),enemy:c('exorciste',10),effects:fx},1,'special','defend');
 eq(s.effects.enemy.bloodCurse,null,'immunité protège du sang maudit');
 eq(s.details.player.damage>0,true,'la cible purifiée reçoit néanmoins les dégâts directs');
}
console.log(`V14.8/15.4 MAUDITE : ${checks} contrôles réussis`);
