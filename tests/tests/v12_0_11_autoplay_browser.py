"""BELLYMON 12.0.11 — Chromium: autoplay immédiat et refus simulé."""
import asyncio, json
from playwright.async_api import async_playwright
from audio_banner_browser import boot, ROOT, HTML, CSS, JS, MOCK

async def boot_blocked(page, initial=None):
    """Simule le refus du navigateur de jouer un MP3 sans geste utilisateur."""
    async def assets(route):
        rel=route.request.url.split('bellymon.test/', 1)[-1].split('?')[0]
        asset=ROOT/rel
        if asset.is_file(): await route.fulfill(path=str(asset))
        else: await route.abort()
    await page.route('https://bellymon.test/**', assets)
    await page.goto('about:blank')
    await page.evaluate(MOCK, initial or {})
    await page.set_content(HTML, wait_until='domcontentloaded')
    for css in CSS: await page.add_style_tag(content=css.read_text())
    await page.evaluate("""() => {
      let userGesture = false;
      const original = HTMLMediaElement.prototype.play;
      document.addEventListener('pointerup', () => userGesture = true, true);
      document.addEventListener('keydown', () => userGesture = true, true);
      document.addEventListener('click', () => userGesture = true, true);
      HTMLMediaElement.prototype.play = function() {
        if (!userGesture) return Promise.reject(new DOMException('Autoplay interdit avant geste', 'NotAllowedError'));
        return original.apply(this, arguments);
      };
    }""")
    for name in JS: await page.add_script_tag(content=(ROOT/'js'/name).read_text())
    await page.wait_for_timeout(250)

async def check(browser, policy, width, disabled=False):
    context=await browser.new_context(viewport={'width':width,'height':840},device_scale_factor=1)
    page=await context.new_page()
    errors=[]
    page.on('pageerror', lambda e:errors.append(str(e)))
    initial={'bellymon_audio_preferences_v1':json.dumps({'music':False,'sfx':True,'musicVolume':35,'sfxVolume':55})} if disabled else None
    if policy=='strict': await boot_blocked(page, initial)
    else: await boot(page, initial)
    await page.locator('#newGameBtn').wait_for(state='visible', timeout=10000)
    assert await page.title()=='BELLYMON · V12.0.11'
    assert await page.locator('#menuMusicBtn').count()==0
    assert await page.locator('#audioSettingsBtn').is_visible()
    await page.wait_for_timeout(1100)
    state=await page.evaluate('window.BellymonAudio.state()')
    assert state['scene']=='exploration',state
    assert state['media']['exploration']['error'] is None,state
    if disabled:
        assert state['settings']['music'] is False,state
        assert state['media']['exploration']['paused'] is True,state
        await page.locator('.intro-panel h2').click()
        await page.wait_for_timeout(300)
        state=await page.evaluate('window.BellymonAudio.state()')
        assert state['media']['exploration']['paused'] is True,state
        await page.locator('#audioSettingsBtn').click()
        await page.locator('#musicEnabled').check()
        await page.wait_for_timeout(700)
        state=await page.evaluate('window.BellymonAudio.state()')
        assert state['media']['exploration']['paused'] is False,state
    elif policy=='permit':
        assert state['media']['exploration']['paused'] is False,state
        assert state['media']['exploration']['readyState']>=2,state
        assert state['media']['exploration']['currentTime']>0.2,state
        assert state['unlocked'] is False,state
    else:
        assert state['media']['exploration']['paused'] is True,state
        assert state['unlocked'] is False,state
        await page.locator('.intro-panel h2').click()
        await page.wait_for_timeout(700)
        state=await page.evaluate('window.BellymonAudio.state()')
        assert state['media']['exploration']['paused'] is False,state
        assert state['unlocked'] is True,state
    assert not errors,errors
    result={'policy':policy,'width':width,'music_disabled':disabled,
            'audio_playing':not state['media']['exploration']['paused'],
            'readyState':state['media']['exploration']['readyState'],
            'currentTime':round(state['media']['exploration']['currentTime'],2),
            'page_errors':errors}
    await context.close()
    return result

async def main():
    reports=[]
    async with async_playwright() as p:
        for policy,flag in [('permit','no-user-gesture-required'),('strict','user-gesture-required')]:
            browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                args=['--no-sandbox','--autoplay-policy='+flag])
            for width in (390,1440): reports.append(await check(browser,policy,width))
            reports.append(await check(browser,policy,390,True))
            await browser.close()
    print(json.dumps({'success':len(reports),'results':reports},ensure_ascii=False,indent=2))
if __name__=='__main__':asyncio.run(main())
