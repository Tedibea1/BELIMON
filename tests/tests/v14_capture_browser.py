import asyncio,json,sys
from playwright.async_api import async_playwright
from pathlib import Path
import v14_browser as t
b=t.b
async def main():
 checks=0;errors=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for cls in t.CLASSES:
   slot=t.fixture(floor=21,classId='griffeuse',state='fighting',enemy=cls)
   slot['data']['tower']['event']['enemy'].update(hp=10,maxHp=200)
   page=await browser.new_page(viewport={'width':390,'height':920})
   page.on('pageerror',lambda e: errors.append(str(e)))
   await t.open_slot(page,slot)
   await page.evaluate('Math.random=()=>0.0')
   await page.locator('[data-combat-action="capture"]').click()
   await page.wait_for_function('''id=>{let d=JSON.parse(localStorage.getItem('tour_des_waifus_v1_slot_'+id)).data;return d.tower.event?.state==='captured';}''',arg=slot['id'],timeout=10000)
   d=await t.saved_data(page,slot)
   assert len(d['waifus'])==2,cls;checks+=1
   captured=d['waifus'][1]
   assert captured['classId']==cls and captured['rank']=='D',cls;checks+=1
   assert captured['morph']=='musclee' and captured['hp']==captured['maxHp'],cls;checks+=1
   assert await page.locator('#capturedPortrait').evaluate('(x)=>x.naturalWidth>0'),cls;checks+=1
   # Confirmer la capture avant sélection, y compris en reprenant la sauvegarde sur un autre navigateur
   snap=await b.snapshot(page)
   await page.close()
   page=await browser.new_page(viewport={'width':390,'height':920})
   page.on('pageerror',lambda e:errors.append(str(e)))
   await b.boot(page,snap)
   await page.locator('.save-controls button').first.click()
   d=await t.saved_data(page,slot)
   assert any(x['classId']==cls for x in d['waifus']),cls;checks+=1
   await page.close()
  assert not errors,errors
  await browser.close()
 print(f'V14 CAPTURE : {checks} vérifications réussies, aucune erreur JS')
if __name__=='__main__':asyncio.run(main())
