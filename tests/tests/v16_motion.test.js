'use strict';
// Tests de l'interface V16 sans navigateur : la logique de révélation ne tire JAMAIS de butin.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.join(__dirname,'../..');
let count=0;
const eq=(a,b,msg)=>{assert.equal(a,b,msg);count++;};
const yes=(a,msg)=>{assert.ok(a,msg);count++;};
class ClassList {
 constructor(){this.set=new Set();}
 add(...s){s.forEach(x=>this.set.add(x));}
 remove(...s){s.forEach(x=>this.set.delete(x));}
 contains(s){return this.set.has(s);}
 toggle(s,force){const value=force===undefined?!this.set.has(s):!!force;value?this.set.add(s):this.set.delete(s);return value;}
}
class Element{
 constructor(tag='div'){
  this.tag=tag;this.children=[];this.dataset={};this.hidden=false;this.disabled=false;
  this.style={};this.attributes={};this.classList=new ClassList();this._events={};this._className='';
  this.parentElement=null;this.textContent='';this.offsetWidth=200;this._focus=false;
 }
 set className(s){this._className=s;this.classList.set=new Set(s.split(/\s+/).filter(Boolean));}
 get className(){return this._className;}
 append(...children){for(const child of children){this.children.push(child);if(child&&typeof child==='object')child.parentElement=this;}}
 replaceChildren(...children){this.children=[];this.append(...children);}
 setAttribute(key,val){this.attributes[key]=String(val);}
 getAttribute(key){return this.attributes[key]??null;}
 addEventListener(kind,listener){(this._events[kind]??=[]).push(listener);}
 click(){for(const fn of this._events.click||[])fn({target:this});}
 querySelectorAll(query){const target=query.startsWith('.')?query.slice(1):query;const found=[];const walk=node=>{for(const child of node.children){if(child.classList?.contains(target))found.push(child);walk(child);}};walk(this);return found;}
 querySelector(query){return this.querySelectorAll(query)[0]||null;}
 focus(){this._focus=true;}
 remove(){if(this.parentElement){const i=this.parentElement.children.indexOf(this);if(i>=0)this.parentElement.children.splice(i,1);this.parentElement=null;}}
}
const ui=new Map();
for(const id of ['eventResultOverlay','v16Showcase','v16RevealSkip','eventResultClose','v16MotionToggle','v16AutoSkipToggle',
  'floorLabel','sideFloor','paneTour','detailPortrait','detailEvolutionFill','waifuDetailOverlay',
  'bonusesGrid','shopOffers','shopWorking','hospitalBeds','hospitalWorking','activePortrait','eventEnemyPortrait'])ui.set(id,new Element());
ui.get('eventResultOverlay').hidden=false;
const arena=new Element();
const document={body:new Element(),readyState:'complete',getElementById:id=>ui.get(id)||null,
 createElement:tag=>new Element(tag),querySelector:query=>query==='.arena-cards'?arena:null};
