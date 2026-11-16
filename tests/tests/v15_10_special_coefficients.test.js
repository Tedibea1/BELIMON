const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={window:{},console,Math,Date};vm.createContext(ctx);
for(const f of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../js',f),'utf8'),ctx,{filename:f});
const C=ctx.window.TDWCombat;
const cases=[['epeiste',2],['bagarreuse',0.5],['archere_arcanique',1.7],['occultiste',1],['griffeuse',1.5],['vampire',1.5],['spectre',1.3],['maudite',0.5],['envouteuse',1]];
const hero=(id,s={})=>({classId:id,hp:5000,maxHp:10000,energy:100,stats:{force:s.force??100,rapidite:s.rapidite??100,constitution:s.constitution??0}});
let checks=0;
const eq=(got,want,label)=>{assert.equal(got,want,label);checks++};
for(const [id,mult] of cases){
 const s=C.resolveTurn(hero(id),hero('pretresse',{force:30,rapidite:0}),'special',{},()=>.99,{turn:1,enemyAction:'light'});
 const damage=Math.round(100*mult)*(id==='griffeuse'?2:1);
 eq(s.details.player.damage,damage,id+' player damage');
 eq(C.SPECIALS[id].description.startsWith('Force ×'+(id==='envouteuse'?'1,0':Number.isInteger(mult)?String(mult):String(mult).replace('.',','))+' ·'),true,id+' description');
 eq(s.player.energy,95,id+' player energy');
 const e=C.resolveTurn(hero('pretresse',{force:0,rapidite:0}),hero(id),'defend',{},()=>.99,{turn:1,enemyAction:'special'});
 eq(e.details.enemy.damage,Math.round(damage/2),id+' enemy damage');
 eq(e.enemy.energy,95,id+' enemy energy');
 if(id==='griffeuse'){eq(s.details.player.critical,true,'forced crit player');eq(e.details.enemy.critical,true,'forced crit enemy');}
 if(id==='vampire')eq(s.player.hp>5000,true,'lifesteal preserved');
 if(id==='archere_arcanique')eq(s.effects.enemy.swordCons,true,'archer armor debuff preserved');
 if(id==='epeiste')eq(s.effects.enemy.swordCons,false,'swordswoman no longer applies armor debuff');
 if(id==='bagarreuse')eq(s.effects.enemy.siphon.expiresTurn,4,'energy drain preserved');
 if(id==='occultiste')eq(s.effects.enemy.curse.expiresTurn,5,'curse preserved');
 if(id==='spectre')eq(s.effects.player.intangible.expiresTurn,2,'intangibility preserved');
 if(id==='maudite')eq(s.effects.enemy.bloodCurse.startTurn,2,'blood curse preserved');
 if(id==='envouteuse')eq(s.effects.enemy.powerLoss.amount,6,'20% force steal (30 FOR) preserved');
}
eq(C.COST.special,5,'special cost unchanged');
eq(C.ACTIONS.heavy.power,1.5,'heavy unchanged');
const p=C.resolveTurn(hero('pretresse',{force:0}),hero('pretresse',{force:0,rapidite:0}),'special',{},()=>.99,{turn:1,enemyAction:'defend'});
eq(p.details.player.heal,4000,'priest heal unchanged');
console.log('OK V15.10 : '+checks+' tests.');
