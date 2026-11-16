// BELLYMON V16.1.3 — protections contre le déplacement des modales et les rots répétitifs.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'../..');
const motion=fs.readFileSync(path.join(ROOT,'js/v16-motion.js'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'css/v16.css'),'utf8');
const game=fs.readFileSync(path.join(ROOT,'js/game.js'),'utf8');
const audio=fs.readFileSync(path.join(ROOT,'js/audio.js'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
assert.match(motion,/target\.classList\.contains\('modal-overlay'\)/,'les effets flottants évitent les modales');
assert.match(css,/\.modal-overlay\.v16-signal-anchor\{position:fixed!important/,'les modales restent fixes');
assert.match(motion,/if\(!anchor\.querySelector\('\.v16-float-signal'\)\)/,'suppression du positionnement temporaire');
assert.match(game,/setTimeout\(\(\)=>AUDIO\.playEffect\('burp'\)/,'le nourrissage déclenche un rot');
assert.match(game,/AUDIO\.playEffect\('burp'\);\}\);/,'le bouton de test déclenche un rot');
assert.match(audio,/lastBurp\+1\+Math\.floor\(Math\.random\(\)\*\(burps\.length-1\)\)/,'pas de répétition immédiate');
assert.match(audio,/settings\.sfxVolume\/100/,'volume des effets sonores respecté');
assert.match(html,/V16\.1\.9 LAB/,'version à jour');
for(let i=1;i<=9;i++){
 const f=path.join(ROOT,'assets/audio/burps',`rot_${String(i).padStart(2,'0')}.mp3`);
 assert.ok(fs.existsSync(f) && fs.statSync(f).size>3000,`son rot ${i} présent`);
}
console.log('V16.1.3 : 17 vérifications statiques des sons et modales réussies.');
