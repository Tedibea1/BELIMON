"""V12.0.3 : vrais tours dans Chromium sur PC et mobile, sans clic dans l'annonce."""
import asyncio, json, re
from pathlib import Path
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
css_files=list(sorted((root/'css').glob('*.css')))
js_files=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
html=(root/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link\s+rel="stylesheet"\s+href="css/[^\"]+">','',html)
html=re.sub(r'<script defer src="js/[^\"]+"></script>','',html)
html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
localStorageMock='''(() => {const db=new Map();const local={setItem(k,v){db.set(String(k),String(v))},getItem(k){return db.has(String(k))?db.get(String(k)):null},removeItem(k){db.delete(String(k))},clear(){db.clear()},key(i){return [...db.keys()][i]??null},get length(){return db.size}};Object.defineProperty(window,'localStorage',{configurable:true,value:local});Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Math.random=()=>0.4;})();'''
async def launch(page):
    async def route_asset(route):
        rel=route.request.url.split('bellymon.test/')[1].split('?')[0]
        file=root/rel
        if file.is_file():await route.fulfill(path=str(file))
        else:await route.abort()
    await page.route('https://bellymon.test/**',route_asset)
    await page.goto('about:blank')
    await page.evaluate(localStorageMock)
    await page.set_content(html,wait_until='domcontentloaded')
    for file in css_files: await page.add_style_tag(content=file.read_text(encoding='utf-8'))
    for f in js_files: await page.add_script_tag(content=(root/'js'/f).read_text(encoding='utf-8'))
    await page.wait_for_timeout(250)
async def run():
 async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    checks=0
    for width in [390,1440]:
        page=await browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda err: errors.append(str(err)))
        await launch(page)
        assert await page.title()=='BELLYMON · V12.0.11'
        await page.locator('#newGameBtn').click()
        await page.locator('#partyName').fill('Test des lignes')
        await page.locator('#playerName').fill('Testeur')
        await page.locator('#createForm button[type=submit]').click()
        await page.locator('#playScreen').wait_for(state='visible')
        await page.locator('#advanceBtn').click()
        await page.locator('#eventAnnouncement').click()
        await page.locator('#startCombatBtn').click()
        await page.locator('[data-combat-action="special"]').click()
        await page.wait_for_timeout(200)
        text=await page.locator('#sessionHint').inner_text()
        assert '\n' in text,(width,text)
        first,second=text.split('\n',1)
        assert 'Ta waifu' in first,(width,text)
        assert 'L’adversaire' in second,(width,text)
        assert 'Constitution adverse −15 %' in first,(width,text)
        assert await page.locator('#sessionHint').evaluate('(el)=>getComputedStyle(el).whiteSpace')=='pre-line'
        assert not errors,(width,errors)
        assert not await page.evaluate('document.documentElement.scrollWidth > window.innerWidth+3')
        checks+=7
        output=Path('/mnt/data')/f'BELLYMON_V12.0.8_Deux_Lignes_{"Mobile" if width==390 else "PC"}.png'
        await page.screenshot(path=str(output),full_page=True)
        print('OK',width,'px:',repr(text),'=>',output)
        await page.close()
    await browser.close()
    print('✅ Chromium :',checks,'vérifications PC/mobile réussies')
if __name__=='__main__': asyncio.run(run())
