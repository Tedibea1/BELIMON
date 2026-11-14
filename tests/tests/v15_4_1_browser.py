"""V15.4.1 — Non-regression Frappe spectrale, affichage et sauvegarde PC/mobile."""
import asyncio,re,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
import v14_browser as v
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text(encoding='utf8')
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=sorted(ROOT.joinpath('css').glob('*.css'))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']
async def main():
 checks=0;errors=[]
 async with async_playwright() as play:
  browser=await play.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in (390,1440):
   for attack_side in ('player','enemy'):
    page=await browser.new_page(viewport={'width':width,'height':900})
    page.on('pageerror',lambda e:errors.append(str(e)))
    slot=v.fixture(21,'spectre' if attack_side=='enemy' else 'epeiste','spectre' if attack_side=='player' else 'epeiste','fighting')
    hero=slot['data']['waifus'][0]
    hero.update(hp=1500,maxHp=1500,energy=100,stats={'force':20,'rapidite':100,'constitution':20})
    enemy=slot['data']['tower']['event']['enemy']
    enemy.update(hp=1500,maxHp=1500,energy=100,stats={'force':20,'rapidite':10,'constitution':20})
    await v.open_slot(page,slot)
    assert await page.title()=='BELLYMON · V15.4.1';checks+=1
    name=await page.locator('#specialActionName').inner_text()
    assert name==('Frappe spectrale' if attack_side=='player' else 'Punition frénétique');checks+=1
    # Vérification du nom officiel exposé par le moteur.
    assert await page.evaluate('window.TDWCombat.SPECIALS.spectre.name')=='Frappe spectrale';checks+=1
    # Les effets sont dans le moteur et l'affichage du buff se base sur le même identifiant.
    if attack_side=='player':
     await page.locator('[data-combat-action="special"]').click()
     await page.wait_for_function('''id=>{let s=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return s&&JSON.parse(s).data.tower.combat?.turn===1}''',arg=slot['id'],timeout=10000)
     data=await v.saved_data(page,slot)
     assert data['tower']['combat']['effects']['player']['intangible']['expiresTurn']==2;checks+=1
     desc=await page.evaluate("id=>window.BellymonCombatUI.describe({turn:1,effects:JSON.parse(localStorage.getItem('tour_des_waifus_v1_slot_'+id)).data.tower.combat.effects},21,[]).sides.player",slot['id'])
     assert any('Frappe spectrale' in effect['detail'] for effect in desc),desc;checks+=1
     assert await page.evaluate('window.TDWCombat.SPECIALS.spectre.description.includes("×1,5")');checks+=1
     # Le nom du sort est rendu dynamiquement dans les logs du moteur.
     assert await page.evaluate('window.TDWCombat.resolveTurn({classId:"spectre",stats:{force:20,rapidite:100,constitution:20},hp:200,maxHp:200,energy:100},{classId:"epeiste",stats:{force:1,rapidite:10,constitution:10},hp:200,maxHp:200,energy:100},"special",{},()=>0.9,{enemyAction:"defend",turn:1}).summary.includes("Frappe spectrale")');checks+=1
    assert not errors,errors
    await page.close()
  await browser.close()
 print(f'V15.4.1 CHROMIUM : {checks} validations PC/mobile et zéro erreur JS')
if __name__=='__main__':asyncio.run(main())
