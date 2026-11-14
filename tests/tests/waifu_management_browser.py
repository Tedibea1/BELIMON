"""BELLYMON V12.0.5: noms, tri, suppression, sauvegarde et rendu responsive."""
import asyncio, json, re, uuid
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
CSS=sorted((ROOT/'css').glob('*.css'))
JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']
html=(ROOT/'index.html').read_text()
html=re.sub(r'<link\s+rel="stylesheet"\s+href="css/[^"]+">','',html)
html=re.sub(r'<script defer src="js/[^"]+"></script>','',html)
html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
MOCK='''(items) => {const db=new Map(Object.entries(items));const store={getItem(k){return db.has(String(k))?db.get(String(k)):null},setItem(k,v){db.set(String(k),String(v))},removeItem(k){db.delete(String(k))},clear(){db.clear()},key(i){return [...db.keys()][i]??null},get length(){return db.size}};Object.defineProperty(window,'localStorage',{configurable:true,value:store});Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Math.random=()=>.4;}'''
async def boot(page,initial=None):
 async def assets(route):
  rel=route.request.url.split('bellymon.test/',1)[-1].split('?')[0]
  path=ROOT/rel
  if path.is_file():await route.fulfill(path=str(path))
  else:await route.abort()
 await page.route('https://bellymon.test/**',assets)
 await page.goto('about:blank')
 await page.evaluate(MOCK,initial or {})
 await page.set_content(html,wait_until='domcontentloaded')
 for f in CSS:await page.add_style_tag(content=f.read_text())
 for name in JS:await page.add_script_tag(content=(ROOT/'js'/name).read_text())
 await page.wait_for_timeout(250)
