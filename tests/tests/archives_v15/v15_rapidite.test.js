/* BELLYMON V15 — formule de Rapidité unique pour les deux camps. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={window:{},console,Math,Date};vm.createContext(ctx);
for(const f of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),ctx,{filename:f});
const C=ctx.window.TDWCombat;
let checks=0;
const eq=(a,b,msg)=>{assert.equal(a,b,msg);checks++};
const yes=(a,msg)=>{assert.ok(a,msg);checks++};
const make=(id='epeiste',rap=100,force=100)=>({classId:id,stats:{force,rapidite:rap,constitution:0},energy:100,hp:5000,maxHp:5000});
function gen(...rolls){let i=0;const fn=()=>{if(i>=rolls.length)throw Error('Tirage supplémentaire non prévu');return rolls[i++]};fn.count=()=>i;return fn}
const strike=(a,d,action,rng,forcedCrit=false,griffesChance=null)=>C.strike(a,d,action,a.stats,d.stats,false,rng,forcedCrit?1:null,forcedCrit,forcedCrit?3:2,1,false,griffesChance);
// Tous les seuils du tableau, limites extrêmes, et écarts intermédiaires.
for(let delta=-150;delta<=150;delta++){
 const p=Math.min(100,Math.max(0,50+delta/2));
 const a={rapidite:200+delta},d={rapidite:200};
 eq(C.rapChance(a,d),p,`tableau Δ=${delta}`);
 eq(C.rapChance(d,a),100-p,`symétrie Δ=${delta}`);
 eq(C.combatChances(a,d).critical,p,`critique Δ=${delta}`);
 eq(C.combatChances(a,d).dodge,p,`esquive Δ=${delta}`);
 eq(C.griffesHitChance(a,d),p,`griffes Δ=${delta}`);
}
for(const [delta,p] of [[-100,0],[-90,5],[-80,10],[-70,15],[-60,20],[-50,25],[-40,30],[-30,35],[-20,40],[-10,45],[0,50],[10,55],[20,60],[30,65],[40,70],[50,75],[60,80],[70,85],[80,90],[90,95],[100,100]]){
 eq(C.rapChance({rapidite:100+delta},{rapidite:100}),p,`ligne publiée Δ=${delta}`);
}
eq(C.ACTIONS.heavy.power,1.5,'lourde : multiplicateur ×1,5');
eq(C.ACTIONS.light.power,1,'légère : multiplicateur ×1');
// Lourde à RAP égale : 1 jet précision + 1 jet de critique, mais pas de 2e jet esquive.
{
 const r=gen(.49,.99),s=strike(make(),make(), 'heavy', r);
 eq(s.damage,150,'lourde réussie sans critique : Force ×1,5');
 eq(s.critical,false,'pas de critique à 99 %');eq(s.dodged,false,'pas de double esquive');
 eq(r.count(),2,'un jet de précision et un de critique');
}
{
 const r=gen(.5),s=strike(make(),make(),'heavy',r);
 eq(s.miss,true,'lourde : échec exact à 50 %');eq(s.damage,0,'aucun dégât si ratée');
 eq(r.count(),1,'pas de jet supplémentaire après un échec de précision');
}
{
 const r=gen(.49,.49),s=strike(make(),make(),'heavy',r);
 eq(s.damage,300,'lourde critique : ×1,5 puis critique ×2');eq(s.critical,true,'critique selon 50/50');
}
for(const delta of [-125,-100,-50,0,50,100,125]){
 const chance=C.rapChance({rapidite:200+delta},{rapidite:200});
 if(chance===0){const s=strike(make('epeiste',200+delta),make('epeiste',200),'heavy',gen(0));eq(s.miss,true,`lourde à 0 % Δ${delta}`)}
 else{const r=gen(Math.max(0,chance/100-.001),.999);const s=strike(make('epeiste',200+delta),make('epeiste',200),'heavy',r);
  eq(s.miss,false,`lourde sous le seuil Δ${delta}`);eq(r.count(),2,`pas de double jet Δ${delta}`);
 }
 if(chance<100){const s=strike(make('epeiste',200+delta),make('epeiste',200),'heavy',gen(chance/100));eq(s.miss,true,`lourde au-dessus du seuil Δ${delta}`)}
}
// Esquive comparative : légère et autre spéciale permettent une esquive ordinaire.
{
 const a=make('epeiste',100),d=make('epeiste',100);const r=gen(.1,.49);
 const s=strike(a,d,'light',r);eq(s.dodged,true,'légère esquivée à 50 %');eq(r.count(),2,'légère : précision + esquive, pas de critique après esquive');
}
{
 const a=make('epeiste',100),d=make('epeiste',100);const r=gen(.1,.5,.49);
 const s=strike(a,d,'light',r);eq(s.dodged,false,'aucune esquive au-dessus de 50 %');eq(s.critical,true,'critique après attaque réussie');eq(s.damage,200,'légère critique ×2');eq(r.count(),3,'précision + esquive + critique');
}
{
 const a=make('archere_arcanique',100),d=make('epeiste',100);const r=gen(.1,.49);
 const s=C.strike(a,d,'special',a.stats,d.stats,false,r,1.7);eq(s.dodged,true,'spéciale classique : esquive ordinaire comparative');
}
{
 const a=make('epeiste',0),d=make('epeiste',100),r=gen(.1,0);
 const s=strike(a,d,'light',r);eq(s.dodged,true,'+100 RAP défensive : esquive garantie');
}
{
 const a=make('epeiste',100),d=make('epeiste',0),r=gen(.1,0,.99);
 const s=strike(a,d,'light',r);eq(s.dodged,false,'−100 RAP défensive : aucune esquive');eq(s.critical,true,'+100 RAP offensive : critique garanti');
}
// Griffes fatales n'a ni deuxième esquive, ni jet de critique, et conserve ×3.
{
 const a=make('griffeuse',200),d=make('epeiste',100);const r=gen(.99);
 const s=strike(a,d,'special',r,true,C.griffesHitChance(a.stats,d.stats));
 eq(s.damage,300,'Griffes fatales : Force ×1,0, critique ×3');eq(s.critical,true,'critique forcé conservé');
 eq(r.count(),1,'Griffes : un seul jet de précision');
}
// Intangibilité du Spectre : priorité à la protection, même contre une attaque à précision maximale.
{
 const a=make('epeiste',200),d=make('spectre',100);const r=gen(.9);
 const s=C.strike(a,d,'heavy',a.stats,d.stats,false,r,null,false,2,1,true);
 eq(s.dodged,true,'intangibilité bloque même lourde 100 %');eq(s.damage,0,'aucun dégât sur intangible');eq(r.count(),1,'pas de critique sur intangible');
}
// Modificateurs effectifs et bonification de collection : seule la joueuse obtient ses propres bonus.
{
 const p=make('griffeuse',100),e=make('epeiste',120);
 const pStats=C.combatStats(p,{rapidite:20}),eStats=C.combatStats(e,{});
 eq(pStats.rapidite,140,'20 niveaux de collection : +40 RAP');eq(eStats.rapidite,120,'PNJ : pas de bonus joueur');
 eq(C.rapChance(pStats,eStats),60,'bonus intégré au tableau comparatif');
 const trap=C.combatStats(p,{rapidite:20},{},{rapidite:.5});
 eq(trap.rapidite,90,'piège réduit seulement la Rapidité personnelle, pas le bonus collection');
 eq(C.rapChance(trap,eStats),35,'piège influe sur la précision');
}
// Combat complet et parité PNJ, y compris le coefficient lourd et la puissance critique.
{
 const x=C.resolveTurn(make('epeiste',100,100),make('epeiste',100,100),'heavy',{},gen(.1,.49),{enemyAction:'defend'});
 eq(x.details.player.damage,150,'combat réel : critique lourd ×1,5 ×2 et défense /2');
 eq(x.details.player.critical,true,'combat réel : critique');
}
{
 const x=C.resolveTurn(make('epeiste',0),make('epeiste',100),'defend',{},gen(.1,.49),{enemyAction:'heavy'});
 eq(x.details.enemy.damage>0,true,'PNJ rapide utilise la lourde comparative');
 eq(x.details.enemy.critical,true,'PNJ rapide critique selon écart RAP');
}
// Combat complet : l'ordre d'initiative n'affecte pas la formule d'esquive.
{
 const x=C.resolveTurn(make('epeiste',100),make('epeiste',0),'light',{},()=>0,{enemyAction:'defend'});
 yes(x.details.player.damage>0,'joueuse très rapide : légère non esquivée');
 yes(x.details.player.critical,'joueuse très rapide : critique garanti si touché');
}
console.log(`V15 RAPIDITÉ : ${checks} contrôles réussis`);
