'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
const guide=fs.readFileSync(path.join(root,'js/guide.js'),'utf8');

// Aucun texte personnel au développeur dans les écrans accessibles au joueur.
assert.doesNotMatch(html,/FEASTBORN|Chronicles|sans dévoiler les valeurs du jeu/);
assert.match(html,/Tes sauvegardes sont conservées dans ce navigateur/);
assert.match(html,/avant de changer d’appareil ou de navigateur/);
assert.doesNotMatch(game,/(?:Ancien piège découvert|Piège déjà découvert dans une ancienne version|Coffre ouvert avant la V5)/);
assert.match(game,/Le coffre a été ouvert\./);
assert.match(game,/Ce coffre contenait un piège\./);
assert.doesNotMatch(guide,/sans dévoiler|sans révéler|coefficients et probabilités internes|statistiques chiffrées/);
assert.match(html,/BELLYMON · V15\.(?:1[4-9]|[2-9]\d)/);

// Les fenêtres et écrans principaux n'ont pas été retirés par mégarde.
for(const id of ['menuScreen','createScreen','guideScreen','playScreen','saveList','eventResultOverlay','waifuDetailOverlay','morphOverlay','audioOverlay']){
 assert.ok(html.includes(`id="${id}"`),`Fenêtre indispensable : ${id}`);
}
const store={};
const get=id=>store[id]??=(id==='guideContent'?{
 innerHTML:'',querySelectorAll:()=>[]
}:{classList:{toggle(){}},dataset:{guideTab:'classes'},setAttribute(){}});
const context={window:{},document:{getElementById:get,querySelectorAll:()=>[]}};
vm.createContext(context);
vm.runInContext(guide,context,{filename:'js/guide.js'});
const classes=['epeiste','bagarreuse','archere_arcanique','occultiste','pretresse','griffeuse'].map((id,i)=>({
 id,name:id,icon:'⚔',role:'DPS',stats:{force:15+i*2,rapidite:15,constitution:15}
}));
context.window.BellymonGuide.init({classes,morphBonuses:{
 musclee:{force:6,rapidite:2,constitution:4},obese:{force:4,rapidite:2,constitution:6},chetive:{force:4,rapidite:6,constitution:2}
}});
for(const tab of ['classes','morphologies','competences']){
 context.window.BellymonGuide.show(tab);
 assert.ok(store.guideContent.innerHTML.includes('guide-section-head'));
 assert.doesNotMatch(store.guideContent.innerHTML,/sans dévoiler|sans révéler|coefficients et probabilités internes/);
}
console.log('BELLYMON V15.14 : textes publics nettoyés, fenêtres et Guide préservés.');
