import asyncio,re,sys,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
import v14_browser as v
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text(encoding='utf-8')
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=sorted(ROOT.joinpath('css').glob('*.css'))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']
async def main():
 checks=0;errors=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in (390,1440):
   page=await browser.new_page(viewport={'width':width,'height':900})
   page.on('pageerror',lambda x:errors.append(str(x)))
   slot=v.fixture(21,'epeiste','maudite','fighting')
   await v.open_slot(page,slot)
   assert await page.title()=='BELLYMON · V14.8'; checks+=1
   assert await page.locator('#specialActionName').inner_text()=='Malédiction du sang';checks+=1
   assert await page.evaluate("window.TDWCombat.SPECIALS.maudite.description.includes('10 %')");checks+=1
   await page.locator('[data-combat-action="special"]').click()
   await page.wait_for_function('''id=>{const s=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return s&&JSON.parse(s).data.tower.combat?.turn===1}''',arg=slot['id'],timeout=10000)
   d=await v.saved_data(page,slot)
   assert d['waifus'][0]['energy']==80;checks+=1
   assert d['tower']['combat']['effects']['enemy'].get('bloodCurse');checks+=1
   assert not errors,errors
   await page.close()
  await browser.close()
 print(f'V14.8 BROWSER: {checks} contrôles, 0 erreur JS')
if __name__=='__main__':asyncio.run(main())
