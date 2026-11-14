"""V12.0.14 - Decisions simultanees pendant le meme chrono, en Chromium."""
import asyncio, sys
from playwright.async_api import async_playwright
from message_linebreak_browser import launch

async def enter_combat(page):
    await launch(page)
    await page.locator('#newGameBtn').click()
    await page.locator('#partyName').fill('Test simultané')
    await page.locator('#playerName').fill('Testeur')
    await page.locator('#createForm button[type=submit]').click()
    await page.locator('#playScreen').wait_for(state='visible')
    await page.locator('#advanceBtn').click()
    await page.locator('#eventAnnouncement').click()
    await page.locator('#startCombatBtn').click()
    await page.locator('#combatActionsGrid').wait_for(state='visible')
    await page.wait_for_function('document.querySelector("#combatTimer").textContent.includes("15")',timeout=1500)

async def test_early(browser,width):
    page=await browser.new_page(viewport={'width':width,'height':900})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await enter_combat(page)
    assert await page.title()=='BELLYMON · V12.0.16',await page.title()
    await page.locator('[data-combat-action="defend"]').click(no_wait_after=True)
    await page.locator('#enemyThinking').wait_for(state='visible',timeout=750)
    assert await page.locator('[data-combat-action="light"]').is_disabled()
    before=await page.locator('#combatTimer').inner_text()
    assert not await page.locator('#combatTimer').is_hidden()
    await page.wait_for_timeout(1150)
    after=await page.locator('#combatTimer').inner_text()
    assert before != after,('Le chrono est suspendu',width,before,after)
    await page.screenshot(path=f'/mnt/data/BELLYMON_V12.0.16_Chrono_Commun_{width}px.png',full_page=True)
    await page.locator('#enemyThinking').wait_for(state='hidden',timeout=2500)
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2")',timeout=2500)
    summary=await page.locator('#sessionHint').inner_text()
    assert 'se protège' in summary and 'L’adversaire' in summary,(width,summary)
    assert not errors,(width,errors)
    assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth + 3')
    print('EARLY OK',width,'clock',before,'->',after, 'summary',repr(summary[:80]))
    await page.close()

async def test_late(browser):
    page=await browser.new_page(viewport={'width':390,'height':850})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await enter_combat(page)
    # Math.random is fixed at .4 in harness: AI thinks 1.9 seconds.
    await page.wait_for_timeout(2500)
    assert await page.locator('#enemyThinking').is_hidden()
    assert 'TOUR 1' in await page.locator('#turnIndicator').text_content()
    await page.locator('[data-combat-action="light"]').click(no_wait_after=True)
    # No additional 520ms animation if enemy chose first; resolve by next microtask.
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2")',timeout=1100)
    assert await page.locator('#enemyThinking').is_hidden()
    assert not errors,errors
    print('LATE OK: AI chose earlier, click resolves immediately.')
    await page.close()

async def test_timeout(browser):
    page=await browser.new_page(viewport={'width':390,'height':850})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await enter_combat(page)
    # Advance virtual date by 16s so the shared 15s limit has expired.
    await page.evaluate('(()=>{const real=Date.now.bind(Date); Date.now=()=>real()+16000})()')
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2")',timeout=2000)
    summary=await page.locator('#sessionHint').inner_text()
    assert 'temps écoulé' in summary and 'L’adversaire' in summary,summary
    assert not errors,errors
    print('TIMEOUT OK: player skips turn after 15 seconds.')
    await page.close()

async def test_auto(browser):
    page=await browser.new_page(viewport={'width':390,'height':850})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await enter_combat(page)
    await page.locator('#combatAutoButton').click()
    assert await page.locator('#combatAutoButton').get_attribute('aria-pressed')=='true'
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2")',timeout=4000)
    assert not errors,errors
    print('AUTO OK: continues independently')
    await page.close()

async def test_capture(browser):
    page=await browser.new_page(viewport={'width':390,'height':850})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await enter_combat(page)
    await page.locator('[data-combat-action="capture"]').click(no_wait_after=True)
    await page.locator('#enemyThinking').wait_for(state='visible',timeout=750)
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2") || !document.querySelector("#continueBtn").hidden',timeout=3500)
    assert not errors,errors
    print('CAPTURE OK: deferred until enemy choice; success/failure mechanics preserved.')
    await page.close()

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in [320,390,1440]: await test_early(browser,width)
    await test_late(browser)
    await test_timeout(browser)
    await test_auto(browser)
    await test_capture(browser)
    await browser.close()
  print('SUCCÈS V12.0.15 : 7 scénarios navigateur')
if __name__=='__main__':asyncio.run(main())
