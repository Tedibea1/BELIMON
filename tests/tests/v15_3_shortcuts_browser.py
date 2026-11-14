"""Tests Chromium V15.3: fonctionnalité réelle, transactions, reprise et responsive."""
import asyncio, json, re, sys, uuid
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text()
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^\"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^\"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=sorted(ROOT.joinpath('css').glob('*.css'))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']
PREFIX=b.PREFIX

def fixture(record=226,funds=5000,floor=1):
 s=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text());s['id']=str(uuid.uuid4())
 s['data']['food']={'small':funds,'large':31}
 s['data']['tower'].update(floor=floor,record=record,room='rest',event=None,combat=None,activeTraps=[])
 return s
async def launch(page,s):
 await b.boot(page,{PREFIX+s['id']:json.dumps(s,ensure_ascii=False)})
 await page.locator('.save-controls button').first.click()
async def get(page,s):
 return json.loads((await b.snapshot(page))[PREFIX+s['id']])['data']
async def main():
 checks=0
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in (320,390,1440):
   page=await browser.new_page(viewport={'width':width,'height':900})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   s=fixture()
   await launch(page,s)
   assert await page.title()=='BELLYMON · V15.3';checks+=1
   assert await page.locator('#shortcutActions').is_visible();checks+=1
   assert await page.locator('#quitTowerBtn').is_hidden();checks+=1
   assert await page.locator('#advanceBtn').is_visible();checks+=1
   assert await page.locator('#shortcutReducedBtn').is_enabled();checks+=1
   assert await page.locator('#shortcutRecordBtn').is_enabled();checks+=1
   assert '221' in await page.locator('#shortcutReducedBtn').inner_text();checks+=1
   assert '2\u202f035' in await page.locator('#shortcutReducedBtn').inner_text() or '2 035' in await page.locator('#shortcutReducedBtn').inner_text();checks+=1
   assert '4\u202f256' in await page.locator('#shortcutRecordBtn').inner_text() or '4 256' in await page.locator('#shortcutRecordBtn').inner_text();checks+=1
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'Overflow {width}';checks+=1
   if width==390:await page.screenshot(path=str(ROOT.parent/'BELLYMON_V15.3_Commandes_390px.png'),full_page=True)
   if width==1440:await page.screenshot(path=str(ROOT.parent/'BELLYMON_V15.3_Commandes_1440px.png'),full_page=True)
   # Annuler ne doit rien déduire
   await page.locator('#shortcutRecordBtn').click()
   assert await page.locator('#confirmOverlay').is_visible();checks+=1
   assert '4\u202f256' in await page.locator('#confirmMessage').inner_text() or '4 256' in await page.locator('#confirmMessage').inner_text();checks+=1
   await page.locator('#confirmCancel').click()
   assert (await get(page,s))['food']['small']==5000;checks+=1
   # Reprise moins chère : résultat sauvegardé, sans bonus cachés
   await page.locator('#shortcutReducedBtn').click()
   await page.locator('#confirmAccept').click()
   await page.wait_for_function('document.getElementById("sideFloor").textContent==="221"')
   d=await get(page,s)
   assert d['tower']['floor']==221 and d['tower']['record']==226;checks+=1
   assert d['food']=={'small':2965,'large':31};checks+=1
   assert d['tower']['room']=='rest' and d['tower']['event'] is None;checks+=1
   assert await page.locator('#shortcutActions').is_hidden();checks+=1
   assert await page.locator('#quitTowerBtn').is_visible();checks+=1
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'overflow after {width}';checks+=1
   # Persistance de la transaction à la fermeture du navigateur.
   snap=await b.snapshot(page)
   await page.close();page=await browser.new_page(viewport={'width':width,'height':900})
   page.on('pageerror',lambda e:errors.append(str(e)))
   await b.boot(page,snap);await page.locator('.save-controls button').first.click()
   after=await get(page,s)
   assert after['tower']['floor']==221 and after['food']['small']==2965;checks+=1
   await page.locator('#quitTowerBtn').click()
   assert await page.locator('#confirmOverlay').is_visible();checks+=1
   await page.locator('#confirmAccept').click()
   await page.wait_for_function('document.getElementById("sideFloor").textContent==="1"')
   assert await page.locator('#shortcutActions').is_visible();checks+=1
   assert (await get(page,s))['food']['small']==2965;checks+=1
   # Prix premium encore hors budget, pas de débordement ou mauvaise déduction.
   assert await page.locator('#shortcutRecordBtn').is_disabled();checks+=1
   assert await page.locator('#shortcutReducedBtn').is_enabled();checks+=1
   assert not errors,errors
   await page.close()
  # Reprise exacte avec la bonne tarification.
  page=await browser.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  s=fixture()
  await launch(page,s)
  await page.locator('#shortcutRecordBtn').click()
  await page.locator('#confirmAccept').click()
  await page.wait_for_function('document.getElementById("sideFloor").textContent==="226"')
  d=await get(page,s)
  assert d['food']['small']==744 and d['tower']['floor']==226 and d['tower']['record']==226;checks+=1
  assert d['food']['large']==31;checks+=1
  assert not errors,errors
  await page.close()
  # Nouvelle partie : aucun raccourci payant, mais Avancer reste utilisable.
  page=await browser.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  s=fixture(record=1,funds=999999)
  await launch(page,s)
  assert await page.locator('#shortcutActions').is_visible();checks+=1
  assert await page.locator('#shortcutReducedBtn').is_disabled();checks+=1
  assert await page.locator('#shortcutRecordBtn').is_disabled();checks+=1
  assert await page.locator('#advanceBtn').is_enabled();checks+=1
  assert not errors,errors
  await page.close()
  # Pas assez de steaks : coût visible, mais achat impossible.
  page=await browser.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  s=fixture(record=226,funds=2034)
  await launch(page,s)
  assert await page.locator('#shortcutReducedBtn').is_disabled();checks+=1
  assert await page.locator('#shortcutRecordBtn').is_disabled();checks+=1
  assert '2\u202f035' in await page.locator('#shortcutReducedBtn').inner_text() or '2 035' in await page.locator('#shortcutReducedBtn').inner_text();checks+=1
  assert not errors,errors
  await page.close()
  await browser.close()
 print('PASS',checks,'vérifications navigateur V15.3 (320/390/1440, transaction, annulation, reprise, sauvegarde, verrouillages)')
if __name__=='__main__':asyncio.run(main())
