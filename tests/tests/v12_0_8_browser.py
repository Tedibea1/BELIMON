"""Chromium réel : musique dans « Mes parties » et reprise coffre antérieur à l'annonce."""
import asyncio,json
from playwright.async_api import async_playwright
from audio_banner_browser import boot,snapshot

async def scenario(browser,width,kind):
    context=await browser.new_context(viewport={'width':width,'height':850},device_scale_factor=1)
    page=await context.new_page()
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await boot(page)
    await page.locator('#newGameBtn').wait_for(state='visible')
    assert await page.title()=='BELLYMON · V12.0.11'
    state=await page.evaluate('window.BellymonAudio.state()')
    assert state['scene']=='exploration' and not state['unlocked'],state
    assert await page.locator('#menuMusicBtn').count()==0
    await page.locator('.intro-panel h2').click()
    await page.wait_for_timeout(800)
    state=await page.evaluate('window.BellymonAudio.state()')
    assert state['scene']=='exploration' and state['playing']=='exploration',state
    assert not state['media']['exploration']['paused'] and state['media']['exploration']['readyState']>=2,state
    assert state['media']['exploration']['currentTime']>0,state
    await page.locator('#newGameBtn').click()
    await page.locator('#partyName').fill('Coffre en attente')
    await page.locator('#playerName').fill('Testeur')
    await page.locator('#createForm button[type=submit]').click()
    await page.locator('#playScreen').wait_for(state='visible')
    await page.locator('#menuBtn').click()
    await page.locator('#menuScreen').wait_for(state='visible')
    state=await page.evaluate('window.BellymonAudio.state()')
    assert state['playing']=='exploration',state
    # Le coffre était pending dans la sauvegarde au moment de quitter la partie.
    await page.locator('.save-controls button').first.click()
    await page.evaluate('(r)=>{Math.random=()=>r}',0.99 if kind=='trap' else 0.7)
    await page.locator('#advanceBtn').click()
    await page.locator('#eventAnnouncement').wait_for(state='visible')
    pending=await snapshot(page)
    assert any(json.loads(v).get('data',{}).get('tower',{}).get('event',{}).get('type')==kind and json.loads(v).get('data',{}).get('tower',{}).get('event',{}).get('state')=='pending' for k,v in pending.items() if k.startswith('tour_des_waifus_v1_slot_'))
    await page.close()
    page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    await boot(page,pending)
    await page.locator('#newGameBtn').wait_for(state='visible')
    await page.locator('.save-controls button').first.click()
    await page.locator('#eventAnnouncement').wait_for(state='visible',timeout=3000)
    assert await page.locator('#announcementTitle').inner_text()=='COFFRE'
    await page.locator('#eventResultOverlay').wait_for(state='visible',timeout=4000)
    assert await page.locator('#eventResultTitle').inner_text()==('COFFRE PIÉGÉ !' if kind=='trap' else 'COFFRE OUVERT')
    assert await page.locator('#openChestBtn').is_hidden()
    assert not errors, errors
    result={'width':width,'menu_music_played':True,'menu_music_continued':True,'pending_event_resumed':kind,'errors':errors}
    await context.close()
    return result

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=user-gesture-required'])
        output=[]
        for width in [390,1440]:
            for kind in ['chest','trap']:
                output.append(await scenario(browser,width,kind))
        await browser.close()
    print(json.dumps({'PASS':output},ensure_ascii=False,indent=2))
if __name__=='__main__':asyncio.run(main())
