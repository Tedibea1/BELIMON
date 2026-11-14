const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{},Math,Date,console};vm.createContext(context);
for(const f of ['bonuses.js','combat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),context,{filename:f});
const C=context.window.TDWCombat;let checks=0;
function eq(actual,expected,msg){assert.equal(actual,expected,msg);checks++}
const person=(cls='epeiste',rap=20,force=100,cons=0)=>({classId:cls,stats:{force,rapidite:rap,constitution:cons},hp:2000,maxHp:2000,energy:100});
function random(...values){let i=0;const r=()=>{if(i>=values.length)throw Error('Jet supplémentaire inattendu');return values[i++]};r.calls=()=>i;return r}
const hit=(p,e,action,r,forced=false)=>C.strike(p,e,action,p.stats,e.stats,false,r,action==='special'&&forced?1:null,forced,2);
for(let rap=0;rap<=250;rap++){
  const expected=Math.min(100,Math.floor(rap/2));
  eq(C.combatChances({rapidite:rap}).critical,expected,`RAP=${rap} crit`);
  eq(C.combatChances({rapidite:rap}).dodge,expected,`RAP=${rap} esquive`);
  // La RAP adverse ne change en rien les deux probabilités ordinaires.
  eq(C.combatChances({rapidite:rap},{rapidite:0}).critical,expected,`RAP=${rap} crit avec adversaire plus lente`);
  eq(C.combatChances({rapidite:rap},{rapidite:999}).dodge,expected,`RAP=${rap} esquive avec adversaire plus rapide`);
}
for(const [rap,p] of [[0,0],[7,3],[14,7],[20,10],[30,15],[50,25],[100,50],[150,75],[199,99],[200,100],[500,100]]){
  eq(C.combatChances({rapidite:rap}).critical,p,`valeur publiée ${rap}`);
}
eq(C.ACTIONS.heavy.power,1.5,'attaque lourde conserve ×1,5');
eq(C.rapChance({rapidite:110},{rapidite:100}),55,'la précision lourde reste comparative');
eq(C.rapChance({rapidite:100},{rapidite:100}),50,'la précision lourde reste 50/50 à RAP égale');
eq(C.SPECIALS.griffeuse.description.includes('×2'),true,'Griffes fatales : description ×2');
eq(C.SPECIALS.griffeuse.description.includes('écart'),false,'Griffes fatales : plus de comparaison dans sa description');
eq(Object.hasOwn(C,'griffesHitChance'),false,'aucune précision comparative spéciale pour Griffes');
// Les attaques légères vérifient d'abord l'esquive, puis le critique.
{
 const p=person('epeiste',20),e=person('epeiste',20),r=random(.5,.099);
 const outcome=hit(p,e,'light',r);
 eq(outcome.dodged,true,'attaque esquivée à 9,9 % si cible RAP20 => 10 %');
 eq(outcome.damage,0,'pas de dégât sur esquive');eq(r.calls(),2,'pas de jet critique après esquive');
}
{
 const p=person('epeiste',20),e=person('epeiste',20),r=random(.5,.1,.099);
 const outcome=hit(p,e,'light',r);
 eq(outcome.dodged,false,'esquive ratée au seuil exact');
 eq(outcome.critical,true,'critique quand attaque réussit');
 eq(outcome.damage,200,'critique ordinaire ×2');
 eq(r.calls(),3,'précision normale, esquive, puis critique');
}
{
 const p=person('epeiste',20),e=person('epeiste',20),r=random(.5,.1,.1);
 const outcome=hit(p,e,'light',r);
 eq(outcome.critical,false,'pas de critique au seuil exact');eq(outcome.damage,100,'dégâts ordinaires inchangés');
}
// À RAP égale, pas de 50 % arbitraire (RAP=20 => 10 % et 10 %).
{
 const p=person('epeiste',20),e=person('epeiste',20),r=random(.5,.4,.4);
 const o=hit(p,e,'light',r);eq(o.damage,100,'RAP égales 20 : aucune esquive ni critique à 40 %');
}
// Griffes fatales a son propre contrôle de RAP depuis V15.2.
// Son test détaillé est dans v15_2_assassinat_griffes.test.js.
// Lourde : précision comparative de V15, puis critique RAP/2, SANS esquive ordinaire.
{
 const p=person('epeiste',100),e=person('epeiste',100),r=random(.49,.49);
 const o=hit(p,e,'heavy',r);eq(o.damage,300,'lourde ×1,5 puis critique ×2');
 eq(o.critical,true,'critique à RAP 100 = 50 %');eq(r.calls(),2,'précision + critique, jamais esquive');
}
{
 const p=person('epeiste',100),e=person('epeiste',200),r=random(.01,.99);
 const o=hit(p,e,'heavy',r);eq(o.miss,true,'lourde à −100 RAP manque malgré une esquive pas tirée');eq(r.calls(),1,'lourde échec : seul jet précision');
}
{
 const p=person('epeiste',200),e=person('epeiste',100),r=random(.99,0);
 const o=hit(p,e,'heavy',r);eq(o.damage,300,'lourde +100 : touche avec critique 100 %');
 eq(r.calls(),2,'lourde ne demande pas de deuxième esquive');
}
// Bonus collection + pièges : les RAP effectives sont prises en compte sans nerf.
{
 const p=person('griffeuse',20),e=person('epeiste',20);
 const base=C.combatStats(p,{}),boost=C.combatStats(p,{rapidite:24}),trap=C.combatStats(p,{rapidite:24},{},{rapidite:0.5});
 eq(base.rapidite,20,'RAP de départ');eq(boost.rapidite,68,'+24 niveaux de bonus = +48 RAP');
 eq(trap.rapidite,58,'piège -50 % RAP personnelle, ne retire pas les 48 de collection');
 eq(C.combatChances(boost).critical,34,'crit avec bonus 68/2');eq(C.combatChances(trap).dodge,29,'esquive avec piège et collection');
 eq(C.combatChances(C.combatStats(e,{})).critical,10,'PNJ ne bénéficie pas de la collection joueuse');
}
// La parité PNJ, l'intangibilité et le coût des Griffes sont couverts dans
// v15_2_assassinat_griffes.test.js ; le reste des règles V15.1 reste inchangé.
console.log(`V15.1 FURRY CRIT/ESQ : ${checks} validations réussies`);
