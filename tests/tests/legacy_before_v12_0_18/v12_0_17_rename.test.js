/* V12.0.17: rename displayed skill while preserving saved-effect semantics. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};
vm.createContext(context);
for (const file of ['bonuses.js','traps.js','combat.js','combat-ui.js']) {
  vm.runInContext(fs.readFileSync(`${__dirname}/../js/${file}`,'utf8'),context,{filename:file});
}
const C=context.window.TDWCombat, UI=context.window.BellymonCombatUI;
assert.equal(C.SPECIALS.bagarreuse.name,'Absorption');
assert.equal(C.SPECIALS.bagarreuse.description.includes('3 énergies par seconde'),true);
const make=(id,energy=100)=>({classId:id,stats:{force:50,rapidite:0,constitution:30},maxHp:500,hp:500,energy});
const round=C.resolveTurn(make('bagarreuse'),make('epeiste',0),'special',{},()=>.99,{turn:1});
assert.match(round.summary,/Absorption active pendant 4 tours : −3 EN\/s/);
assert.match(round.summary,/Absorption/);
assert.equal(round.effects.enemy.siphon.expiresTurn,4);
assert.equal(round.player.energy,95);
const effectView=UI.describe({turn:1,effects:round.effects},1,[]);
assert.match(effectView.sides.enemy[0].label,/Absorption · 3 t\./);
assert.match(effectView.sides.enemy[0].detail,/Absorption : −3 énergies/);
let fx=round.effects, victim=round.enemy;
C.tickTimedEffects(fx,round.player,victim,1000,2);
C.tickTimedEffects(fx,round.player,victim,2000,2);
assert.equal(victim.energy,0,'victim already at zero remains at zero');
const renew=C.resolveTurn(round.player,make('epeiste',0),'special',{},()=>.99,{turn:2,effects:round.effects});
assert.equal(renew.effects.enemy.siphon.expiresTurn,5);
assert.equal(renew.effects.enemy.siphon!==null,true);
console.log('✅ V12.0.17 renommage Absorption : 11 contrôles réussis');
