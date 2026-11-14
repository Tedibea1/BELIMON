"""V12.0.13 - auto combat still runs and spinner clears."""
import asyncio
from playwright.async_api import async_playwright
from message_linebreak_browser import launch

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=await browser.new_page(viewport={'width':390,'height':844})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    await launch(page)
    await page.locator('#newGameBtn').click()
    await page.locator('#partyName').fill('Test AUTO')
    await page.locator('#playerName').fill('Automatique')
    await page.locator('#createForm button[type=submit]').click()
    await page.locator('#advanceBtn').click()
    await page.locator('#eventAnnouncement').click()
    await page.locator('#startCombatBtn').click()
    await page.locator('#combatAutoButton').click()
    assert await page.locator('#combatAutoButton').get_attribute('aria-pressed')=='true'
    await page.wait_for_function("document.querySelector('#turnIndicator').textContent.includes('TOUR 2')",timeout=5000)
    await page.wait_for_timeout(600)
    text=await page.locator('#sessionHint').inner_text()
    assert 'Ta waifu' in text or 'Victoire' in text,(text,await page.locator('#turnIndicator').inner_text())
    assert not errors,errors
    print('OK AUTO active, turn changes, no JS errors, spinner does not stall')
    await browser.close()

if __name__=='__main__':asyncio.run(main())
