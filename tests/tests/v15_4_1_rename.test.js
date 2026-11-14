const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const ctx={window:{},console,Math,Date};vm.createContext(ctx);
for(const file of ['bonuses.js','traps.js','combat.js','combat-ui.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),ctx,{filename:file});
const C=ctx.window.TDWCombat, UI=ctx.window.BellymonCombatUI;
let checks=0;
function equal(a,b,message){assert.equal(a,b,message);checks++;}
function ok(value,message){assert.ok(value,message);checks++;}
equal(C.SPECIALS.spectre.name,'Frappe spectrale','Nom officiel de la compétence');
ok(!C.SPECIALS.spectre.description.includes('Frappe invisible'),'Ancien nom absent');
ok(C.SPECIALS.spectre.description.includes('×1,5'),'Coefficient ×1,5 conservé');
const c=(id,rap)=>({classId:id,stats:{force:10,rapidite:rap,constitution:20},hp:300,maxHp:300,energy:100});
const battle=C.resolveTurn(c('spectre',40),c('epeiste',10),'special',{},()=>.8,{enemyAction:'defend',turn:1});
ok(battle.summary.includes('Frappe spectrale'),'Journal de combat renommé');
equal(battle.effects.player.intangible.startTurn,1,'Activation au tour de lancement inchangée');
equal(battle.effects.player.intangible.expiresTurn,2,'Deux tours intangibles inchangés');
equal(battle.effects.player.spectreReadyTurn,4,'Cooldown inchangé');
equal(battle.player.energy,80,'Coût énergie inchangé');
const badges=UI.describe({turn:1,effects:battle.effects},1,[]).sides.player;
ok(badges.some(x=>x.label.includes('Intangible')&&x.detail.includes('Frappe spectrale')),'Infobulle renommée');
const fail=C.resolveTurn(c('epeiste',40),c('spectre',10),'light',{},()=>.5,{enemyAction:'special',turn:1});
ok(fail.details.player.dodged,'Intangibilité fonctionne chez PNJ');
ok(fail.summary.includes('Frappe spectrale'),'Journal ennemi renommé');
const ui=fs.readFileSync(path.join(root,'js','combat-ui.js'),'utf8'),combat=fs.readFileSync(path.join(root,'js','combat.js'),'utf8');
ok(!ui.includes('Frappe invisible')&&!combat.includes('Frappe invisible'),'Ancien nom absent des sources actives');
console.log('V15.4.1 : '+checks+' contrôles réussis');
