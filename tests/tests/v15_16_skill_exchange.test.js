'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../..');
const ctx={window:{},console,Math,Date};vm.createContext(ctx);
for(const file of ['bonuses.js','traps.js','combat.js','combat-ui.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),ctx,{filename:file});
const C=ctx.window.TDWCombat,UI=ctx.window.BellymonCombatUI;
const ch=(classId,{force=100,rapidite=100,constitution=0,hp=2000,maxHp=2000}={})=>({
 classId,stats:{force,rapidite,constitution},hp,maxHp,energy:100
});
const rng=()=>.99; // No ordinary criticals or dodge, deterministic outcomes.
const resolve=(p,e,pa='special',ea='light',turn=1,effects)=>C.resolveTurn(
 p,e,pa,{},rng,{turn,enemyAction:ea,effects}
);
let n=0;
const eq=(got,want,msg)=>{assert.equal(got,want,msg);n++};
eq(C.SPECIALS.epeiste.name,'Frappe dévastatrice','épee new spell name');
eq(C.SPECIALS.archere_arcanique.name,'Flèche perforante','archer new spell name');
eq(C.COST.special,5,'spell energy cost preserved');
eq(C.ACTIONS.heavy.power,1.5,'heavy attack unchanged');
const sword=resolve(ch('epeiste'),ch('bagarreuse',{force:0,rapidite:0}));
eq(sword.details.player.damage,200,'épee has original ×2 coefficient (no defense)');
eq(sword.effects.enemy.swordCons,false,'épee no longer applies armor debuff');
eq(sword.details.player.critical,false,'épee critical still ordinary and not guaranteed');
const arrow=resolve(ch('archere_arcanique'),ch('bagarreuse',{force:0,rapidite:0}));
eq(arrow.details.player.damage,170,'archer has original ×1.7 coefficient (no defense)');
eq(arrow.effects.enemy.swordCons,true,'archer applies −15% Constitution');
eq(C.penaltyFor(arrow.effects.enemy,2).constitution,0.15,'Constitution malus magnitude preserved');
eq(UI.describe({turn:1,effects:arrow.effects},1,[]).sides.enemy[0].detail.includes('Flèche perforante'),true,'active effect label updated');
const missed=resolve(ch('archere_arcanique'),ch('bagarreuse',{force:0,rapidite:200}));
eq(missed.details.player.dodged,true,'enemy can dodge arrow');
eq(missed.effects.enemy.swordCons,false,'missed arrow has no debuff');
const purified=resolve(ch('archere_arcanique'),ch('exorciste',{force:0,rapidite:0}),'special','special');
eq(purified.effects.enemy.purification.expiresTurn,5,'exorcist protection activates same turn');
eq(purified.effects.enemy.swordCons,false,'purification blocks arrow armor debuff');
const enemyArrow=resolve(ch('bagarreuse',{force:0,rapidite:0}),ch('archere_arcanique'),'defend','special');
eq(enemyArrow.details.enemy.damage,85,'NPC archer uses ×1.7 with player defending');
eq(enemyArrow.effects.player.swordCons,true,'NPC archer applies armor debuff');
const enemySword=resolve(ch('bagarreuse',{force:0,rapidite:0}),ch('epeiste'),'defend','special');
eq(enemySword.details.enemy.damage,100,'NPC épee uses ×2 with player defending');
eq(enemySword.effects.player.swordCons,false,'NPC épee has no armor debuff');
const guide=fs.readFileSync(path.join(root,'js/guide.js'),'utf8');
const combat=fs.readFileSync(path.join(root,'js/combat.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
eq(guide.includes("skill:'Flèche perforante'"),true,'Guide archer updated');
eq(guide.includes("skill:'Frappe dévastatrice'"),true,'Guide sword updated');
eq(combat.includes('Punition frénétique')||combat.includes('Flèche du cataclysme'),false,'obsolete names removed from combat');
eq(html.includes('BELLYMON · V16.0 LAB'),true,'version updated');
console.log('BELLYMON V15.16 : '+n+' vérifications des sorts échangés réussies.');