const storedValues={'bellymon-v16-motion':'on'};const localStorage={getItem:key=>storedValues[key]??null,setItem:(key,v)=>{storedValues[key]=v;}};
let reduced=false;const window={matchMedia:()=>({matches:reduced,addEventListener(){}})};
const context={window,document,localStorage,requestAnimationFrame:cb=>cb(),setTimeout,clearTimeout,console};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT,'js/v16-motion.js'),'utf8'),context,{filename:'js/v16-motion.js'});
const Motion=window.BellymonMotion;
yes(Motion,'module available');
eq(Motion.isAutoSkip(),false,'auto-skip désactivé par défaut');
eq(ui.get('v16MotionToggle').getAttribute('aria-pressed'),'true','animations enabled initially');
function first(child,className){return child.children.find(e=>e.classList?.contains(className));}
// V16.1 : un seul rouleau à l’ouverture, et un bonus apparaissant en surprise.
{
 const reward={food:{small:4,large:0},bonus:'force'};
 Motion.playResult({kind:'chest',reward});
 eq(Motion.isBusy(),true,'slot animation active');
 eq(ui.get('eventResultClose').disabled,true,'cannot close while animation running');
 const slot=first(ui.get('v16Showcase'),'v16-slot-machine');yes(slot,'slot is visible');
 const reels=first(slot,'v16-reels');
 eq(reels.children.length,1,'un seul rouleau visible au départ');
 const firstResult=reels.children[0].children[0].children[0].children.at(-1).textContent;
 eq(firstResult,'🥩 ×4','icône et quantité réunies sans texte inutile');
 yes(!slot.textContent.includes('STEAK'),'pas de nom de nourriture redondant');
 yes(!slot.textContent.includes('Les trois rouleaux'),'aucune phrase inutile');
 ui.get('v16RevealSkip').click();
 eq(reels.children.length,2,'le second rouleau apparaît si le coffre comporte un bonus');
 eq(reels.children[1].children[0].children[0].children.at(-1).textContent,'💪 +1','le bonus est la seconde récompense');
 eq(Motion.isBusy(),false,'skip ends animation');
 eq(ui.get('eventResultClose').disabled,false,'close unlocked after skip');
 eq(ui.get('eventResultOverlay').classList.contains('v16-revealed'),true,'result revealed after skip');
 Motion.cancelResult();
 eq(ui.get('v16Showcase').hidden,true,'showcase cleared on close');
}
// La roulette des quatre pièges s'arrête sur le résultat réel, sans nouveau tirage.
{
 for(const [type,n] of [['force',0],['rapidite',1],['constitution',2],['all',3]]){
  Motion.playResult({kind:'trap',trapType:type});
  const stage=first(ui.get('v16Showcase'),'v16-curse-stage');yes(stage,'trap wheel exists');
  const frame=first(stage,'v16-wheel-frame');const disc=first(frame,'v16-wheel-disc');
  eq(disc.children.length,4,'four trap sectors');
  yes(disc.style.transform.endsWith(`-${n*90}deg)`)||disc.style.transform.includes(`${2520-n*90}deg`),'wheel finishes on '+type);
  Motion.cancelResult();
 }
}
// Sans bonus, le coffre ne doit JAMAIS afficher de deuxième rouleau, même à la fin.
{
 Motion.playResult({kind:'chest',reward:{food:{small:0,large:2},bonus:null}});
 const slot=first(ui.get('v16Showcase'),'v16-slot-machine');
 const reels=first(slot,'v16-reels');
 eq(reels.children.length,1,'aucun bonus : un seul rouleau');
 ui.get('v16RevealSkip').click();
 eq(reels.children.length,1,'pas de faux deuxième rouleau après arrêt');
 eq(reels.children[0].children[0].children[0].children.at(-1).textContent,'🍖 ×2','gigot et quantité affichés');
 Motion.cancelResult();
}
// AUTO: résultat sur la même logique, mais effet plus court.
{
 Motion.playResult({kind:'chest',reward:{food:{small:0,large:1},bonus:null},auto:true});
 eq(Motion.isBusy(),true,'auto still waits for chest reveal');
 Motion.cancelResult();
 eq(Motion.isBusy(),false,'cancel prevents stale animation');
}
// L'option OFF évite l'animation sans bloquer le jeu.
{
 ui.get('v16MotionToggle').click();
 eq(ui.get('v16MotionToggle').getAttribute('aria-pressed'),'false','toggle off');
 eq(storedValues['bellymon-v16-motion'],'off','off preference saved');
 Motion.playResult({kind:'trap',trapType:'all'});
 eq(Motion.isBusy(),false,'no animated wait when disabled');
 eq(ui.get('eventResultClose').disabled,false,'can close immediately when disabled');
 Motion.cancelResult();
 Motion.playResult({kind:'chest',reward:{food:{small:3,large:0},bonus:'rapidite'}});
 eq(Motion.isBusy(),false,'coffre visible immédiatement sans animations');
 eq(ui.get('v16Showcase').hidden,false,'rouleaux restent visibles sans animations');
 const slot=first(ui.get('v16Showcase'),'v16-slot-machine');
 const reels=first(slot,'v16-reels');
 eq(reels.children.length,2,'les deux récompenses visibles en mode OFF');
 eq(reels.children[0].children[0].children[0].children.at(-1).textContent,'🥩 ×3','aliment immédiat');
 eq(reels.children[1].children[0].children[0].children.at(-1).textContent,'⚡ +1','bonus immédiat');
 Motion.cancelResult();
 ui.get('v16MotionToggle').click();
 eq(storedValues['bellymon-v16-motion'],'on','on preference restored');
}
// Option Auto : résultat instantané, sans intervenir sur le tirage du coffre.
{
 ui.get('v16AutoSkipToggle').click();
 eq(Motion.isAutoSkip(),true,'auto skip activé');
 eq(storedValues['bellymon-v16-auto-skip'],'on','auto enregistré');
 Motion.playResult({kind:'chest',reward:{food:{small:2,large:0},bonus:'force'}});
 eq(Motion.isBusy(),false,'auto révèle le coffre sans attendre');
 eq(ui.get('v16RevealSkip').hidden,true,'bouton passer caché en mode auto');
 const slot=first(ui.get('v16Showcase'),'v16-slot-machine');
 const reels=first(slot,'v16-reels');
 eq(reels.children.length,2,'auto montre les deux récompenses du vrai butin');
 Motion.cancelResult();
 Motion.playResult({kind:'trap',trapType:'constitution'});
 eq(Motion.isBusy(),false,'auto révèle le piège sans attendre');
 yes(first(ui.get('v16Showcase'),'v16-curse-stage'),'roulette finale visible en auto');
 Motion.cancelResult();
 ui.get('v16AutoSkipToggle').click();
 eq(Motion.isAutoSkip(),false,'auto redésactivé');
}
// Les micros effets n'altèrent ni les combattantes ni les récompenses.
Motion.floorChanged('slot-1',1);
Motion.floorChanged('slot-1',2);
Motion.bonusesUpdated('slot-1',{force:1,rapidite:0,constitution:0});
Motion.bonusesUpdated('slot-1',{force:2,rapidite:0,constitution:0});
Motion.feed({evolves:true,rank:'D'});
Motion.battle({playerAction:'special',playerClass:'epeiste'});
Motion.captureAttempt(false);
yes(arena.children.length>=2,'battle and capture effects created');
// Le module ne peut pas modifier la probabilité du piège ou du coffre.
const gameContext={window:{}};vm.createContext(gameContext);
vm.runInContext(fs.readFileSync(path.join(ROOT,'js/rewards.js'),'utf8'),gameContext);
vm.runInContext(fs.readFileSync(path.join(ROOT,'js/traps.js'),'utf8'),gameContext);
const Rewards=gameContext.window.BellymonRewards,Traps=gameContext.window.BellymonTraps;
eq(Traps.KEYS.length,4,'four unchanged traps');
eq(Traps.select(()=>.99),'all','unchanged trap selection');
const vals=[.30,.20,.00,.00];const loot=Rewards.chestReward(()=>vals.shift());
eq(loot.food.small,2,'original steak amount');
eq(loot.bonus,'force','original bonus RNG');
console.log('V16.1 LAB : '+count+' contrôles UI / logique validés.');
