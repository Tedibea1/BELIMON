"""V12.0.4 : validation visuelle des coins d'images avec Chromium, sur mobile et PC.
La page est injectée en mémoire car l'environnement bloque la navigation file://.
"""
import asyncio, json, re
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright
BASE=Path('/mnt/data')
JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
async def prepare(page, root):
    html=(root/'index.html').read_text(encoding='utf-8')
    html=re.sub(r'<link\s+rel="stylesheet"\s+href="css/[^\"]+">','',html)
    html=re.sub(r'<script defer src="js/[^\"]+"></script>','',html)
    html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
    async def route_asset(route):
        path=route.request.url.split('bellymon.test/',1)[-1].split('?',1)[0]
        f=root/path
        if f.is_file(): await route.fulfill(path=str(f))
        else: await route.abort()
    await page.route('https://bellymon.test/**',route_asset)
    await page.goto('about:blank')
    await page.evaluate('''() => {
      const store=new Map();
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        setItem(k,v){store.set(String(k),String(v))},getItem(k){return store.has(String(k))?store.get(String(k)):null},
        removeItem(k){store.delete(String(k))},clear(){store.clear()},key(i){return [...store.keys()][i]??null},get length(){return store.size}
      }});
      Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
    }''')
    await page.set_content(html,wait_until='domcontentloaded')
    # Appliquer les feuilles dans le même ordre que le HTML : les correctifs V12 sont à la fin.
    for rel in re.findall(r'href="(css/[^\"]+)"',(root/'index.html').read_text()):
        await page.add_style_tag(content=(root/rel).read_text(encoding='utf-8'))
    for name in JS:
        await page.add_script_tag(content=(root/'js'/name).read_text(encoding='utf-8'))
    await page.wait_for_timeout(180)
    demo=json.loads((root/'tests/DEMO_EVOLUTIONS_V7.json').read_text(encoding='utf-8'))
    w=demo['data']['waifus'][0]
    w.update({'classId':'occultiste','rank':'S','morph':'obese','maxHp':245,'hp':245,'energy':100,'evolutionPoints':0})
    demo['data']['waifus']=[w]
    demo['data']['activeWaifuId']=w['id']
    demo['label']='Test du coin blanc - Occultiste S'
    demo['id']='demo-test-corner'
    await page.locator('#pasteBtn').click()
    await page.locator('#pasteInput').fill(json.dumps(demo,ensure_ascii=False))
    await page.locator('#pasteConfirm').click()
    await page.locator('#saveList .save-card').first.wait_for(state='visible')
    await page.locator('#saveList .save-card .save-controls button').first.click()
    await page.locator('#playScreen').wait_for(state='visible')
    await page.locator('#activePortrait').wait_for(state='visible')
    await page.wait_for_function("document.querySelector('#activePortrait').complete && document.querySelector('#activePortrait').naturalWidth > 0")
    await page.wait_for_timeout(150)

async def run():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        checks=0
        for width in [320,390,430,1440]:
            page=await browser.new_page(viewport={'width':width,'height':900 if width<500 else 1000},device_scale_factor=1)
            problems=[]
            page.on('pageerror',lambda error: problems.append(str(error)))
            await prepare(page,BASE/'BELLYMON_V12.0.4')
            style=await page.locator('.portrait-frame').first.evaluate('el=>({r:getComputedStyle(el).borderRadius,o:getComputedStyle(el).overflow,w:el.clientWidth})')
            assert style['r']=='14%',style
            assert style['o']=='hidden',style
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+3')
            assert not problems,problems
            checks+=4
            out=BASE/f'BELLYMON_V12.0.4_{width}px.png'
            await page.locator('#activePortrait').screenshot(path=str(out))
            if width in (390,1440):
                await page.screenshot(path=str(BASE/f'BELLYMON_V12.0.4_Interface_{width}px.png'),full_page=True)
            # Le fond de l'angle doit être celui du panneau, et plus le blanc du PNG.
            im=Image.open(out).convert('RGB')
            rgb=im.getpixel((1,1))
            assert max(rgb)<205, (width,'coin encore blanc',rgb)
            checks+=1
            print('OK',width,'px | cadre',style,'| pixel coin',rgb)
            await page.close()
        await browser.close()
        print('SUCCESS',checks,'checks : 320 / 390 / 430 / 1440 px')
if __name__=='__main__': asyncio.run(run())
