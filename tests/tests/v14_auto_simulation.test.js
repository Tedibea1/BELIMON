const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const ctx={window:{},console,Math,Date};vm.createContext(ctx);
for(const name of ['bonuses.js','combat.js','auto.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name),'utf8'),ctx);
const C=ctx.window.TDWCombat, A=ctx.window.BellymonAuto;
let seed=1234567;
function rng(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const orig=['epeiste','bagarreuse','archere_arcanique','occultiste','pretresse','griffeuse'];
const news=['vampire','spectre','nemesis','maudite','envouteuse','exorciste'];
const ids=[...orig,...news];
let fights=0,rounds=0,ended=0;
for(const c1 of ids)for(const c2 of ids){
 let hero={classId:c1,hp:280,maxHp:280,energy:100,stats:{force:60,rapidite:15,constitution:20}};
 let enemy={classId:c2,hp:280,maxHp:280,energy:100,stats:{force:60,rapidite:15,constitution:20}};
 let effects=C.normalizeEffects(),turn=0;
 for(let i=0;i<80;i++){
  const action=A.chooseAction(hero,enemy,turn+1,effects,rng);
  let enemyAct=C.chooseEnemyAction(enemy.energy,rng,enemy,turn+1,effects.enemy);
  const result=C.resolveTurn(hero,enemy,action,{},rng,{turn:turn+1,effects,enemyAction:enemyAct});
  hero=result.player;enemy=result.enemy;effects=result.effects;turn++;rounds++;
  assert(hero.hp>=0&&enemy.hp>=0&&hero.energy>=0&&enemy.energy>=0,'negative health/energy');
  assert(hero.hp<=hero.maxHp&&enemy.hp<=enemy.maxHp,'HP max exceeded');
  assert(hero.energy<=100&&enemy.energy<=100,'Energy cap exceeded');
  assert(Number.isFinite(hero.hp)&&Number.isFinite(enemy.hp),'numeric HP');
  if(result.result!=='fighting'){ended++;break;}
 }
 fights++;
}
console.log(`V14 AUTO : ${fights} affrontements, ${rounds} tours, ${ended} combats terminés, aucune exception`);
