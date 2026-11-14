const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const ctx={window:{},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/evolution.js'),'utf8'),ctx);
const E=ctx.window.BellymonEvolution;
const classes={vampire:[20,20,20,130],spectre:[10,40,10,110],nemesis:[20,10,30,160],maudite:[20,10,30,160],envouteuse:[20,20,20,130],exorciste:[20,20,20,130]};
const specs=Object.fromEntries(Object.entries(classes).map(([id,[force,rapidite,constitution,hp]])=>[id,{stats:{force,rapidite,constitution},hp}]));
let checks=0;
for(const [id,cls] of Object.entries(specs))for(const morph of ['musclee','obese','chetive']){
 const hero={id,classId:id,rank:'E',morph:null,evolutionPoints:95,stats:{force:Math.round(cls.stats.force*.68),rapidite:Math.round(cls.stats.rapidite*.68),constitution:Math.round(cls.stats.constitution*.68)},maxHp:Math.round(cls.hp*.68),hp:Math.round(cls.hp*.68),energy:100};
 const {hero:grown,plan}=E.applyFeed(hero,{small:1,large:0},'small',1,morph,specs);
 assert(plan.rankAfter==='D'&&grown.rank==='D');checks++;
 assert(grown.morph===morph);checks++;
 assert(grown.maxHp===Math.round(cls.hp*.82));checks++;
 for(const key of ['force','rapidite','constitution']){assert(grown.stats[key]===Math.round(cls.stats[key]*.82)+E.MORPH_BONUSES[morph][key]);checks++;}
}
console.log(`V14 EVOLUTION : ${checks} contrôles réussis`);
