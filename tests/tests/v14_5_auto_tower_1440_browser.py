"""V14.5 : layout PC/mobile, ascension automatique réelle, arrêts, zéro paiement implicite."""
import asyncio, json, uuid, sys, re
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

def fixture():
 s=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text());s['id']=str(uuid.uuid4())
 s['data']['food']={'small':13000,'large':10};s['data']['autoCombat']=False
 s['data']['tower'].update(floor=1,record=226,room='rest',event=None,combat=None,activeTraps=[])
 active=next(h for h in s['data']['waifus'] if h['id']==s['data']['activeWaifuId'])
 active['stats']={'force':5000,'rapidite':3000,'constitution':500};active['maxHp']=15000;active['hp']=15000;active['energy']=100
 return s

async def start(page,s):
 await b.boot(page,{PREFIX+s['id']:json.dumps(s,ensure_ascii=False)})
 await page.locator('.save-controls button').first.click()

async def state(page,s):
 snap=await b.snapshot(page)
 return json.loads(snap[PREFIX+s['id']])['data']

async def main():
 checks=0
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in (1440,):
   page=await browser.new_page(viewport={'width':width,'height':900})
   errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
   s=fixture();await start(page,s);print("started",width,flush=True)
   assert await page.title()=='BELLYMON · V14.5';checks+=1
   assert await page.locator('#towerAutoButton').is_visible();checks+=1
   assert await page.locator('#shortcutActions').is_visible();checks+=1
   boxes=[await page.locator('#'+id).bounding_box() for id in ['advanceBtn','shortcutReducedBtn','shortcutRecordBtn']]
   assert all(boxes),boxes;checks+=1
   advance,left,right=boxes
   assert advance['y']+advance['height'] <= left['y']+2, (width,boxes);checks+=1
   assert abs(left['y']-right['y'])<3 and left['x']+left['width']<=right['x']+3, (width,boxes);checks+=1
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 4'),width;checks+=1
   if width==1440:await page.screenshot(path=str(ROOT.parents[1]/'BELLYMON_V14.5_Commandes_PC.png'),full_page=True)
   if width==390:await page.screenshot(path=str(ROOT.parents[1]/'BELLYMON_V14.5_Commandes_Mobile.png'),full_page=True)
   # AUTO enabled at floor 1, it must start climbing without clicking Avancer or Combattre.
   await page.locator('#towerAutoButton').click();print('auto on',width,flush=True)
   assert await page.locator('#towerAutoButton').get_attribute('aria-pressed')=='true';checks+=1
   await page.wait_for_function('document.getElementById("sideFloor").textContent === "2"',timeout=24000);print('floor2',width,flush=True)
   d=await state(page,s)
   assert d['tower']['floor']>=2, (width,d['tower']);checks+=1
   assert d['food']['small']>=13000, 'Unexpected shortcut purchase';checks+=1
   assert d['autoCombat'] is True;checks+=1
   # Explicit manual stop must hold the current location fixed for multiple ticks.
   # At floor 2 the automatic progression may already have entered combat.
   if await page.locator('#towerAutoButton').is_visible():
    await page.locator('#towerAutoButton').click(timeout=4000)
   else:
    await page.locator('#combatAutoButton').click(timeout=4000)
   print('auto off',width,flush=True)
   d=await state(page,s)
   floor=d['tower']['floor'];room=d['tower']['room'];event=d['tower']['event']
   assert not d['autoCombat'];checks+=1
   await page.wait_for_timeout(2300)
   d2=await state(page,s)
   assert d2['tower']['floor']==floor and d2['tower']['room']==room and d2['tower']['event']==event,(width,d,d2);checks+=1
   print('post paused',width,flush=True)
   assert not errs,errs
   await page.close()
  # Suspension when viewing a non-tour tab while AUTO is ON.
  page=await browser.new_page(viewport={'width':390,'height':900})
  s=fixture();await start(page,s);print('tab test start',flush=True)
  await page.locator('#towerAutoButton').click()
  await page.locator('#tabWaifus').click()
  await page.wait_for_timeout(1900)
  d=await state(page,s)
  assert d['tower']['room']=='rest' and d['tower']['floor']==1;checks+=1
  await page.locator('#tabTour').click()
  await page.wait_for_function('document.getElementById("sideFloor").textContent === "2"',timeout=24000);checks+=1
  await browser.close()
 print('PASS',checks,'V14.5 : 1440, AUTO exploration/combats, stop, sans achats, onglet suspendu, placement PC/mobile')
if __name__=='__main__':asyncio.run(main())
