// BELLYMON V12.0.9 — vérification des critiques ×3 limités à Griffes fatales.
const assert=require('node:assert/strict'), fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{},Math};vm.createContext(context);
for(const f of ['bonuses.js','combat.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),context);
const C=context.window.TDWCombat;
let checks=0;
function eq(actual,expected,message){assert.equal(actual,expected,message);checks++}
function ok(truth,message){assert.ok(truth,message);checks++}
const sChar=(classId,stats,hp)=>({classId,stats,maxHp:hp,hp,energy:100});
const claw=sChar('griffeuse',{force:79,rapidite:84,constitution:45},270);
const tank=sChar('bagarreuse',{force:69,rapidite:35,constitution:104},392);
const archer=sChar('archere_arcanique',{force:128,rapidite:35,constitution:45},245);
const rng=(...items)=>{let i=0;return()=>items[i++]??0.99};
const high=()=>0.99;
eq(C.SPECIALS.griffeuse.description,'Force ×1,0 · coup critique garanti (×3).','description spéciale à jour');
// Dans resolveTurn, rng 0,99 fait défendre l'ennemie et évite les esquives/critiques aléatoires.
const clawVsTank=C.resolveTurn(claw,tank,'special',{},high,{turn:1});
eq(clawVsTank.details.player.damage,59,'Griffes fatales contre une Bagarreuse S obèse en défense');
eq(clawVsTank.details.player.critical,true,'critique garanti');
eq(clawVsTank.details.player.defended,true,'la défense reste efficace');
eq(clawVsTank.enemy.hp,333,'PV réels après spéciale');
eq(clawVsTank.player.energy,95,'coût spéciale toujours 5 EN');
const oldBaseline=31; // version 12.0.8 : 0.8 × 2 face à ce tank en défense
ok(clawVsTank.details.player.damage>oldBaseline,'buff réel par rapport au 31 dégâts précédents');
// Griffeuse ennemie soumise aux mêmes règles.
const enemyClaw=C.resolveTurn(archer,claw,'defend',{},rng(0.78,0.99,0.99,0.99),{turn:1});
eq(enemyClaw.aiAction,'special','ennemie utilise sa spéciale');
eq(enemyClaw.details.enemy.critical,true,'le critique garanti vaut aussi pour une ennemie');
// Attaque légère critique ordinaire = ×2, malgré le buff de la spéciale.
const ordinary=sChar('griffeuse',{force:79,rapidite:84,constitution:45},270);
const target=sChar('bagarreuse',{force:69,rapidite:35,constitution:104},392);
const resultLight=C.strike(ordinary,target,'light',ordinary.stats,target.stats,false,rng(0.1,0.99,0.01));
eq(resultLight.critical,true,'attaque légère critique');
eq(resultLight.damage,62,'légère reste ×0,8 avec critique ×2');
const regular=C.strike(ordinary,sChar('bagarreuse',target.stats,392),'light',ordinary.stats,target.stats,false,high);
eq(regular.damage,31,'légère sans critique inchangée');
const newClaws=C.strike(ordinary,sChar('bagarreuse',target.stats,392),'special',ordinary.stats,target.stats,false,high,1.0,true,3);
eq(newClaws.damage,117,'Griffes fatales hors défense = 117 dégâts');
const archerCrit=C.strike(archer,sChar('bagarreuse',target.stats,392),'special',archer.stats,target.stats,false,rng(0.1,0.99,0.01),1.7);
eq(archerCrit.damage,214,'Flèche du cataclysme garde un critique ×2');
const archerNormal=C.resolveTurn(archer,tank,'special',{},high,{turn:1});
eq(archerNormal.details.player.damage,54,'Archère spéciale défendue toujours 54 dégâts');
const dodged=C.strike(ordinary,sChar('bagarreuse',target.stats,392),'special',ordinary.stats,target.stats,false,rng(0.1,0.01),1.0,true,3);
eq(dodged.dodged,true,'la spéciale peut toujours être esquivée');
eq(dodged.damage,0,'esquive annule les dégâts');
// Aucun changement à siphon/phase tour.
const siphon=C.resolveTurn(tank,sChar('epeiste',{force:10,rapidite:0,constitution:0},500),'special',{},high,{turn:3});
eq(siphon.effects.enemy.siphon.expiresTurn,6,'Siphon 4 tours préservé');
console.log('✅ V12.0.9 :',checks,'vérifications sur Griffes fatales, critiques, esquive, défense et non-régression');
