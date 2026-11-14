"""Auto tower regression: chest/trap, battle loss and paid-shortcut safety."""
import asyncio,sys
from playwright.async_api import async_playwright
import v14_5_auto_tower_browser as t

async def run():
 checks=0
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for roll,expected in ((0.72,'chest'),(0.97,'trap')):
   page=await browser.new_page(viewport={'width':390,'height':900})
   err=[];page.on('pageerror',lambda e:err.append(str(e)))
   s=t.fixture();await t.start(page,s)
   await page.evaluate('value => { Math.random = () => value; }',roll)
   await page.locator('#towerAutoButton').click()
   await page.wait_for_function('document.getElementById("sideFloor").textContent === "2"',timeout=22000)
   d=await t.state(page,s)
   assert d['tower']['floor']==2 and d['tower']['record']==226, d['tower'];checks+=1
   assert d['food']['small']>=13000, d['food'];checks+=1
   assert d['autoCombat'] is True;checks+=1
   assert not err,err
   print('AUTO chest/trap',expected,'passed',flush=True)
   await page.close()
  # A real loss must switch AUTO off so the player can heal rather than re-enter the tower.
  page=await browser.new_page(viewport={'width':390,'height':900})
  err=[];page.on('pageerror',lambda e:err.append(str(e)))
  s=t.fixture()
  hero=next(h for h in s['data']['waifus'] if h['id']==s['data']['activeWaifuId'])
  s['data']['waifus']=[hero]
  hero['hp']=1;hero['maxHp']=100;hero['energy']=10;hero['stats']={'force':1,'rapidite':1,'constitution':1}
  s['data']['autoCombat']=True
  tower=s['data']['tower']
  tower['room']='event'
  tower['event']={'type':'combat','state':'fighting','enemy':{
    'id':'test-killer','classId':'bagarreuse','rank':'E','morph':None,
    'hp':300,'maxHp':300,'energy':100,'stats':{'force':500,'rapidite':500,'constitution':100}}}
  tower['combat']={'turn':0,'lastMessage':'En combat','effects':{'player':{},'enemy':{}},
                   'usedHeroIds':[hero['id']],'knockedOutIds':[]}
  await t.start(page,s)
  await page.wait_for_function('document.getElementById("eventResultTitle").textContent === "DÉFAITE"',timeout=15000)
  d=await t.state(page,s)
  assert d['autoCombat'] is False and d['tower']['room']=='rest';checks+=1
  await page.wait_for_timeout(2000)
  d2=await t.state(page,s)
  assert d2['tower']['floor']==1 and d2['tower']['room']=='rest';checks+=1
  assert not err,err
  print('AUTO defeat stop passed',flush=True)
  await browser.close()
 print('PASS',checks,'automatic chests, traps, stop on defeat, no shortcut spending')
if __name__=='__main__': asyncio.run(run())
