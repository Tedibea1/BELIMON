"""V14.1: recovery cooldown UI, saving, manual combat and AUTO."""
import asyncio,json,re,uuid,sys
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
b.ROOT=ROOT
b.HTML=re.sub(r'<script defer src="js/[^\"]+"></script>','',re.sub(r'<link rel="stylesheet" href="css/[^\"]+">','',ROOT.joinpath('index.html').read_text()))
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=list(sorted(ROOT.joinpath('css').glob('*.css')))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']

def fixture(auto=False):
 slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
 slot['id']=str(uuid.uuid4());slot['label']='Cooldown récupération';slot['data']['autoCombat']=auto
 hero=slot['data']['waifus'][0];slot['data']['waifus']=[hero];slot['data']['activeWaifuId']=hero['id']
 hero.update(classId='pretresse',hp=1000,maxHp=1000,energy=0,stats={'force':3,'rapidite':40,'constitution':20},injuredUntil=0)
 foe={'id':'foe','classId':'pretresse','rank':'D','morph':'musclee','hp':1000,'maxHp':1000,'energy':0,'stats':{'force':3,'rapidite':10,'constitution':20}}
 slot['data']['tower'].update(floor=22,record=22,room='event',event={'type':'combat','state':'fighting','enemy':foe},
 combat={'turn':0,'lastMessage':'Début du combat.','effects':{'player':{},'enemy':{}},'knockedOutIds':[],'usedHeroIds':[hero['id']]})
 return slot
async def state(page,slot):return json.loads((await b.snapshot(page))[b.PREFIX+slot['id']])['data']
async def open_slot(page,slot,snapshot=None):
 await b.boot(page,snapshot or {b.PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
 await page.locator('.save-controls button').first.click()
 await page.locator('#playScreen').wait_for(state='visible')
async def wait_turn(page,slot,turn):
 await page.wait_for_function('''arg=>{const x=localStorage.getItem('tour_des_waifus_v1_slot_'+arg.id);return !!x && JSON.parse(x).data.tower.combat?.turn===arg.turn}''',arg={'id':slot['id'],'turn':turn},timeout=9500)
async def main():
 checks=0;errs=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':920})
  page.on('pageerror',lambda e:errs.append(str(e)))
  slot=fixture();await open_slot(page,slot)
  assert await page.title()=='BELLYMON · V14.2';checks+=1
  rec=page.locator('[data-combat-action="recover"]')
  assert await rec.is_enabled();checks+=1
  await rec.click();await wait_turn(page,slot,1)
  s=await state(page,slot)
  assert s['tower']['combat']['effects']['player']['recoverReadyTurn']==7;checks+=1
  assert s['tower']['combat']['effects']['enemy']['recoverReadyTurn']==7;checks+=1
  assert s['waifus'][0]['energy']==67;checks+=1
  assert await rec.is_disabled();checks+=1
  assert '5 tours de recharge' in await rec.inner_text();checks+=1
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4');checks+=1
  snap=await b.snapshot(page)
  await page.close()
  # Recharge page using backed-up local save; UI and timer remain the same.
  page=await browser.new_page(viewport={'width':390,'height':920})
  page.on('pageerror',lambda e:errs.append(str(e)))
  await open_slot(page,slot,snap)
  rec=page.locator('[data-combat-action="recover"]')
  assert await rec.is_disabled();checks+=1
  assert '5 tours' in await rec.inner_text();checks+=1
  for turn in range(2,7):
   await page.locator('[data-combat-action="defend"]').click()
   await wait_turn(page,slot,turn)
   remaining=max(0,6-turn) # bouton pour le tour suivant
   if remaining:
    await page.wait_for_function('''n=>document.querySelector("[data-combat-action='recover'] small").textContent.includes(n+' tour')''',arg=remaining,timeout=4000)
    assert await rec.is_disabled(),turn;checks+=1
   else:
    await page.wait_for_function('''()=>!document.querySelector("[data-combat-action='recover']").disabled''',timeout=4000)
    assert await rec.is_enabled(),turn;checks+=1
  assert await rec.is_enabled(),'available at T7 after 5 complete rounds';checks+=1
  await rec.click();await wait_turn(page,slot,7)
  s=await state(page,slot)
  assert s['tower']['combat']['effects']['player']['recoverReadyTurn']==13;checks+=1
  assert s['waifus'][0]['energy']==100;checks+=1
  await page.close()
  # AUTO starts by recovering, but does not recover during the locked turns.
  page=await browser.new_page(viewport={'width':390,'height':920})
  page.on('pageerror',lambda e:errs.append(str(e)))
  slot=fixture(auto=True);await open_slot(page,slot)
  await wait_turn(page,slot,1)
  s=await state(page,slot)
  assert s['tower']['combat']['lastAction']=='recover';checks+=1
  await wait_turn(page,slot,2)
  s=await state(page,slot)
  assert s['tower']['combat']['lastAction']!='recover';checks+=1
  assert s['tower']['combat']['effects']['player']['recoverReadyTurn']==7;checks+=1
  assert not errs,errs
  await page.close();await browser.close()
 print(f'✅ V14.1 browser: {checks} vérifications réussies')
if __name__=='__main__':asyncio.run(main())
