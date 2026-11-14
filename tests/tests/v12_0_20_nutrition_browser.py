"""BELLYMON V12.0.20 : teste l'UI nourriture, les anciennes sauvegardes, et les points réels."""
import asyncio, json, uuid, sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text()
import re
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=list(sorted(ROOT.joinpath('css').glob('*.css')))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
PREFIX=b.PREFIX

def fixture():
    slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
    slot['id']=str(uuid.uuid4());slot['label']='Ancienne partie V12.0.19'
    slot['data']['waifus']=[slot['data']['waifus'][0]]
    slot['data']['waifus'][0].update(rank='E',morph=None,evolutionPoints=95,energy=100)
    slot['data']['food']={'small':12,'large':3}
    slot['data']['tower'].update(floor=1,record=1,room='rest',event=None,combat=None)
    return slot

async def main():
  checks=0
  async with async_playwright() as playwright:
    browser=await playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in (320,390,1440):
      errors=[];page=await browser.new_page(viewport={'width':width,'height':930})
      page.on('pageerror', lambda error: errors.append(str(error)))
      slot=fixture()
      await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
      assert await page.title()=='BELLYMON · V13';checks+=1
      await page.locator('.save-controls button').first.click()
      await page.locator('#tabWaifus').click()
      await page.locator('.owned-card').first.click()
      assert await page.locator('#waifuDetailOverlay').is_visible();checks+=1
      assert '🥩 Steak · 5 pts' in await page.locator('#foodSmallBtn').inner_text();checks+=1
      assert '🍖 Gigot · 25 pts' in await page.locator('#foodLargeBtn').inner_text();checks+=1
      assert await page.locator('#detailSmallFood').inner_text()=='×12';checks+=1
      assert await page.locator('#detailLargeFood').inner_text()=='×3';checks+=1
      assert '+5 pts' in await page.locator('#feedPreview').inner_text();checks+=1
      await page.locator('#foodLargeBtn').click()
      assert '+25 pts' in await page.locator('#feedPreview').inner_text();checks+=1
      await page.locator('#foodSmallBtn').click()
      await page.locator('#feedConfirm').click()
      await page.locator('#morphOverlay').wait_for(state='visible')
      await page.locator('[data-choose-morph="musclee"]').click()
      await page.locator('#morphOverlay').wait_for(state='hidden')
      state=json.loads((await b.snapshot(page))[PREFIX+slot['id']])['data']
      active=state['waifus'][0]
      assert active['rank']=='D' and active['morph']=='musclee';checks+=1
      assert active['evolutionPoints']==0;checks+=1
      assert state['food']=={'small':11,'large':3},state['food'];checks+=1
      # Recharger la page en conditions sauvegarde V12.0.20 : même stock / état.
      await page.locator('#detailClose').click()
      await page.locator('.owned-card').first.click()
      assert await page.locator('#detailSmallFood').inner_text()=='×11';checks+=1
      await page.locator('#foodLargeBtn').click()
      await page.locator('#feedConfirm').click()
      state=json.loads((await b.snapshot(page))[PREFIX+slot['id']])['data']
      assert state['waifus'][0]['evolutionPoints']==25;checks+=1
      assert state['food']=={'small':11,'large':2};checks+=1
      assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'overflow width {width}';checks+=1
      assert not errors,errors
      await page.screenshot(path=str(ROOT.parent/f'BELLYMON_V12.0.20_Nourriture_{width}px.png'),full_page=True)
      await page.close()
    await browser.close()
  print(f'✅ {checks} assertions Chromium V12.0.20 sur 320/390/1440px')

if __name__=='__main__': asyncio.run(main())
