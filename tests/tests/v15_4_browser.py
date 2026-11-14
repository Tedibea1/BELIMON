"""Tests d'intégration V15.4 : jeu réel, sauvegarde, affichage, durées et responsive."""
import asyncio,re,sys,json
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
 checks=0; errors=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in (390,1440):
   for cl in ('maudite','envouteuse','nemesis','exorciste'):
    page=await browser.new_page(viewport={'width':width,'height':900})
    page.on('pageerror',lambda e:errors.append(str(e)))
    slot=v.fixture(21,'epeiste',cl,'fighting')
    hero=slot['data']['waifus'][0]
    hero.update(hp=1500,maxHp=1500,energy=100,stats={'force':100,'rapidite':120,'constitution':30})
    enemy=slot['data']['tower']['event']['enemy']
    enemy.update(hp=2000,maxHp=2000,energy=0,stats={'force':30,'rapidite':1,'constitution':10})
    await v.open_slot(page,slot)
    assert await page.title()=='BELLYMON · V15.4.1';checks+=1
    name=await page.locator('#specialActionName').inner_text()
    assert name=={'maudite':'Malédiction du sang','envouteuse':'Vol de puissance','nemesis':'Miroir magique','exorciste':'Purification'}[cl];checks+=1
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth+4'),f'overflow {width}';checks+=1
    before=await v.saved_data(page,slot)
    await page.locator('[data-combat-action="special"]').click()
    await page.wait_for_function('''id=>{let s=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return s&&JSON.parse(s).data.tower.combat?.turn===1}''',arg=slot['id'],timeout=11000)
    saved=await v.saved_data(page,slot)
    assert saved['waifus'][0]['energy']==80,cl;checks+=1
    fx=saved['tower']['combat']['effects']
    if cl=='maudite':
     assert saved['tower']['event']['enemy']['hp']<before['tower']['event']['enemy']['hp'];checks+=1
     assert fx['enemy']['bloodCurse']['startTurn']==2 and fx['enemy']['bloodCurse']['expiresTurn']==4,fx;checks+=1
    elif cl=='envouteuse':
     assert saved['tower']['event']['enemy']['hp']<before['tower']['event']['enemy']['hp'];checks+=1
     assert fx['player']['powerGain']['startTurn']==2 and fx['player']['powerGain']['expiresTurn']==4,fx;checks+=1
     assert fx['enemy']['powerLoss']['amount']==20;checks+=1
    elif cl=='nemesis':
     assert fx['player']['mirror']=={'startTurn':1,'expiresTurn':5},fx;checks+=1
    else:
     assert fx['player']['purification']=={'startTurn':1,'expiresTurn':5},fx;checks+=1
    assert not errors,errors
    await page.close()
  # Contrôle de compatibilité d'une ancienne sauvegarde V15.3 contenant un malus.
  page=await browser.new_page(viewport={'width':390,'height':900})
  page.on('pageerror',lambda e:errors.append(str(e)))
  slot=v.fixture(21,'epeiste','exorciste','fighting')
  slot['data']['tower']['combat']['turn']=2
  slot['data']['tower']['combat']['effects']={'player':{'bloodCurse':{'startTurn':1,'expiresTurn':3}},'enemy':{}}
  await v.open_slot(page,slot)
  snapshot=await v.saved_data(page,slot)
  assert snapshot['tower']['combat']['effects']['player']['bloodCurse']['expiresTurn']==3;checks+=1
  await page.locator('[data-combat-action="special"]').click()
  await page.wait_for_function('''id=>{let s=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return s&&JSON.parse(s).data.tower.combat?.turn===3}''',arg=slot['id'],timeout=11000)
  saved=await v.saved_data(page,slot)
  assert saved['tower']['combat']['effects']['player']['bloodCurse'] is None;checks+=1
  assert saved['tower']['combat']['effects']['player']['purification']['expiresTurn']==7;checks+=1
  assert not errors,errors
  await page.close()
  await browser.close()
 print(f'V15.4 CHROMIUM : {checks} contrôles PC/mobile et reprise, aucune erreur JS')
if __name__=='__main__':asyncio.run(main())
