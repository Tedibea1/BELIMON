'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
const button=action=>{
 const match=html.match(new RegExp('<button(?=[^>]*data-combat-action="'+action+'")[^>]*>[\\s\\S]*?<\\/button>'));
 assert.ok(match,'Bouton '+action+' introuvable');
 return match[0];
};
assert.match(button('light'),/Légère <small>2 ⚡<\/small>/,'Légère : coût unique');
assert.doesNotMatch(button('light'),/3\/3|tentative|capture/,'Ne pas afficher de tentatives sur Légère');
assert.match(button('heavy'),/Lourde <small>3 ⚡<\/small>/,'Lourde intacte');
assert.match(button('special'),/<small>5 ⚡<\/small>/,'Spéciale intacte');
assert.match(button('defend'),/<small>0 ⚡<\/small>/,'Défense intacte');
assert.match(button('capture'),/id="captureChanceLabel">2 ⚡ · 3\/3<\/small>/,'Tentatives réservées à Capture');
assert.match(game,/\$\('captureChanceLabel'\)\.textContent=`2 ⚡ · \$\{rate\}% · \$\{capturesLeft\}\/3`;/,'Affichage capture dynamique inchangé');
assert.match(html,/BELLYMON · V15\.15\.1/);
console.log('BELLYMON V15.15.1 : affichage des commandes et captures OK.');
