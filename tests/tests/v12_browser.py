"""Tests d'interface V12 via Chromium: jeu injecté en mémoire (fichiers locaux bloqués)."""
import asyncio, re, json, os
from pathlib import Path
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
output=Path('/mnt/data')
css_files=list(sorted((root/'css').glob('*.css')))
js_files=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
html=(root/'index.html').read_text()
html=re.sub(r'<link\s+rel="stylesheet"\s+href="css/[^\"]+">','',html)
html=re.sub(r'<script defer src="js/[^\"]+"></script>','',html)
html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
localStorageMock='''(() => {const db=new Map();const local={setItem(k,v){db.set(String(k),String(v))},getItem(k){return db.has(String(k))?db.get(String(k)):null},removeItem(k){db.delete(String(k))},clear(){db.clear()},key(i){return [...db.keys()][i]??null},get length(){return db.size}};Object.defineProperty(window,'localStorage',{configurable:true,value:local});Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Math.random=()=>0.4;})();'''
async def launch(page):
  # Le navigateur ne peut pas atteindre local file: ; injecter l'interface en mémoire.
  async def route_asset(route):
    rel=route.request.url.split('bellymon.test/')[1].split('?')[0]
    file=root/rel
    if file.is_file(): await route.fulfill(path=str(file))
    else: await route.abort()
  await page.route('https://bellymon.test/**',route_asset)
  await page.goto('about:blank')
  await page.evaluate(localStorageMock)
  await page.set_content(html,wait_until='domcontentloaded')
  for file in css_files: await page.add_style_tag(content=file.read_text())
  for f in js_files: await page.add_script_tag(content=(root/'js'/f).read_text())
  await page.wait_for_timeout(250)
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  checks=0; errors=[];files=[]
  for width in [320,360,390,430,768,1440]:
   page=await browser.new_page(viewport={'width':width,'height':900 if width<500 else 1050},device_scale_factor=1)
   page.on('pageerror',lambda err: errors.append(str(err)))
   await launch(page)
   assert await page.title()=='BELLYMON · V12.0.11'
   assert await page.locator('#newGameBtn').count()==1
   await page.locator('#newGameBtn').click()
   await page.locator('#partyName').fill('Test V12')
   await page.locator('#playerName').fill('V12')
   await page.locator('#createForm button[type=submit]').click()
   await page.wait_for_timeout(350)
   assert await page.locator('#playScreen').is_visible(),f'jeu pas ouvert {width}'
   assert await page.locator('#tabTour').is_visible()
   # Étages : combat déterministe Math.random = 0.4 (60% combat).
   await page.locator('#advanceBtn').click()
   # ne pas attendre l'animation : on la passe à l'écran
   await page.locator('#eventAnnouncement').click()
   await page.wait_for_timeout(200)
   assert await page.locator('#startCombatBtn').is_visible(),f'pas de combat {width}'
   await page.locator('#startCombatBtn').click()
   await page.wait_for_timeout(200)
   assert await page.locator('#combatHud').is_visible()
   assert await page.locator('#turnNumber').inner_text()=='1'
   # Première compétence : épéiste, bonus constitution -15% ennemi.
   await page.locator('[data-combat-action="special"]').click()
   if width==390:
    await page.locator('.hit-pop').first.wait_for(state='visible',timeout=2000)
    await page.screenshot(path=str(output/'BELLYMON_V12_Impact_Mobile.png'),full_page=True)
    files.append(str(output/'BELLYMON_V12_Impact_Mobile.png'))
   await page.wait_for_timeout(240)
   assert await page.locator('#turnNumber').inner_text()=='2',f'pas de passage tour 2 {width}'
   assert await page.locator('#enemyEffectsLine').is_visible(),f'pas d’effet affiché {width}'
   assert 'CONS −15 %' in await page.locator('#enemyEffectsLine').inner_text()
   assert await page.locator('#statusCount').inner_text()=='1'
   assert await page.locator('.hit-pop').count()>0,'impact absent'
   await page.locator('#statusDetailsBtn').click()
   await page.wait_for_timeout(80)
   assert await page.locator('#effectsOverlay').is_visible()
   assert 'Punition frénétique' in await page.locator('#effectsContent').inner_text()
   await page.locator('#effectsClose').click()
   assert await page.locator('#effectsOverlay').is_hidden()
   # Vérifier absence de débordement horizontal (et boutons touchables).
   overflow=await page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 3')
   assert not overflow,f'débordement horizontal {width}px'
   checks+=14
   if width==390:
    await page.screenshot(path=str(output/'BELLYMON_V12_Combat_Mobile.png'),full_page=True)
    files.append(str(output/'BELLYMON_V12_Combat_Mobile.png'))
    await page.locator('#statusDetailsBtn').click()
    await page.screenshot(path=str(output/'BELLYMON_V12_Effets_Mobile.png'),full_page=True)
    files.append(str(output/'BELLYMON_V12_Effets_Mobile.png'))
    await page.locator('#effectsClose').click()
   if width==1440:
    await page.screenshot(path=str(output/'BELLYMON_V12_PC.png'),full_page=True)
    files.append(str(output/'BELLYMON_V12_PC.png'))
   await page.close()
  # Parcours supplémentaire : pièges importés dans une sauvegarde historique,
  # puis duel AUTO à 0 EN sans impasse ni suppression des bonus permanents.
  scenario=await browser.new_page(viewport={'width':390,'height':850})
  scenario.on('pageerror',lambda err:errors.append(str(err)))
  await launch(scenario)
  demo=json.loads((root/'tests'/'DEMO_PIEGES_V9.json').read_text())
  demo['label']='V12 impasse EN'
  first=demo['data']['waifus'][0]
  demo['data']['waifus']=[first]
  demo['data']['activeWaifuId']=first['id']
  first['energy']=0
  hp=first['hp'];maxHp=first['maxHp']
  demo['data']['autoCombat']=True
  demo['data']['tower']['room']='event'
  demo['data']['tower']['event']={'type':'combat','state':'fighting','enemy':{
    'id':'ennemie-v12-zero-en','classId':'bagarreuse','rank':'E','morph':None,
    'stats':{'force':14,'rapidite':7,'constitution':20},'hp':82,'maxHp':82,'energy':0}}
  demo['data']['tower']['combat']={'turn':0,'lastMessage':'Duel sans énergie',
    'effects':{'player':{'swordCons':False,'curse':None,'siphon':None,'lastOccultTurn':0},
               'enemy':{'swordCons':False,'curse':None,'siphon':None,'lastOccultTurn':0}},
    'knockedOutIds':[]}
  await scenario.locator('#pasteBtn').click()
  await scenario.locator('#pasteInput').fill(json.dumps(demo,ensure_ascii=False))
  await scenario.locator('#pasteConfirm').click()
  await scenario.wait_for_timeout(180)
  assert await scenario.locator('#saveList .save-card').count()==1
  await scenario.locator('#saveList .save-card .save-controls button').first.click()
  await scenario.wait_for_timeout(200)
  assert await scenario.locator('#activeTrapsLine .trap-status-chip').count()==2
  assert await scenario.locator('#statusCount').inner_text()=='2'
  await scenario.locator('#statusDetailsBtn').click()
  txt=await scenario.locator('#effectsContent').inner_text()
  assert 'Force −20 %' in txt and 'Toutes les stats −10 %' in txt
  await scenario.screenshot(path=str(output/'BELLYMON_V12_Pieges_Mobile.png'),full_page=True)
  files.append(str(output/'BELLYMON_V12_Pieges_Mobile.png'))
  await scenario.locator('#effectsClose').click()
  # V12 : AUTO ne doit plus rester coincé à 0/0 EN, puis victoire/défaite résolue.
  await scenario.wait_for_timeout(8300)
  assert await scenario.locator('#floorLabel').inner_text()=='1'
  assert await scenario.locator('#combatHud').is_hidden(), 'AUTO impasse EN : pas de fin'
  assert await scenario.locator('#eventResultOverlay').is_visible(), 'défaite totale doit être annoncée'
  checks+=7
  await scenario.close()
  assert not errors,'Erreurs JS : '+repr(errors)
  await browser.close()
  print(json.dumps({'checks':checks,'resolutions':[320,360,390,430,768,1440], 'pageerrors':errors,'screenshots':files},ensure_ascii=False,indent=2))
asyncio.run(run())
