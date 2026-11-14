"""V12.0.6 : tests d'interface et d'intégration du quota 3 combattantes.
Le HTML est injecté en mémoire car l'ouverture file:// peut être restreinte dans ce Chromium.
"""
import asyncio, json, re, copy, uuid
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT.joinpath('index.html').read_text()
HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',HTML)
HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',HTML)
HTML=HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
CSS=list(sorted(ROOT.joinpath('css').glob('*.css')))
PREFIX='tour_des_waifus_v1_slot_'
MOCK='''(items) => {const db=new Map(Object.entries(items||{}));const store={getItem(k){return db.has(String(k))?db.get(String(k)):null},setItem(k,v){db.set(String(k),String(v))},removeItem(k){db.delete(String(k))},key(i){return [...db.keys()][i]||null},clear(){db.clear()},get length(){return db.size}};Object.defineProperty(window,'localStorage',{configurable:true,value:store});Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Math.random=()=>0.4;}'''
async def boot(page,initial=None):
 async def assets(route):
  rel=route.request.url.split('bellymon.test/',1)[-1].split('?')[0]
  p=ROOT/rel
  if p.is_file():await route.fulfill(path=str(p))
  else:await route.abort()
 await page.route('https://bellymon.test/**',assets)
 await page.goto('about:blank')
 await page.evaluate(MOCK,initial or {})
 await page.set_content(HTML,wait_until='domcontentloaded')
 for css in CSS:await page.add_style_tag(content=css.read_text())
 for name in JS:await page.add_script_tag(content=ROOT.joinpath('js',name).read_text())
 await page.wait_for_timeout(200)
async def snapshot(page):
 return await page.evaluate('''() => Object.fromEntries(Array.from({length: localStorage.length},(_,i)=>{const key=localStorage.key(i);return [key,localStorage.getItem(key)]}))''')
def make_save(*,legacy=False,used=None,knocked=None,active=0):
 slot=json.loads(ROOT.joinpath('tests/DEMO_RELAIS_V4.json').read_text())
 slot['id']=str(uuid.uuid4());slot['label']='Test quota 3 / 6'
 base=slot['data']['waifus']
 for i in range(3):
  clone=copy.deepcopy(base[i])
  clone['id']=f'demo-hero-{i+4}';clone['hp']=300;clone['maxHp']=300;clone['stats']['constitution']=20
  base.append(clone)
 for h in base[:3]:h['hp']=1;h['stats']['constitution']=0
 slot['data']['activeWaifuId']=base[active]['id']
 tower=slot['data']['tower'];tower.update(floor=5,record=5,room='event',event={
  'type':'combat','state':'fighting','enemy':{'id':'ennemie-test','classId':'epeiste','rank':'E','morph':None,
   'hp':2000,'maxHp':2000,'energy':100,'stats':{'force':600,'rapidite':0,'constitution':10}}})
 c={'turn':0,'lastMessage':'Combat engagé', 'effects':{'player':{},'enemy':{}},'knockedOutIds':knocked or []}
 if not legacy:c['usedHeroIds']=used if used is not None else [base[active]['id']]
 tower['combat']=c
 return slot
async def begin(page,slot):
 await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
 await page.locator('.save-controls button').first.click()
 await page.locator('#playScreen').wait_for(state='visible')
 await page.locator('#combatHud').wait_for(state='visible')
