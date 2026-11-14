import asyncio, json
from playwright.async_api import async_playwright
from three_waifus_browser import boot, make_save, PREFIX
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in (320,390,1440):
   page=await browser.new_page(viewport={'width':width,'height':860})
   slot=make_save();slot['data']['tower']={'floor':1,'record':1,'room':'rest','event':None,'combat':None,'activeTraps':[],'history':[]}
   slot['data']['waifus']=[slot['data']['waifus'][0]]
   slot['data']['waifus'][0]['evolutionPoints']=95
   slot['data']['food']={'small':2,'large':0}
   await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
   await page.locator('.save-controls button').first.click()
   await page.locator('#tabWaifus').click()
   await page.locator('.owned-card').first.click()
   assert await page.locator('#waifuDetailOverlay').is_visible()
   await page.locator('#feedConfirm').click()
   await page.locator('#morphOverlay').wait_for(state='visible')
   txt=await page.locator('#morphOverlay').inner_text()
   assert 'Très forte' in txt and 'Très résistante' in txt and 'Très rapide' in txt
   overflow=await page.evaluate('document.documentElement.scrollWidth > window.innerWidth+2')
   if width==320:
    await page.screenshot(path='/mnt/data/BELLYMON_V12.0.6_Morph_Mobile.png',full_page=True)
   assert not overflow,f'horizontal overflow width={width}'
   print('morph modal',width,'ok')
   await page.close()
  await browser.close()
asyncio.run(main())
