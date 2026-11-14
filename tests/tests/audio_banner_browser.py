"""V12.0.7 — test Chrome réel des MP3, réglages audio et bandeau du combat.
Lancement : python tests/audio_banner_browser.py
"""
import asyncio, json, re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT.joinpath('index.html').read_text()
HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',HTML)
HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',HTML)
HTML=HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
CSS=list(sorted(ROOT.joinpath('css').glob('*.css')))
JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
MOCK='''(items) => {const db=new Map(Object.entries(items||{}));const store={getItem(k){return db.has(String(k))?db.get(String(k)):null},setItem(k,v){db.set(String(k),String(v))},removeItem(k){db.delete(String(k))},key(i){return [...db.keys()][i]||null},clear(){db.clear()},get length(){return db.size}};Object.defineProperty(window,'localStorage',{configurable:true,value:store});Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Math.random=()=>0.4;}'''
async def boot(page,initial=None):
    async def assets(route):
        rel=route.request.url.split('bellymon.test/',1)[-1].split('?')[0]
        asset=ROOT/rel
        if asset.is_file():await route.fulfill(path=str(asset))
        else:await route.abort()
    await page.route('https://bellymon.test/**',assets)
    await page.goto('about:blank')
    await page.evaluate(MOCK,initial or {})
    await page.set_content(HTML,wait_until='domcontentloaded')
    for css in CSS:await page.add_style_tag(content=css.read_text())
    for name in JS:await page.add_script_tag(content=ROOT.joinpath('js',name).read_text())
    await page.wait_for_timeout(250)
async def snapshot(page):
    return await page.evaluate('''() => Object.fromEntries(Array.from({length: localStorage.length},(_,i)=>{const key=localStorage.key(i);return [key,localStorage.getItem(key)]}))''')

async def main():
    count=0
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
            args=['--no-sandbox','--autoplay-policy=user-gesture-required'])
        for width in [320,390,1440]:
            page=await browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            await boot(page)
            await page.locator('#newGameBtn').wait_for(state='visible')
            assert await page.title()=='BELLYMON · V12.0.11';count+=1
            assert await page.locator('#audioSettingsBtn').is_visible();count+=1
            # Sans geste utilisateur, rien ne doit jouer.
            before=await page.evaluate('window.BellymonAudio.state()')
            assert before['scene']=='exploration' and not before['unlocked'] and before['media']['exploration']['error'] is None;count+=1
            await page.locator('#audioSettingsBtn').click()
            assert await page.locator('#audioOverlay').is_visible();count+=1
            if width==390:
                await page.screenshot(path='/mnt/data/BELLYMON_V12.0.8_Reglages_Audio_Mobile.png',full_page=True)
            await page.locator('#musicVolume').fill('65')
            await page.locator('#sfxVolume').fill('25')
            cfg=await page.evaluate('window.BellymonAudio.getSettings()')
            assert cfg['musicVolume']==65 and cfg['sfxVolume']==25;count+=1
            assert await page.locator('#musicVolumeValue').text_content()=='65 %';count+=1
            await page.locator('#sfxEnabled').uncheck()
            assert (await page.evaluate('window.BellymonAudio.getSettings()'))['sfx'] is False;count+=1
            await page.locator('#sfxEnabled').check()
            await page.locator('#audioPreviewBtn').click()
            await page.locator('#audioDoneBtn').click()
            assert await page.locator('#audioOverlay').is_hidden();count+=1
            # Créer une partie, marche sur écran étroit.
            await page.locator('#newGameBtn').click()
            await page.locator('#partyName').fill(f'Audio {width}')
            await page.locator('#playerName').fill('Testeur')
            await page.locator('#createForm button[type=submit]').click()
            await page.locator('#playScreen').wait_for(state='visible')
            await page.wait_for_timeout(700)
            assert (await page.evaluate('window.BellymonAudio.state()'))['scene']=='exploration';count+=1
            assert await page.locator('#audioSettingsBtn').is_visible();count+=1
            if width==390:
                await page.screenshot(path='/mnt/data/BELLYMON_V12.0.8_Audio_Mobile.png',full_page=True)
            await page.locator('#advanceBtn').click()
            await page.locator('#eventAnnouncement').click()
            await page.locator('#startCombatBtn').click()
            await page.wait_for_timeout(650)
            state=await page.evaluate('window.BellymonAudio.state()')
            assert state['scene']=='combat' and state['playing']=='combat',state;count+=1
            print('Lecture MP3 réelle',width,'px:',state['media']['combat']['currentTime'],'s, prêt',state['media']['combat']['readyState'])
            assert state['media']['combat']['readyState']>=2 and state['media']['combat']['error'] is None,state;count+=1
            assert state['media']['combat']['paused'] is False,state;count+=1
            assert state['media']['exploration']['paused'] is True,state;count+=1
            await page.locator('[data-combat-action="special"]').click()
            await page.wait_for_timeout(150)
            assert await page.locator('#sessionStatus').is_hidden();count+=1
            assert not await page.locator('#sessionStatus').text_content();count+=1
            summary=await page.locator('#sessionHint').inner_text()
            assert 'Ta waifu' in summary and '\nL’adversaire' in summary,repr(summary);count+=1
            assert 'Archère arcanique · Rang' not in summary;count+=1
            assert not await page.evaluate('document.documentElement.scrollWidth > window.innerWidth+3'),width;count+=1
            if width==390:
                await page.screenshot(path='/mnt/data/BELLYMON_V12.0.8_Combat_Mobile.png',full_page=True)
            if width==1440:
                await page.screenshot(path='/mnt/data/BELLYMON_V12.0.8_Combat_PC.png',full_page=True)
            await page.locator('#audioSettingsBtn').click()
            await page.locator('#musicEnabled').uncheck()
            assert (await page.evaluate('window.BellymonAudio.state()'))['playing'] is None;count+=1
            await page.locator('#musicEnabled').check()
            await page.locator('#audioDoneBtn').click()
            assert (await page.evaluate('window.BellymonAudio.state()'))['playing']=='combat';count+=1
            # Les réglages survivent au rechargement sans affecter les parties.
            saved=await snapshot(page)
            await page.close()
            page=await browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
            page.on('pageerror',lambda e:errors.append(str(e)))
            await boot(page,saved)
            await page.locator('#newGameBtn').wait_for(state='visible')
            cfg=await page.evaluate('window.BellymonAudio.getSettings()')
            assert cfg['musicVolume']==65 and cfg['sfxVolume']==25 and cfg['music'] and cfg['sfx'];count+=1
            assert not errors,errors;count+=1
            print(f'Chromium {width}px : OK, actions sur deux lignes, scène de combat, préférences sonores conservées.')
            await page.close()
        await browser.close()
    print('✅ V12.0.8 :',count,'contrôles Chromium réussis (320, 390, 1440 px).')

if __name__=='__main__':asyncio.run(main())
