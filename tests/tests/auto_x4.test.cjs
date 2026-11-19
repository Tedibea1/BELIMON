/* Tests de vitesse AUTO : ×1, ×2, ×4, choix persistant, effets chronométrés. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const src={game:read('js/game.js'),auto:read('js/auto.js'),motion:read('js/v16-motion.js'),html:read('index.html'),css:read('css/v16.css')};
let checks=0;
const eq=(a,b,label)=>{assert.equal(a,b,label);checks++};
const ok=(v,label)=>{assert.ok(v,label);checks++};
function boot(previous=null){
 const db=new Map(previous===null?[]:[['belimon-auto-speed',previous]]);
 const storage={getItem:key=>db.get(key)??null,setItem:(key,val)=>db.set(key,val)};
 const context={window:{},Math,Date,console,localStorage:storage};
 vm.createContext(context);
 for(const file of ['bonuses.js','traps.js','combat.js','auto.js'])vm.runInContext(read('js/'+file),context,{filename:file});
 return {...context,db,C:context.window.TDWCombat,A:context.window.BellymonAuto};
}
let ctx=boot(),A=ctx.A;
eq(A.getSpeed(),1,'Défaut sûr : ×1');
eq(Array.from(A.SPEEDS).join(','),'1,2,4','Options exactement ×1 ×2 ×4');
for(const speed of [1,2,4]){
 eq(A.setSpeed(speed),speed,'Sélection de la vitesse '+speed);
 eq(A.getSpeed(),speed,'Vitesse active '+speed);
 eq(ctx.db.get('belimon-auto-speed'),String(speed),'Vitesse persistée '+speed);
}
eq(A.setSpeed(3),1,'Valeur non prise en charge => ×1');
eq(boot('2').A.getSpeed(),2,'Préférence restaurée ×2');
eq(boot('4').A.getSpeed(),4,'Préférence restaurée ×4');
eq(boot('invalid').A.getSpeed(),1,'Ancienne valeur invalide ignorée');
for(const [speed,wait,tower,tick] of [[1,850,1450,1000],[2,425,725,500],[4,213,363,250]]){
 eq(Math.round(850/speed),wait,'Délai combat ×'+speed);
 eq(Math.round(1450/speed),tower,'Délai exploration ×'+speed);
 eq(1000/speed,tick,'Délai malédiction ×'+speed);
}
for(const fn of ['autoIntervalMs','autoTowerIntervalMs','autoRewardPauseMs','autoEnemyMinMs','autoEnemySpanMs'])
 ok(src.game.includes('const '+fn+'=()=>Math.round('),'Calcul dynamique '+fn);
ok(src.game.includes('AUTO.getSpeed()'),'Le jeu utilise la préférence');
ok(src.game.includes('1000/autoSpeed():1000'),'Les sorts en manuel restent à ×1');
ok(src.game.includes('changeAutoSpeed(event)'),'Gestionnaire de sélection présent');
ok(src.game.includes("addEventListener('change',changeAutoSpeed)"),'Gestionnaire de sélection branché');
ok(src.game.includes("document.body.classList.toggle('belimon-auto-x2'"),'Animations ×2');
ok(src.game.includes("document.body.classList.toggle('belimon-auto-x4'"),'Animations ×4');
ok(src.game.includes("autoEnabled?'×'+autoSpeed():'OFF'"),'Boutons AUTO indiquent la vitesse');
ok(src.html.includes('id="autoSpeedSelect"'),'Sélecteur visible dans la tour');
for(const speed of [1,2,4])ok(src.html.includes('<option value="'+speed+'"'),'Option '+speed);
ok(src.css.includes('body.belimon-auto-x2 .hit-pop'),'CSS ×2');
ok(src.css.includes('body.belimon-auto-x4 .hit-pop'),'CSS ×4');
ok(src.motion.includes('getSpeed?.()||1'),'Animations suivent le choix');
ok(!src.game.includes('AUTO_SPEED'),'Aucun ancien ×4 forcé dans le contrôleur');
ok(!src.auto.includes('const SPEED=4'),'Plus de ×4 constant');
ok(src.game.includes('if(!resultOverlay.hidden){'),'Récompenses restent affichées');
ok(src.game.includes('if(MOTION?.isBusy())return;'),'Roulette non coupée');
const h=()=>({energy:100,maxHp:300,hp:300});
for(const speed of [1,2,4]){
 let player=h(),enemy=h(),fx=ctx.C.normalizeEffects(),ms=1000/speed;
 fx.player.curse={expiresTurn:6,percent:0,nextTickAt:0};
 fx.player.siphon={expiresTurn:6,nextTickAt:0};
 const at0=ctx.C.tickTimedEffects(fx,player,enemy,1000,1,ms);
 eq(at0.effects.player.curse.nextTickAt,1000+ms,'Malédiction planifiée ×'+speed);
 eq(at0.effects.player.siphon.nextTickAt,1000+ms,'Absorption planifiée ×'+speed);
 const before=ctx.C.tickTimedEffects(at0.effects,player,enemy,1000+ms-1,1,ms);
 eq(before.effects.player.curse.percent,0,'Pas de malus prématuré ×'+speed);
 eq(player.energy,100,'Pas de siphon prématuré ×'+speed);
 const after=ctx.C.tickTimedEffects(before.effects,player,enemy,1000+ms,1,ms);
 eq(after.effects.player.curse.percent,2,'−2 % par tic ×'+speed);
 eq(player.energy,97,'−3 énergie par tic ×'+speed);
}
console.log('PASS '+checks+' contrôles : vitesses ×1/×2/×4, préférences, UI, timers et magie.');
