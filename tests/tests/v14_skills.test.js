const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const context={window:{},console,Date,Math}; vm.createContext(context);
for(const file of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),context,{filename:file});
const C=context.window.TDWCombat,roll=()=>.99;
const ch=(id,{hp=200,maxHp=200,force=40,rapidite=20,constitution=20,energy=100}={})=>({classId:id,hp,maxHp,energy,stats:{force,rapidite,constitution}});
const fight=(p,e,act,ai,turn,fx)=>C.resolveTurn(p,e,act,{},roll,{turn,effects:fx,enemyAction:ai});
let checks=0;const check=(condition,message)=>{assert.ok(condition,message);checks++};
function advance(s,act,ai,turn){return fight(s.player,s.enemy,act,ai,turn,s.effects)}
// Six nouvelles classes enregistrées, coût unique 20 EN
for(const id of ['vampire','spectre','nemesis','maudite','envouteuse','exorciste'])check(C.SPECIALS[id],`compétence ${id}`);
check(C.COST.special===20,'EN de toutes les spéciales');
// Vampire : dégâts + 35 % des dégâts réels, sans dépassement HP max
{
 const p=ch('vampire',{hp:100,maxHp:200,force:80});const e=ch('griffeuse',{hp:200});
 const a=fight(p,e,'special','defend',1);const dmg=200-a.enemy.hp;
 check(dmg>0,'vampire inflige des dégâts');
 check(a.player.hp===100+Math.round(dmg*.35),'vampirisation utilise les dégâts réellement reçus');
 check(a.player.energy===80,'vampirisation consomme 20 EN');
 const b=fight(ch('vampire',{hp:199,force:80}),e,'special','defend',1);
 check(b.player.hp===200,'soin plafonné');
}
// Spectre : tours 1/2 intangibles, 3 exposé, 4 disponible. Réaction même s'il est plus lent
{
 let s={player:ch('spectre',{force:30,rapidite:5}),enemy:ch('epeiste',{force:40,rapidite:5}),effects:C.normalizeEffects()};
 s=advance(s,'special','light',1);check(s.details.enemy?.dodged,'immunité dès le tour d’activation');
 check(s.details.player?.damage>0,'frappe spectrale fait des dégâts');
 check(!C.canUseSpecial(s.player,s.player.energy,2,s.effects.player),'non disponible tour 2');
 s=advance(s,'light','light',2);check(s.details.enemy.dodged,'intangibilité tour 2');
 check(!C.canUseSpecial(s.player,s.player.energy,3,s.effects.player),'recharge tour 3');
 s=advance(s,'light','light',3);check(!s.details.enemy.dodged,'vulnérable tour 3');
 check(C.canUseSpecial(s.player,s.player.energy,4,s.effects.player),'réutilisable tour 4');
 s=advance(s,'special','light',4);check(s.details.enemy.dodged,'nouveau cycle tour 4');
}
// V15.4 : Miroir dès activation, pas de réduction de dégâts, 5 tours, sans cumul
{
 let s={player:ch('nemesis',{rapidite:5}),enemy:ch('epeiste',{rapidite:40}),effects:C.normalizeEffects()};
 const a=advance(s,'special','light',1);check(a.player.hp<200,'le miroir n’annule pas les dégâts');
 check(a.enemy.hp<200,'miroir réagit avant le premier tour du défenseur lent');
 check(a.effects.player.mirror.expiresTurn===5,'durée miroir 5 tours');
 let b=advance(a,'special','light',2);check(b.effects.player.mirror.expiresTurn===6,'renouvellement 5 tours sans cumul');
 const result=200-b.enemy.hp;check(result>0&&result<90,'40 % et pas 80 % de renvoi');
}
// V15.4 : Maudite attaque puis pose le malus pour les 3 prochains tours uniquement.
{
 let s={player:ch('maudite',{force:20,rapidite:40}),enemy:ch('epeiste',{force:0,rapidite:5,maxHp:200,hp:200}),effects:C.normalizeEffects()};
 s=advance(s,'special','light',1);
 check(s.details.player.damage>0,'Maudite inflige des dégâts immédiats');
 check(s.effects.enemy.bloodCurse.startTurn===2&&s.effects.enemy.bloodCurse.expiresTurn===4,'Maudite active tours 2-4');
 const hp=s.enemy.hp;
 s=advance(s,'defend','light',2);check(s.enemy.hp===hp-20,'Maudite retire 10 % au tour 2');
 s=advance(s,'defend','defend',3);check(s.enemy.hp===hp-20,'Défense sans malédiction');
 s=advance(s,'defend','light',4);check(s.enemy.hp===hp-40,'Maudite active jusqu’au tour 4');
 s=advance(s,'defend','light',5);check(s.enemy.hp===hp-40,'Maudite expirée au tour 5');
}
// Envoûteuse : transfert reporté au tour suivant, renouvellement pas de multiplication
{
 let s={player:ch('envouteuse',{force:20,rapidite:50}),enemy:ch('griffeuse',{force:100,rapidite:10}),effects:C.normalizeEffects()};
 s=advance(s,'special','defend',1);
 check(s.effects.player.powerGain.amount===20,'gain fixe de 20 points de Force');
 check(C.penaltyFor(s.effects.player,1).forceFlat===0,'pas de gain pendant l’activation');
 check(C.penaltyFor(s.effects.enemy,1).forceFlat===0,'pas de perte pendant l’activation');
 check(C.penaltyFor(s.effects.player,2).forceFlat===20,'gain tour 2');
 check(C.penaltyFor(s.effects.enemy,2).forceFlat===-20,'perte tour 2');
 s=advance(s,'special','defend',2);
 check(s.effects.player.powerGain.amount===20,'nouvelle activation ne cumule pas le transfert');
 check(s.effects.player.powerGain.startTurn===3,'le renouvellement redémarre au tour suivant');
}
// Exorciste : suppression des malus existants, protection (5 tours), pas d’attaque gratuite
{
 const fx=C.normalizeEffects();fx.player.swordCons=true;fx.player.curse={expiresTurn:8,percent:30,nextTickAt:0};
 fx.player.siphon={expiresTurn:8,nextTickAt:0};fx.player.bloodCurse={startTurn:1,expiresTurn:8};
 fx.player.powerLoss={startTurn:1,expiresTurn:8,amount:10};fx.enemy.powerGain={startTurn:1,expiresTurn:8,amount:10};
 let s=fight(ch('exorciste'),ch('maudite'), 'special','special',1,fx);
 check(!s.effects.player.swordCons&&!s.effects.player.curse&&!s.effects.player.siphon,'purification retire malédiction/épée/absorption');
 check(!s.effects.player.bloodCurse&&!s.effects.player.powerLoss&&!s.effects.enemy.powerGain,'purification retire sang et vol de Force');
 check(s.effects.player.purification.expiresTurn===5,'protection de 5 tours');
 s=advance(s,'defend','special',2);check(!s.effects.player.bloodCurse,'immunité au tour 2');
 s=advance(s,'defend','special',3);check(!s.effects.player.bloodCurse,'protection tour 3');
 s=advance(s,'defend','special',4);check(!s.effects.player.bloodCurse,'protection tour 4');
 s=advance(s,'defend','special',5);check(!s.effects.player.bloodCurse,'protection tour 5');
 s.enemy.energy=100; s=advance(s,'defend','special',6);check(!!s.effects.player.bloodCurse && s.effects.player.bloodCurse.startTurn===7,'vulnérabilité revenue tour 6 : malus préparé pour tour 7');
}
// Multiplicateurs et propriétés des spéciales conservés après refonte RAP V15
{
 const p=ch('griffeuse',{force:60,rapidite:120});const e=ch('epeiste',{constitution:0});
 const s=fight(p,e,'special','defend',1);check(s.details.player.critical,'Griffes fatales critique garanti');
 check(s.details.player.damage===60,'Griffes fatales : ×2 et défense ×.5');
 const t=fight(ch('archere_arcanique',{force:100}),ch('epeiste',{constitution:0}),'special','defend',1);
 check(t.details.player.damage===85,'Archère : coefficient ×1.7 avant défense');
}
console.log(`V14 SKILLS : ${checks} vérifications réussies`);
