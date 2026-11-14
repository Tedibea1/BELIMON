/* Tests V9 : règles de pièges, cumul, durée, combat, bonus et résilience. */
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..'),box={window:{}};
for(const file of ['bonuses','traps','combat','capture'])vm.runInNewContext(fs.readFileSync(path.join(root,'js',file+'.js'),'utf8'),box,{filename:file});
const T=box.window.BellymonTraps,C=box.window.TDWCombat,CAP=box.window.BellymonCapture;
let checks=0;
const test=(label,fn)=>{fn();checks++};
const tower=(floor=12)=>({floor,activeTraps:[]});
for(const [i,type] of T.KEYS.entries()){
  test('sélection '+type,()=>assert.equal(T.select(()=> (i+.5)/4),type));
  for(const floor of [1,2,19,20,21,80,101,100000]){
    const state=tower(floor);T.apply(state,type);
    test(type+' ajouté '+floor,()=>assert.equal(state.activeTraps[0].type,type));
    test(type+' entier à '+floor,()=>assert.equal(T.remaining(state.activeTraps[0],floor),2));
    test(type+' encore actif étage suivant',()=>assert.equal(T.normalize(state.activeTraps,floor+1).length,1));
    test(type+' éteint au troisième',()=>assert.equal(T.normalize(state.activeTraps,floor+2).length,0));
    state.floor++;
    T.advance(state);
    test(type+' progression garde malus '+floor,()=>assert.equal(state.activeTraps.length,1));
    state.floor++;
    T.advance(state);
    test(type+' progression expire '+floor,()=>assert.equal(state.activeTraps.length,0));
  }
}
for(const key of T.KEYS){
 const state=tower(10);
 T.apply(state,key);T.apply(state,key);
 test('même effet non empilé '+key,()=>assert.equal(state.activeTraps.length,1));
 state.floor=11;T.apply(state,key);
 test('même effet rafraîchi '+key,()=>assert.equal(state.activeTraps[0].expiresAtFloor,13));
 test('pas d’expiration prématurée '+key,()=>assert.equal(T.normalize(state.activeTraps,12).length,1));
 test('expiration après rafraîchissement '+key,()=>assert.equal(T.normalize(state.activeTraps,13).length,0));
}
const state=tower(44);
for(const key of T.KEYS)T.apply(state,key);
test('quatre types différents empilés',()=>assert.equal(state.activeTraps.length,4));
const total=T.penalties(state.activeTraps,44);
for(const key of ['force','rapidite','constitution'])test('cumul individuel + global '+key,()=>assert.equal(Math.round(total[key]*100),30));
for(const floor of [44,45,46])test('active uniquement deux étages '+floor,()=>assert.equal(T.normalize(state.activeTraps,floor).length,floor===46?0:4));
test('doublons importés normalisés',()=>{
 const cases=[{type:'force',expiresAtFloor:45},{type:'force',expiresAtFloor:46},{type:'force',expiresAtFloor:47}];
 assert.equal(T.normalize(cases,44)[0].expiresAtFloor,47);
});
test('absence ancienne sauvegarde',()=>assert.equal(T.normalize(undefined,9).length,0));
test('refuse entrée invalide',()=>assert.equal(T.isEntry({type:'unknown',expiresAtFloor:12}),false));
for(const index of [0,1,2,3])test('tirage tranche '+index,()=>assert.equal(T.select(()=>index/4),T.KEYS[index]));
const hero={classId:'epeiste',stats:{force:20,rapidite:7,constitution:14},hp:82,maxHp:82,energy:100};
const levels={force:5,rapidite:10,constitution:7};
const original=JSON.stringify(hero);
for(const key of T.KEYS){
 const single=tower(8);T.apply(single,key);
 const pen=T.penalties(single.activeTraps,8);
 const actual=C.combatStats(hero,levels,{},pen);
 for(const stat of ['force','rapidite','constitution']){
  const expected=Math.round(hero.stats[stat]*(1-pen[stat]))+levels[stat]*2;
  test('piège '+key+' n’altère pas bonus '+stat,()=>assert.equal(actual[stat],expected));
 }
 test('piège '+key+' ne touche pas au personnage sauvegardé',()=>assert.equal(JSON.stringify(hero),original));
}
// Force pénalisée uniquement pour le joueur, pas l'adversaire. Différentes classes et combinaisons.
const classes=['epeiste','bagarreuse','archere_arcanique','occultiste','pretresse','griffeuse'];
for(const cls of classes){for(const rank of [1,2,5]){for(const key of T.KEYS){
 const pers={classId:cls,stats:{force:12*rank,rapidite:9*rank,constitution:11*rank},hp:1000,maxHp:1000,energy:100};
 const cp={...pers,stats:{...pers.stats}};
 const p=T.penalties([{type:key,expiresAtFloor:19}],18);
 for(const level of [0,1,10]){
  const bon={force:level,rapidite:level,constitution:level};
  const final=C.combatStats(cp,bon,{},p);
  for(const stat of ['force','rapidite','constitution'])test('classe/stat '+cls+rank+key+level+stat,()=>assert.equal(final[stat],Math.round(cp.stats[stat]*(1-p[stat]))+2*level));
 }
}}}
// Vérifier des dégâts réels : l'attaque d'un joueur affecté est moins forte.
const attacker={classId:'epeiste',hp:100,maxHp:100,energy:100,stats:{force:100,rapidite:0,constitution:0}};
const opponent={classId:'epeiste',hp:200,maxHp:200,energy:100,stats:{force:0,rapidite:0,constitution:0}};
const rng=()=>.4;
const clear=C.resolveTurn(attacker,opponent,'light',{},rng,{turn:1});
const weakened=C.resolveTurn(attacker,opponent,'light',{},rng,{turn:1,trapPenalties:{force:.2,rapidite:0,constitution:0}});
test('malus diminue dégâts effectifs',()=>assert.ok(weakened.details.player.damage<clear.details.player.damage));
test('adversaire non affecté',()=>assert.equal(clear.enemy.energy,weakened.enemy.energy));
const boosted=C.resolveTurn(attacker,opponent,'light',{force:10,rapidite:0,constitution:0},rng,{turn:1,trapPenalties:{force:.2}});
test('bonus permanents Force toujours +20 même piégé',()=>assert.equal(boosted.details.player.damage-weakened.details.player.damage,16));
// Test capture ratée : le moteur de riposte prend bien le malus du joueur.
const f1=CAP.attempt(attacker,opponent,{},rng,{turn:1,trapPenalties:{constitution:.2}});
test('capture échouée produit riposte',()=>assert.equal(f1.success,false));
console.log(`PASS pièges V9 : ${checks} vérifications`);
