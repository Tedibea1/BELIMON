const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{},Math};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../js/evolution.js','utf8'),c);
const E=c.window.BellymonEvolution;
let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(JSON.parse(JSON.stringify(a)),b,label);checks++;};
const ok=(cond,label)=>{assert.ok(cond,label);checks++;};
const throws=(fn,label)=>{assert.throws(fn,undefined,label);checks++;};
const classes={epeiste:{stats:{force:30,rapidite:10,constitution:20},hp:120},bagarreuse:{stats:{force:20,rapidite:10,constitution:30},hp:160},archere_arcanique:{stats:{force:40,rapidite:10,constitution:10},hp:100},occultiste:{stats:{force:10,rapidite:30,constitution:20},hp:100},pretresse:{stats:{force:20,rapidite:20,constitution:20},hp:130},griffeuse:{stats:{force:20,rapidite:30,constitution:10},hp:110}};
const hero=(rank='E',morph=null,points=0,cls='epeiste')=>({id:'sample',classId:cls,rank,morph,evolutionPoints:points,stats:{force:20,rapidite:7,constitution:14},maxHp:82,hp:82,energy:65,injuredUntil:0});
const stash=(small=100,large=50)=>({small,large});
eq(E.RANKS,['E','D','C','B','A','S'],'six ranks');
eq(E.TARGETS,{E:100,D:180,C:260,B:380,A:520},'approved thresholds');
eq(E.MULTIPLIERS,{E:0.68,D:0.82,C:1,B:1.35,A:1.8,S:2.45},'approved coefficients');
eq(E.FOOD_POINTS,{small:5,large:25},'approved food');
for(const [morph,bonus] of [['musclee',{force:6,rapidite:2,constitution:4}],['obese',{force:4,rapidite:2,constitution:6}],['chetive',{force:4,rapidite:6,constitution:2}]])eq(E.MORPH_BONUSES[morph],bonus,'bonus '+morph);
let p=E.planFeed(hero('D','musclee',150),stash(),'small',10);
eq([p.consumed,p.returned,p.remaining,p.rankAfter,p.evolves],[6,4,0,'C',true],'150/180 + 10 small -> 6 consumed 4 returned');
let x=E.applyFeed(hero('D','musclee',150),stash(),'small',10,undefined,classes);
eq(x.food.small,94,'only 6 steaks debited');eq(x.hero.rank,'C','rank C reached');eq(x.hero.evolutionPoints,0,'C gauge reset');
p=E.planFeed(hero('D','musclee',170),stash(),'large',5);
eq([p.consumed,p.returned,p.remaining,p.rankAfter],[1,4,15,'C'],'170/180 + large -> 15 carry, 4 returned');
x=E.applyFeed(hero('D','musclee',170),stash(),'large',5,undefined,classes);
eq(x.hero.evolutionPoints,15,'carry 15 into C');eq(x.food.large,49,'gigot only 1 consumed');
p=E.planFeed(hero('E',null,0),stash(),'small',50);
eq([p.consumed,p.returned,p.remaining,p.rankAfter,p.morphRequired],[20,30,0,'D',true],'E 50 small one rank only, 30 returned');
throws(()=>E.applyFeed(hero(),stash(),'small',20,null,classes),'cannot morph E without choice');
for(const morph of ['musclee','obese','chetive']){
 let h=hero();h.stats={force:20,rapidite:7,constitution:14};
 const prior=JSON.stringify(h),food=stash(50,12),priorFood=JSON.stringify(food);
 let result=E.applyFeed(h,food,'small',20,morph,classes);
 eq(result.hero.rank,'D','rank D '+morph);
 eq(result.hero.morph,morph,'morph saved '+morph);
 eq(result.hero.stats,{force:Math.round(30*.82)+E.MORPH_BONUSES[morph].force,rapidite:Math.round(10*.82)+E.MORPH_BONUSES[morph].rapidite,constitution:Math.round(20*.82)+E.MORPH_BONUSES[morph].constitution},'stats rank D '+morph);
 eq(result.hero.maxHp,98,'HP rank D per class only');
 eq(result.hero.energy,65,'EN preserved '+morph);
 eq(JSON.stringify(h),prior,'input hero not mutated '+morph);
 eq(JSON.stringify(food),priorFood,'input inventory not mutated '+morph);
}
// Every stage / every specialization / all six classes, rank-base coefficient excludes flat boni.
for(const cls of Object.keys(classes)){
 for(const morph of ['musclee','obese','chetive']){
  for(let i=0;i<5;i++){
   const from=E.RANKS[i],to=E.RANKS[i+1],point=E.TARGETS[from]-5;
   const h=hero(from,from==='E'?null:morph,point,cls);
   const food=stash(1,1);
   let result=E.applyFeed(h,food,'small',1,morph,classes);
   const coef=E.MULTIPLIERS[to],steps=i+1;
   eq(result.hero.rank,to,`${cls} ${morph} ${from}->${to}`);
   for(const stat of ['force','rapidite','constitution'])
    eq(result.hero.stats[stat],Math.round(classes[cls].stats[stat]*coef)+steps*E.MORPH_BONUSES[morph][stat],`${cls} ${morph} ${to} ${stat}`);
   eq(result.hero.maxHp,Math.round(classes[cls].hp*coef),`HP ${cls} ${morph} ${to}`);
  }
 }
}
// One step max even with lots of available food.
let r=E.applyFeed(hero('C','obese',259),stash(100,100),'large',100,undefined,classes);
eq(r.hero.rank,'B','one rank per feed');eq(r.food.large,99,'one big food enough');eq(r.hero.evolutionPoints,24,'24 carries');
throws(()=>E.planFeed(hero('S','obese'),stash(),'small',1),'S rank max');
for(const [type,quantity,food] of [['small',0,stash()],['small',-1,stash()],['small',.3,stash()],['large',3,stash(0,2)],['unknown',1,stash()],['small',2,stash(1,9)]])throws(()=>E.planFeed(hero(),food,type,quantity),`invalid ${type} ${quantity}`);
let hurt=hero('D','musclee',175);hurt.hp=41;hurt.maxHp=82;hurt.injuredUntil=Date.now()+18000;
r=E.applyFeed(hurt,stash(),'small',1,null,classes);
eq(r.hero.hp,Math.round(41/82*120),'relative HP preserved, no full heal');
eq(r.hero.injuredUntil,hurt.injuredUntil,'injury timer preserved');
hurt.hp=0;r=E.applyFeed(hurt,stash(),'small',1,null,classes);eq(r.hero.hp,0,'KO does not revive on rank up');
console.log(`✅ ${checks} tests unitaires V7 réussis`);