async def main():
 checks=0;errors=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=await browser.new_page(viewport={'width':390,'height':844})
  p.on('pageerror',lambda e:errors.append(str(e)))
  await boot(p)
  await p.locator('#newGameBtn').click()
  # Quatre rôles seulement : pas de chiffres des statistiques dans le choix des classes.
  roles=await p.locator('.class-option small').all_text_contents()
  assert roles==['DPS','Tank','DPS','Soutien','Healer','DPS'],roles;checks+=1
  assert not re.search(r'\b(?:force|rapidit|constitut)\b', ' '.join(roles),re.I);checks+=1
  morphs=await p.locator('.morph-choice small').all_text_contents()
  assert morphs==['Très forte, bonne résistance, mais lente.','Très résistante, forte, mais lente.','Très rapide, assez forte, mais fragile.'],morphs;checks+=1
  assert not re.search(r'\+\s*\d', ' '.join(morphs));checks+=1
  await p.screenshot(path='/mnt/data/BELLYMON_V12.0.6_Classes_Mobile.png',full_page=True)
  await p.close()
  slot=make_save()
  p=await browser.new_page(viewport={'width':390,'height':844})
  p.on('pageerror',lambda e:errors.append(str(e)))
  await begin(p,slot)
  assert (await p.locator('#teamUsedCount').inner_text()).strip()=='👩 1/3';checks+=1
  # Premier KO, alors que 5 réservistes existent : droit au 1er relais.
  await p.locator('[data-combat-action="defend"]').click()
  await p.locator('#relayOverlay').wait_for(state='visible')
  assert await p.locator('.relay-card').count()==5;checks+=1
  assert '1/3' in await p.locator('#relaySubtitle').inner_text();checks+=1
  await p.locator('.relay-card').first.click()
  await p.locator('#relayOverlay').wait_for(state='hidden')
  assert (await p.locator('#teamUsedCount').inner_text()).strip()=='👩 2/3';checks+=1
  snap=await snapshot(p)
  saved=json.loads(snap[PREFIX+slot['id']])
  assert len(saved['data']['tower']['combat']['usedHeroIds'])==2;checks+=1
  # Fermer le navigateur puis reprendre : la 1re et la 2e restent comptées.
  await p.close()
  p=await browser.new_page(viewport={'width':390,'height':844})
  p.on('pageerror',lambda e:errors.append(str(e)))
  await boot(p,snap)
  await p.locator('.save-controls button').first.click()
  assert (await p.locator('#teamUsedCount').inner_text()).strip()=='👩 2/3';checks+=1
  # Second KO -> dernier relais possible.
  await p.locator('[data-combat-action="defend"]').click()
  await p.locator('#relayOverlay').wait_for(state='visible')
  assert '2/3' in await p.locator('#relaySubtitle').inner_text();checks+=1
  assert await p.locator('.relay-card').count()==4;checks+=1
  await p.locator('.relay-card').first.click()
  assert (await p.locator('#teamUsedCount').inner_text()).strip()=='👩 3/3';checks+=1
  snap=await snapshot(p)
  saved=json.loads(snap[PREFIX+slot['id']])
  assert len(saved['data']['tower']['combat']['usedHeroIds'])==3;checks+=1
  await p.screenshot(path='/mnt/data/BELLYMON_V12.0.6_Combat_Mobile.png',full_page=True)
  # Troisième KO -> défaite finale, même si 3 autres restent disponibles.
  await p.locator('[data-combat-action="defend"]').click()
  assert await p.locator('#floorLabel').inner_text()=='1';checks+=1
  assert await p.locator('#relayOverlay').is_hidden();checks+=1
  assert await p.locator('#eventResultOverlay').is_visible();checks+=1
  assert '3 combattantes' in await p.locator('#eventResultText').inner_text();checks+=1
  saved=json.loads((await snapshot(p))[PREFIX+slot['id']])
  assert saved['data']['tower']['event'] is None;checks+=1
  assert all(h['hp']==h['maxHp'] for h in saved['data']['waifus']);checks+=1
  assert len(saved['data']['waifus'])==6;checks+=1
  await p.close()
  # Ancienne sauvegarde : deux KO, troisième engagée, pas de champ usedHeroIds.
  old=make_save(legacy=True,knocked=['demo-hero-1','demo-hero-2'],active=2)
  old['data']['waifus'][0]['hp']=0;old['data']['waifus'][1]['hp']=0
  p=await browser.new_page(viewport={'width':1440,'height':900})
  p.on('pageerror',lambda e:errors.append(str(e)))
  await begin(p,old)
  assert (await p.locator('#teamUsedCount').inner_text()).strip()=='👩 3/3';checks+=1
  await p.locator('[data-combat-action="defend"]').click()
  assert await p.locator('#floorLabel').inner_text()=='1';checks+=1
  assert await p.locator('#relayOverlay').is_hidden();checks+=1
  await p.close()
  # Un KO provoqué par une tentative de capture ratée suit la même règle.
  cap=make_save(used=['demo-hero-1','demo-hero-2','demo-hero-3'],knocked=['demo-hero-1','demo-hero-2'],active=2)
  cap['data']['waifus'][0]['hp']=0;cap['data']['waifus'][1]['hp']=0
  p=await browser.new_page(viewport={'width':390,'height':844})
  p.on('pageerror',lambda e:errors.append(str(e)))
  await begin(p,cap)
  await p.locator('[data-combat-action="capture"]').click()
  assert await p.locator('#floorLabel').inner_text()=='1';checks+=1
  assert await p.locator('#relayOverlay').is_hidden();checks+=1
  await p.close()
  # Choix AVANT combat : la titulaire sélectionnée est immédiatement comptée 1/3.
  prematch=make_save()
  prematch['data']['tower']['event']['state']='pending'
  prematch['data']['tower']['combat']=None
  p=await browser.new_page(viewport={'width':390,'height':844})
  p.on('pageerror',lambda e:errors.append(str(e)))
  await boot(p,{PREFIX+prematch['id']:json.dumps(prematch,ensure_ascii=False)})
  await p.locator('.save-controls button').first.click()
  await p.locator('#chooseFighterBtn').click()
  selected_id='demo-hero-4'  # Quatrième waifu possédée, mais première engagée.
  await p.locator(f'.fighter-card[data-fighter-hero-id="{selected_id}"]').click()
  await p.locator('#startCombatBtn').click()
  assert await p.locator('#teamUsedCount').inner_text()=='👩 1/3';checks+=1
  stored=json.loads((await snapshot(p))[PREFIX+prematch['id']])
  assert stored['data']['tower']['combat']['usedHeroIds']==[selected_id];checks+=1
  await p.close()
  assert not errors,errors
  await browser.close()
  print('PASS',checks,'vérifications ciblées et aucune erreur JS')
if __name__=='__main__':asyncio.run(main())
