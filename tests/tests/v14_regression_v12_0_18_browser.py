"""V12.0.18: user-facing Chromium tests, UI hospital and preserved HP."""
import asyncio,json,uuid,sys
from pathlib import Path
from playwright.async_api import async_playwright
from importlib import import_module
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(Path(__file__).parent))
b=import_module('three_waifus_browser')
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text()
import re
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=list(sorted(ROOT.joinpath('css').glob('*.css')))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']

PREFIX=b.PREFIX

def fixture(floor=1,combat=False):
  x=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
  x['id']=str(uuid.uuid4());x['label']='V12.0.18 Test soins';x['data']['hospital']={'slots':[]}
  heroes=x['data']['waifus']
  for i in range(2):
    o=dict(heroes[0]);o['id']=f'patient-x{i}';o['hp']=o['maxHp']//2;o['injuredUntil']=0
    heroes.append(o)
  for i,h in enumerate(heroes):
    h['energy']=100;h['injuredUntil']=0
    h['hp']=[0,20,45,40,10][i] if i<5 else 10
    h['stats']={'force':40,'rapidite':20,'constitution':20}
  x['data']['activeWaifuId']=heroes[-1]['id']
  tower=x['data']['tower'];tower.update(floor=floor,record=floor,room='rest',event=None,combat=None)
  if combat:
    hero=heroes[-1];hero['hp']=65;hero['maxHp']=100
    hero['stats']={'force':200,'rapidite':100,'constitution':0}
    enemy={'id':'foe','classId':'epeiste','rank':'E','morph':None,'hp':20,'maxHp':200,'energy':100,
           'stats':{'force':0,'rapidite':1,'constitution':0}}
    tower.update(room='event',event={'type':'combat','state':'fighting','enemy':enemy},
         combat={'turn':0,'lastMessage':'Tour début','effects':{'player':{},'enemy':{}},'knockedOutIds':[], 'usedHeroIds':[hero['id']]})
  return x

async def start_page(browser,width,slot):
  page=await browser.new_page(viewport={'width':width,'height':920})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
  await page.locator('.save-controls button').first.click()
  await page.locator('#playScreen').wait_for(state='visible')
  assert await page.title()=='BELLYMON · V14.1',await page.title()
  return page,errors

async def main():
  checks=0
  async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width in (390,1440):
      slot=fixture();page,errors=await start_page(browser,width,slot)
      await page.locator('#tabWaifus').click()
      assert await page.locator('.owned-card').count()==5;checks+=1
      assert await page.locator('.collection-life').count()==5;checks+=1
      await page.locator('.owned-card').first.click()
      assert await page.locator('#detailHealth .waifu-health-label').is_visible();checks+=1
      await page.locator('#detailClose').click()
      await page.locator('#tabHopital').click()
      assert await page.locator('.hospital-bed').count()==3;checks+=1
      assert await page.locator('.hospital-patient').count()==5;checks+=1
      for _ in range(3):
        await page.locator('[data-hospital-admit]:not([disabled])').first.click()
        await page.wait_for_timeout(170)
      assert await page.locator('.hospital-bed.occupied').count()==3;checks+=1
      assert await page.locator('[data-hospital-admit]:not([disabled])').count()==0;checks+=1
      state=json.loads((await b.snapshot(page))[PREFIX+slot['id']])['data']
      assert len(state['hospital']['slots'])==3;checks+=1
      assert state['waifus'][0]['hp']==0;checks+=1
      assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 4');checks+=1
      await page.screenshot(path=str(ROOT.parent/f'BELLYMON_V12.0.18_Hopital_{width}px.png'),full_page=True)
      await page.close()
      # Greyed hospital above floor one; return to floor one keeps wounds
      above=fixture(floor=3);page,errors2=await start_page(browser,width,above)
      await page.locator('#tabHopital').click()
      assert await page.locator('#hospitalLocked').is_visible();checks+=1
      assert 'Retourne à l’étage 1' in await page.locator('#hospitalLocked').inner_text();checks+=1
      await page.locator('#hospitalReturn').click()
      assert await page.locator('#confirmOverlay').is_visible();checks+=1
      await page.locator('#confirmAccept').click()
      assert await page.locator('#floorLabel').inner_text()=='1';checks+=1
      state=json.loads((await b.snapshot(page))[PREFIX+above['id']])['data']
      assert state['waifus'][0]['hp']==0;checks+=1
      assert not errors and not errors2,(errors,errors2)
      await page.close()
    # A real win should not refill PV; energy only
    slot=fixture(101,combat=True);page,errors=await start_page(browser,390,slot)
    await page.evaluate('Math.random=()=>0.5')
    await page.locator('[data-combat-action="light"]').click()
    await page.wait_for_function('document.querySelector("#continueBtn").hidden === false',timeout=5500)
    state=json.loads((await b.snapshot(page))[PREFIX+slot['id']])['data']
    active=next(x for x in state['waifus'] if x['id']==slot['data']['activeWaifuId'])
    assert active['hp']==65,(active,state['tower']['combat']['lastMessage']);checks+=1
    assert active['energy']==100;checks+=1
    assert state['tower']['event']['state']=='won';checks+=1
    assert not errors,errors
    await page.screenshot(path=str(ROOT.parent/'BELLYMON_V12.0.18_Victoire_PV_390px.png'),full_page=True)
    await page.close()
    # Three knockouts lead to defeat, but no free heal and reserve fighters untouched.
    slot=fixture(floor=101,combat=True)
    heroes=slot['data']['waifus']
    for i,h in enumerate(heroes):
      h['hp']=1 if i<3 else 55;h['maxHp']=100;h['energy']=100
      h['stats']={'force':1,'rapidite':2,'constitution':0}
    slot['data']['activeWaifuId']=heroes[0]['id']
    slot['data']['tower']['combat']['usedHeroIds']=[heroes[0]['id']]
    enemy=slot['data']['tower']['event']['enemy'];enemy.update(hp=100000,maxHp=100000,energy=100,
      stats={'force':10000,'rapidite':80,'constitution':200})
    page,errors=await start_page(browser,390,slot)
    for k in range(3):
      await page.locator('[data-combat-action="defend"]').click()
      if k<2:
        await page.locator('#relayOverlay').wait_for(state='visible',timeout=6000)
        await page.locator('.relay-card').first.click()
        await page.locator('#relayOverlay').wait_for(state='hidden')
      else:
        await page.locator('#floorLabel').wait_for(state='visible')
        await page.wait_for_function('document.querySelector("#floorLabel").textContent === "1"',timeout=6000)
    saved=json.loads((await b.snapshot(page))[PREFIX+slot['id']])['data']
    assert [h['hp'] for h in saved['waifus'][:3]] == [0,0,0], [h['hp'] for h in saved['waifus']];checks+=1
    assert [h['hp'] for h in saved['waifus'][3:]] == [55,55];checks+=1
    assert saved['tower']['event'] is None and saved['tower']['floor']==1;checks+=1
    assert all(h['energy']==100 for h in saved['waifus']);checks+=1
    assert not errors,errors
    await page.screenshot(path=str(ROOT.parent/'BELLYMON_V12.0.18_Defaite_Blessures_390px.png'),full_page=True)
    await page.close()
    await browser.close()
  print(f'✅ {checks} browser checks passed')
if __name__=='__main__':asyncio.run(main())
