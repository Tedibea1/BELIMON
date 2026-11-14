"""Chromium: annonces COMBAT / COFFRE / PIÈGE sans toucher obligatoire (PC / mobile)."""
import asyncio, json, re, time
from pathlib import Path
from playwright.async_api import async_playwright

root=Path(__file__).resolve().parents[1]
css_files=list(sorted((root/'css').glob('*.css')))
js_files=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
html=(root/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link\s+rel="stylesheet"\s+href="css/[^"]+">','',html)
html=re.sub(r'<script defer src="js/[^"]+"></script>','',html)
html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
local_mock='''(()=>{const m=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{setItem(k,v){m.set(String(k),String(v))},getItem(k){return m.get(String(k))??null},removeItem(k){m.delete(k)},clear(){m.clear()},key(i){return [...m.keys()][i]??null},get length(){return m.size}}});Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Math.random=()=>0.4;})();'''

async def launch(page):
    async def assets(route):
        rel=route.request.url.split('bellymon.test/')[1].split('?')[0]
        f=root/rel
        if f.is_file(): await route.fulfill(path=str(f))
        else: await route.abort()
    await page.route('https://bellymon.test/**',assets)
    await page.goto('about:blank')
    await page.evaluate(local_mock)
    await page.set_content(html,wait_until='domcontentloaded')
    for f in css_files: await page.add_style_tag(content=f.read_text(encoding='utf-8'))
    for name in js_files: await page.add_script_tag(content=(root/'js'/name).read_text(encoding='utf-8'))
    await page.locator('#newGameBtn').wait_for(timeout=4000)
    await page.locator('#newGameBtn').click()
    await page.locator('#partyName').fill('Auto fermeture')
    await page.locator('#playerName').fill('Testeur')
    await page.locator('#createForm button[type=submit]').click()
    await page.locator('#playScreen').wait_for(state='visible',timeout=5000)

async def case(browser, kind, mobile):
    context=await browser.new_context(viewport={'width':390 if mobile else 1440, 'height':844 if mobile else 900},is_mobile=mobile,has_touch=mobile,device_scale_factor=2 if mobile else 1)
    page=await context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    await launch(page)
    roll={'combat':0.4,'chest':0.7,'trap':0.99}[kind]
    await page.evaluate('(r)=>{Math.random=()=>r}',roll)
    await page.locator('#advanceBtn').click()
    overlay=page.locator('#eventAnnouncement')
    await overlay.wait_for(state='visible',timeout=5000)
    assert await page.locator('#announcementTitle').inner_text()==('COMBAT' if kind=='combat' else 'COFFRE')
    assert 'TOUCHER POUR PASSER' not in await overlay.inner_text()
    start=time.monotonic()
    await overlay.wait_for(state='hidden',timeout=2700)
    dur=round(time.monotonic()-start,3)
    assert 1.35 <= dur <= 2.5, f'Annonce {kind} n’a pas disparu assez vite: {dur}s'
    # Le coffre s'ouvre AUTOMATIQUEMENT dès la fin de l'annonce.
    if kind=='combat':
        assert await page.locator('#startCombatBtn').is_visible()
        await page.locator('#startCombatBtn').click()
        assert await page.locator('#combatHud').is_visible()
    else:
        assert await page.locator('#openChestBtn').is_hidden(), 'Le bouton Ouvrir ne doit plus apparaître'
        await page.locator('#eventResultOverlay').wait_for(state='visible',timeout=3500)
        result_title=await page.locator('#eventResultTitle').inner_text()
        assert result_title==('COFFRE PIÉGÉ !' if kind=='trap' else 'COFFRE OUVERT'),result_title
        assert await page.locator('#announcementTitle').inner_text()=='COFFRE', 'Pas de seconde annonce bloquante'
        # Simuler un second clic sur l'annonce et sur l'ancien bouton : aucune double application.
        snapshot1=await page.evaluate("""() => {
          const key=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).find(k=>k.startsWith('tour_des_waifus_v1_slot_'));
          const data=JSON.parse(localStorage.getItem(key)).data;
          return {food:data.food,bonuses:data.bonuses,traps:data.tower.activeTraps,event:data.tower.event};
        }""")
        await page.evaluate("""() => {document.getElementById('eventAnnouncement').click();document.getElementById('openChestBtn').click();}""")
        snapshot2=await page.evaluate("""() => {
          const key=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).find(k=>k.startsWith('tour_des_waifus_v1_slot_'));
          const data=JSON.parse(localStorage.getItem(key)).data;
          return {food:data.food,bonuses:data.bonuses,traps:data.tower.activeTraps,event:data.tower.event};
        }""")
        assert snapshot1==snapshot2, 'Récompense / piège appliqué deux fois'
        if kind=='trap':
            assert len(snapshot1['traps'])==1, 'Un seul piège en cours'
        await page.locator('#eventResultClose').click()
        assert await page.locator('#eventResultOverlay').is_hidden()
        assert await page.locator('#continueBtn').is_visible()
    assert not errors, errors
    await context.close()
    return {'device':'mobile' if mobile else 'desktop','event':kind,'auto_closed_after_seconds':dur,'js_errors':errors}

async def skip_case(browser):
    context=await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page=await context.new_page()
    await launch(page)
    await page.locator('#advanceBtn').click()
    overlay=page.locator('#eventAnnouncement')
    await overlay.wait_for(state='visible',timeout=3000)
    await overlay.tap()
    await overlay.wait_for(state='hidden',timeout=500)
    await context.close()
    return {'device':'mobile','event':'tap facultatif','skip_ok':True}

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        # Deux formats et trois types d’événements, y compris l’ouverture du piège.
        results=[]
        for mobile in [False,True]:
            for kind in ['combat','chest','trap']:
                results.append(await case(browser,kind,mobile))
        results.append(await skip_case(browser))
        await browser.close()
    print(json.dumps({'status':'PASS','scenarios':len(results),'results':results},indent=2,ensure_ascii=False))

if __name__=='__main__':asyncio.run(main())
