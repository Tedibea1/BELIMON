import asyncio,re,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
html=re.sub(r'<link\s+rel="stylesheet"\s+href="css/[^\"]+">','',html)
html=re.sub(r'<script defer src="js/[^\"]+"></script>','',html)
html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
local_storage='''(()=>{const db=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{setItem(k,v){db.set(String(k),String(v))},getItem(k){return db.get(String(k))??null},removeItem(k){db.delete(String(k))},clear(){db.clear()},key(i){return [...db.keys()][i]??null},get length(){return db.size}}});Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Math.random=()=>0.4;})();'''
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  async def assets(route):
   rel=route.request.url.split('bellymon.test/')[1].split('?')[0]
   f=root/rel
   if f.is_file(): await route.fulfill(path=str(f))
   else: await route.abort()
  await page.route('https://bellymon.test/**',assets)
  await page.goto('about:blank')
  await page.evaluate(local_storage)
  await page.set_content(html,wait_until='domcontentloaded')
  for css in sorted((root/'css').glob('*.css')):await page.add_style_tag(content=css.read_text())
  for name in ['bonuses','traps','combat','rewards','capture','evolution','auto','combat-ui','game']:
   await page.add_script_tag(content=(root/'js'/f'{name}.js').read_text())
  await page.wait_for_timeout(150)
  await page.locator('#newGameBtn').click()
  await page.locator('#partyName').fill('Test rouge')
  await page.locator('#playerName').fill('Testeur')
  await page.locator('#createForm button[type=submit]').click()
  await page.wait_for_timeout(300)
  await page.locator('#advanceBtn').click()
  await page.locator('#eventAnnouncement').click()
  await page.wait_for_timeout(180)
  await page.locator('#startCombatBtn').click()
  await page.wait_for_timeout(150)
  await page.locator('[data-combat-action="special"]').click()
  # Determine whichever card actually has the hit, then check it during animation and after.
  await page.wait_for_function("document.querySelector('.game-card.impact-hit') !== null", timeout=3000)
  events=[]
  for i in range(13):
   v=await page.evaluate('''() => [...document.querySelectorAll('.game-card.impact-hit')].map(c=>({id:c.id,opacity:getComputedStyle(c,'::after').opacity,animation:getComputedStyle(c,'::after').animationName,fill:getComputedStyle(c,'::after').animationFillMode}))''')
   events.append({'approx_ms':i*80,'hit_cards':v})
   await page.wait_for_timeout(80)
  assert not errors, f'Erreurs JS: {errors}'
  intermediate=[line for line in events if 480 <= line['approx_ms'] <= 640]
  assert intermediate, 'Mesures manquantes'
  for line in intermediate:
   assert len(line['hit_cards']) >= 1, f'Classe d’impact retirée trop tôt : {line}'
   for card in line['hit_cards']:
    assert float(card['opacity']) <= 0.01, f'Flash réapparu à {line["approx_ms"]}ms: {card}'
  assert not events[-1]['hit_cards'], 'Classes d’impact non retirées'
  print('PASS : duel réel, flash initial puis opacité nulle en fin d’animation, disparition définitive du flash, 0 erreur JS.')
  await browser.close()
asyncio.run(run())
