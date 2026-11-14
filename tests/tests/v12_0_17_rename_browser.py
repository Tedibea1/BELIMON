"""Chromium PC/mobile: Absorption text, activated effect, legacy save key."""
import asyncio,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
sys.path.insert(0,str(Path(__file__).parent))
from three_waifus_browser import boot,PREFIX,snapshot
from v12_0_15_browser import save_brawler
ROOT=Path(__file__).resolve().parents[1]

async def verify(browser,width):
    slot=save_brawler()
    page=await browser.new_page(viewport={'width':width,'height':900})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
    assert await page.title()=='BELLYMON · V12.0.17'
    await page.locator('.save-controls button').first.click()
    await page.locator('#combatHud').wait_for(state='visible')
    button=page.locator('#specialActionButton')
    assert 'Absorption' in await button.inner_text()
    assert '3 énergies par seconde' in (await button.get_attribute('title'))
    await page.evaluate('Math.random=()=>0.99')
    await button.click()
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2")',timeout=6000)
    displayed=await page.locator('#lastActionMessage').inner_text() if await page.locator('#lastActionMessage').count() else ''
    state=json.loads((await snapshot(page))[PREFIX+slot['id']])['data']
    assert 'Absorption' in state['tower']['combat']['lastMessage'],state['tower']['combat']['lastMessage']
    assert 'Siphon d’énergie' not in state['tower']['combat']['lastMessage']
    assert state['tower']['combat']['effects']['enemy']['siphon']['expiresTurn']==4
    label=await page.locator('#enemyEffectsLine').inner_text()
    assert 'Absorption' in label,label
    await page.locator('#statusDetailsBtn').click()
    modal=await page.locator('#effectsContent').inner_text()
    assert 'Absorption' in modal,modal
    assert not errors,errors
    await page.screenshot(path=str(ROOT.parent/f'BELLYMON_V12.0.17_Absorption_{width}px.png'),full_page=True)
    await page.close()
    return {'width':width,'special':'Absorption','energy_effect_save_key':'siphon','errors':errors,'dialog':True}

async def main():
 async with async_playwright() as pw:
    browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    result=[await verify(browser,w) for w in (390,1440)]
    await browser.close()
    print(json.dumps({'PASS':result},ensure_ascii=False))
if __name__=='__main__':asyncio.run(main())
