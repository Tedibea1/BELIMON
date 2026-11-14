const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
const context={window:{},console,Date,Math}; vm.createContext(context);
for(const f of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),context,{filename:f});
const C=context.window.TDWCombat;let checks=0;
const eq=(a,b,msg)=>{assert.equal(a,b,msg);checks++};
const unit=(cls='griffeuse',rap=20,force=60,cons=0)=>({classId:cls,stats:{force,rapidite:rap,constitution:cons},hp:2000,maxHp:2000,energy:100});
function random(...values){let i=0;const f=()=>{if(i>=values.length)throw Error('RNG inattendu #'+(i+1));return values[i++]};f.calls=()=>i;return f}
const direct=(a,b,r)=>C.strike(a,b,'special',a.stats,b.stats,false,r,1,true,2);
const turn=(a,b,playerAction,enemyAction,r,ctx={})=>C.resolveTurn(a,b,playerAction,ctx.bonuses||{},r,{enemyAction,turn:1,...ctx});
// Reproduction de la formule exacte d'Assassinat (hors cas 0), pour chaque valeur entière RAP.
for(let rap=1;rap<=128;rap++)for(let opp=0;opp<=128;opp++){
 const want=Math.min(100,Math.max(0,50+100*((rap-opp)/rap)));
 eq(C.griffesAssassinationChance({rapidite:rap},{rapidite:opp}),want,`test RAP ${rap} / ${opp}`);
}
for(const [a,b,c] of [[20,5,100],[20,7,100],[20,10,100],[20,15,75],[20,18,60],[20,20,50],[20,25,25],[20,30,0],[100,50,100],[100,100,50],[100,150,0],[0,0,50],[0,5,0],[20,0,100]]){
 eq(C.griffesAssassinationChance({rapidite:a},{rapidite:b}),c,`valeurs Furry RAP ${a}:${b}`);
}
// Les trois probabilités = jet spécial puis esquive RAP/2 ; sur réussite le crit est systématique.
{
 const o=direct(unit('griffeuse',20),unit('epeiste',7),random(.999,.029));
 eq(o.dodged,true,'RAP 20 vs 7 : esquive 2.9 %');eq(o.damage,0,'esquive = 0 dégât');
}
{
 const r=random(.999,.03),o=direct(unit('griffeuse',20),unit('epeiste',7),r);
 eq(o.miss,false,'test spécial réussi');eq(o.dodged,false,'esquive rate au seuil 3 %');
 eq(o.critical,true,'critique garanti après les deux jets');eq(o.damage,120,'×2, pas ×3');
 eq(r.calls(),2,'exactement deux jets, aucune précision 100 % ou critique supplémentaire');
}
{
 const r=random(.5),o=direct(unit('griffeuse',20),unit('epeiste',20),r);
 eq(o.miss,true,'à RAP égale, 50 % de réussite au test spécial');eq(r.calls(),1,'si échec au premier test, aucun jet esquive');
}
{
 const r=random(.499,.1),o=direct(unit('griffeuse',20),unit('epeiste',20),r);
 eq(o.critical,true,'à RAP égale le coup peut passer');eq(o.damage,120,'critique ×2 si réussi');eq(r.calls(),2,'1er jet test spécial, 2e esquive');
}
{
 const r=random(.0),o=direct(unit('griffeuse',20),unit('epeiste',30),r);
 eq(o.miss,true,'+50 % de RAP cible => chance nulle');eq(r.calls(),1,'aucune esquive en cas de raté');
}
{
 const r=random(.999,.09),o=direct(unit('griffeuse',20),unit('epeiste',20),r);
 eq(o.miss,true,'50 % : même un jet très haut rate');eq(r.calls(),1,'pas d’esquive après un raté');
}
// Chance réelle = réussite spéciale * (1 - esquive adverse) pour tous les RAP et valeurs exemples.
for(const [a,b,hit] of [[20,7,97],[20,10,95],[20,15,69.75],[20,20,45],[20,25,22],[20,30,0]]){
 const special=C.griffesAssassinationChance({rapidite:a},{rapidite:b});
 const evade=C.combatChances({rapidite:b}).dodge;
 eq(special*(100-evade)/100,hit,`taux réel ${a} vs ${b}`);
}
// La collection et les malus affectent RAP effective, sans modifier le calcul d'origine.
{
 const a=unit('griffeuse',20);const base=C.combatStats(a,{}),plus=C.combatStats(a,{rapidite:5}),trap=C.combatStats(a,{rapidite:5},{},{rapidite:.5});
 eq(base.rapidite,20,'RAP initiale');eq(plus.rapidite,30,'collection : +10 RAP');eq(trap.rapidite,20,'piège réduit RAP personnelle mais pas bonus collection');
 eq(C.griffesAssassinationChance(plus,{rapidite:20}),83.33333333333333,'collection augmente la chance de 50 % à 83,33 %');
 eq(C.griffesAssassinationChance(trap,{rapidite:20}),50,'RAP après piège réduit la chance');
}
// Deux camps : strictement la même règle, même si le PNJ lance Griffes fatales.
{
 const p=unit('griffeuse',20),e=unit('epeiste',7),r=random(.1,.9);
 const s=turn(p,e,'special','defend',r);
 eq(s.details.player.damage,60,'joueur : critique ×2 puis défense ×0.5');eq(s.details.player.critical,true,'joueur critique');
 eq(s.player.energy,80,'coût en énergie inchangé');eq(r.calls(),2,'un jet spécial + esquive pour joueuse');
}
{
 const p=unit('epeiste',7),e=unit('griffeuse',20),r=random(.1,.9);
 const s=turn(p,e,'defend','special',r);
 eq(s.details.enemy.damage,60,'PNJ : critique ×2 puis défense ×0.5');eq(s.details.enemy.critical,true,'PNJ critique');
 eq(s.enemy.energy,80,'PNJ paie les 20 EN');eq(r.calls(),2,'un jet spécial + esquive pour PNJ');
}
// À RAP égale de 20, le critique ordinaire n'est que 10 % et l'esquive 10 %.
eq(C.combatChances({rapidite:20}).critical,10,'règle RAP/2 crit conservée');
eq(C.combatChances({rapidite:20}).dodge,10,'règle RAP/2 esquive conservée');
// La précision lourde de V15 n'est pas remplacée par celle de Furry.
eq(C.ACTIONS.heavy.power,1.5,'lourde toujours ×1,5');
eq(C.rapChance({rapidite:20},{rapidite:20}),50,'lourde reste à 50 % à RAP égale');
{
 const r=random(.5),o=C.strike(unit('epeiste',20),unit('epeiste',20),'heavy',{rapidite:20,force:60,constitution:0},{rapidite:20,force:60,constitution:0},false,r);
 eq(o.miss,true,'lourde : échec au seuil de 50 %');eq(r.calls(),1,'lourde toujours un seul jet sans esquive supplémentaire');
}
// Intangibilité du Spectre garde sa protection avant toute blessure.
{
 const fx=C.normalizeEffects();fx.enemy.intangible={startTurn:1,expiresTurn:1};
 const s=turn(unit('griffeuse',20),unit('spectre',7),'special','defend',random(.1),{effects:fx});
 eq(s.details.player.dodged,true,'intangibilité bloque même si premier test réussi');eq(s.details.player.damage,0,'0 dégât contre intangibilité');
}
eq(C.SPECIALS.griffeuse.description.includes('×2'),true,'description mentionne critique ×2');
eq(C.SPECIALS.griffeuse.description.includes('Assassinat'),true,'description mentionne la mécanique');
console.log(`V15.2 GRIFFES FATALES / ASSASSINAT : ${checks} vérifications réussies`);