async def storage(page):return await page.evaluate('Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>{const k=localStorage.key(i);return [k,localStorage.getItem(k)]}))')
async def do_tests():
 checks=0; all_errors=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  page.set_default_timeout(8000)
  page.on('pageerror',lambda err:all_errors.append(str(err)))
  await boot(page)
  await page.locator('#newGameBtn').click()
  await page.locator('#partyName').fill('V12.0.5 test')
  await page.locator('#playerName').fill('Tester')
  await page.locator('#createForm button[type="submit"]').click()
  await page.locator('#playScreen').wait_for(state='visible')
  items=await storage(page)
  prefix='tour_des_waifus_v1_slot_'
  key=next(k for k in items if k.startswith(prefix))
  slot=json.loads(items[key]); base=slot['data']['waifus'][0]
  assert base['rank']=='E' and 'nickname' not in base; checks+=1
  def duplicate(id,rank='E',cls='epeiste',morph=None):
   h=base.copy();h.update(id=id,rank=rank,classId=cls,morph=morph,stats=base['stats'].copy());return h
  slot['data']['waifus'].extend([
   duplicate(str(uuid.uuid4())),
   duplicate(str(uuid.uuid4()),'S','griffeuse','musclee'),
   duplicate(str(uuid.uuid4()),'A','bagarreuse','obese'),
   duplicate(str(uuid.uuid4()),'D','occultiste','chetive')])
  initial={key:json.dumps(slot,ensure_ascii=False)}
  await page.close()
  for width in [390,1440]:
   print('Testing width',width,flush=True)
   page=await browser.new_page(viewport={'width':width,'height':950})
   page.set_default_timeout(8000)
   page.on('pageerror',lambda err:all_errors.append(str(err)))
   await boot(page,initial)
   await page.get_by_role('button',name='▶ Continuer').click()
   await page.locator('#tabWaifus').click()
   assert await page.locator('.owned-card').count()==5;checks+=1
   ranks=await page.locator('.owned-card .tiny-rank').all_text_contents()
   assert ranks==['E','S','A','D','E'],ranks;checks+=1  # Active first, then descending rank
   names=await page.locator('.owned-card .owned-card-header strong').all_text_contents()
   assert not any('n°' in n for n in names),names;checks+=1
   assert sum('Épéiste' in n for n in names)==2,names;checks+=1
   # Renommage du premier doublon : sauvegarde, affichage de la fiche et HUD
   await page.locator(f'.owned-card[data-hero-id="{base["id"]}"]').click()
   await page.locator('#detailRename').click()
   assert await page.locator('#renameHeroOverlay').is_visible();checks+=1
   await page.locator('#renameHeroInput').fill('Luna')
   if width==390:
    shot=Path('/mnt/data/BELLYMON_V12.0.5_Renommage_Mobile.png');await page.screenshot(path=str(shot),full_page=True);print('Capture:',shot)
   await page.locator('#renameHeroSave').click()
   assert await page.locator('#detailTitle').inner_text()=='⚔️ Luna';checks+=1
   await page.locator('#detailClose').click()
   await page.locator('.owned-card[data-hero-id="'+slot['data']['waifus'][1]['id']+'"]').click()
   await page.locator('#detailRename').click()
   await page.locator('#renameHeroInput').fill('Luna')
   await page.locator('#renameHeroSave').click()
   await page.locator('#detailClose').click()
   names=await page.locator('.owned-card .owned-card-header strong').all_text_contents()
   assert sum('Luna' in name for name in names)==2,names;checks+=1
   items=await storage(page);live=json.loads(items[key]);checks+=1
   assert sum(h.get('nickname')=='Luna' for h in live['data']['waifus'])==2;checks+=1
   # Suppression : annulation puis confirmation, y compris suppression de l'active
   await page.locator('.owned-card[data-hero-id="'+base['id']+'"]').click()
   await page.locator('#detailDelete').click()
   assert await page.locator('#confirmOverlay').is_visible();checks+=1
   assert 'irréversible' in (await page.locator('#confirmMessage').inner_text());checks+=1
   if width==390:
    shot=Path('/mnt/data/BELLYMON_V12.0.5_Confirmation_Mobile.png');await page.screenshot(path=str(shot),full_page=True);print('Capture:',shot)
   await page.locator('#confirmCancel').click()
   assert await page.locator('.owned-card').count()==5;checks+=1
   await page.locator('#detailDelete').click()
   await page.locator('#confirmAccept').click()
   await page.wait_for_timeout(150)
   assert await page.locator('.owned-card').count()==4;checks+=1
   assert await page.locator('#waifuDetailOverlay').is_hidden();checks+=1
   items=await storage(page);live=json.loads(items[key]);checks+=1
   assert len(live['data']['waifus'])==4;checks+=1
   assert live['data']['activeWaifuId']==slot['data']['waifus'][2]['id'],live['data']['activeWaifuId'];checks+=1
   assert await page.locator('.owned-card').first.get_attribute('data-hero-id')==live['data']['activeWaifuId'];checks+=1
   assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth+3');checks+=1
   assert not all_errors,all_errors
   if width==390:
    await page.locator('.owned-card').first.click()
    path=Path('/mnt/data/BELLYMON_V12.0.5_Fiche_Mobile.png')
    await page.screenshot(path=str(path),full_page=True);print('Capture:',path)
   else:
    await page.locator('#detailClose').click() if await page.locator('#waifuDetailOverlay').is_visible() else None
    path=Path('/mnt/data/BELLYMON_V12.0.5_Collection_PC.png')
    await page.screenshot(path=str(path),full_page=True);print('Capture:',path)
   await page.close()
  # Sécurité : la dernière waifu est intouchable.
  page=await browser.new_page(viewport={'width':390,'height':820})
  page.on('pageerror',lambda err:all_errors.append(str(err)))
  before={key:items[key]}
  only=slot.copy();only['data']={**slot['data'],'waifus':[base],'activeWaifuId':base['id']}
  await boot(page,{key:json.dumps(only)})
  await page.get_by_role('button',name='▶ Continuer').click()
  await page.locator('#tabWaifus').click();await page.locator('.owned-card').first.click()
  assert await page.locator('#detailDelete').is_disabled();checks+=1
  assert not all_errors,all_errors
  await browser.close()
 print('✅ Tests réussis:',checks,'; erreurs JS:',len(all_errors))
if __name__=='__main__':asyncio.run(do_tests())
