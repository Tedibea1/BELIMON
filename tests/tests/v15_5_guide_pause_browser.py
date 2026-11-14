"""V15.5: in-combat Guide freezes the combat clock and preserves saved battle."""
import asyncio,json,re,sys
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
import v14_browser as v
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text()
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^\"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^\"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=sorted(ROOT.joinpath('css').glob('*.css'))
b.JS=['guide.js','bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']
async def main():
 checks=0;errors=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in [390,1440]:
   page=await browser.new_page(viewport={'width':width,'height':900})
   page.on('pageerror',lambda e:errors.append(str(e)))
   slot=v.fixture(floor=21,enemy='epeiste',classId='spectre',state='fighting')
   await v.open_slot(page,slot)
   await page.locator('#combatHud').wait_for(state='visible')
   before_saved=json.loads((await b.snapshot(page))[b.PREFIX+slot['id']])
   await page.wait_for_timeout(1050)
   await page.locator('#openGuideBtn').click()
   assert await page.locator('#guideScreen').is_visible();checks+=1
   initial=await page.locator('#combatTimer').inner_text()
   await page.wait_for_timeout(1950)
   after=await page.locator('#combatTimer').inner_text()
   assert initial==after,(initial,after);checks+=1
   assert await page.locator('#guideContent img[src$="/commun/E.png"]').count()==13;checks+=1
   await page.locator('#guideBackBtn').click()
   assert await page.locator('#playScreen').is_visible();checks+=1
   assert await page.locator('#combatHud').is_visible();checks+=1
   after_saved=json.loads((await b.snapshot(page))[b.PREFIX+slot['id']])
   assert before_saved['data']['tower']['combat']['turn']==after_saved['data']['tower']['combat']['turn'];checks+=1
   await page.wait_for_timeout(2300)
   resumed=await page.locator('#combatTimer').inner_text()
   assert resumed!=after,(resumed,after);checks+=1
   await page.close()
  await browser.close()
 assert not errors,errors
 print(f'V15.5 GUIDE COMBAT PAUSE: {checks} checks passed, 0 JS errors')
if __name__=='__main__':asyncio.run(main())
