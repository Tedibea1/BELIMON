/* BELLYMON V12.0.3 — test ciblé sur la séparation des actions. */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={window:{},Math};vm.createContext(ctx);
for(const file of ['bonuses.js','combat.js','capture.js'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+file,'utf8'),ctx);
const {TDWCombat:C,BellymonCapture:CAP}=ctx.window;
const hero=(classId,force=20,hp=300)=>({classId,stats:{force,rapidite:15,constitution:12},hp,maxHp:hp,energy:100});
const rng=()=>0.99;
let count=0;
function twoLines(label,summary,first,second){
  const lines=summary.split('\n');
  assert.equal(lines.length,2,label+': deux lignes exactement');
  assert.ok(lines[0].includes(first),label+': action du joueur');
  assert.ok(lines[1].includes(second),label+': action adverse');
  count+=3;
}
const simple=C.resolveTurn(hero('griffeuse'),hero('epeiste'),'light',{},rng,{turn:1});
twoLines('Attaque légère',simple.summary,'Ta waifu lance une attaque légère','L’adversaire');
const special=C.resolveTurn(hero('epeiste'),hero('griffeuse'),'special',{},rng,{turn:1});
twoLines('Spéciale avec malus',special.summary,'Punition frénétique','L’adversaire');
assert.match(special.summary.split('\n')[0],/Constitution adverse −15 %/);count++;
const defend=C.resolveTurn(hero('griffeuse'),hero('epeiste'),'defend',{},rng,{turn:1});
twoLines('Défense',defend.summary,'Ta waifu','L’adversaire');
const weak=hero('archere_arcanique',2000),enemy=hero('pretresse',5,1);
const ko=C.resolveTurn(weak,enemy,'light',{},rng,{turn:1});
twoLines('KO avant riposte',ko.summary,'Ta waifu','L’adversaire est KO');
assert.equal(ko.result,'won');count++;
const failed=CAP.attempt(hero('griffeuse'),hero('epeiste'),{},rng,{turn:1});
assert.equal(failed.success,false);count++;
twoLines('Capture ratée',failed.summary,'Capture échouée','L’adversaire');
const success=CAP.attempt(hero('griffeuse'),hero('epeiste'),{},()=>0,{turn:1});
assert.equal(success.success,true);count++;
assert.ok(!success.summary.includes('\n'),'Capture réussie sans riposte ne crée pas une ligne vide');count++;
console.log('✅ BELLYMON V12.0.3 :',count,'assertions — actions sur lignes distinctes');
