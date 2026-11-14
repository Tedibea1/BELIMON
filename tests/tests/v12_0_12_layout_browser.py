"""V12.0.12 : le compte-rendu du combat se place sous les COMMANDES.
Les panneaux hors-combat conservent leur place habituelle.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from message_linebreak_browser import launch

async def verify():
    checked=0
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width in (320,390,1440):
            page=await browser.new_page(viewport={'width':width,'height':840 if width<500 else 900},device_scale_factor=1)
            errors=[]
            page.on('pageerror', lambda error:errors.append(str(error)))
            await launch(page)
            assert await page.title()=='BELLYMON · V12.0.12'
            await page.locator('#newGameBtn').click()
            await page.locator('#partyName').fill('Test V12.0.12')
            await page.locator('#playerName').fill('Duelliste')
            await page.locator('#createForm button[type=submit]').click()
            await page.locator('#playScreen').wait_for(state='visible')
            # Repos : bandeau au-dessus des commandes.
            before=await page.evaluate('''() => ({
                summary:document.querySelector('.event-banner').getBoundingClientRect().top,
                commands:document.querySelector('#actionPanel').getBoundingClientRect().top,
                pos:document.querySelector('.event-banner').nextElementSibling?.id
            })''')
            assert before['summary'] < before['commands'] and before['pos']=='actionPanel',('rest',width,before)
            checked+=2
            await page.locator('#advanceBtn').click()
            await page.locator('#eventAnnouncement').click()
            await page.locator('#startCombatBtn').click()
            await page.locator('#combatActionsGrid').wait_for(state='visible')
            order=await page.evaluate('''() => ({
                summary:document.querySelector('.event-banner').getBoundingClientRect().top,
                commands:document.querySelector('#actionPanel').getBoundingClientRect().top,
                endCommands:document.querySelector('#actionPanel').getBoundingClientRect().bottom,
                sibling:document.querySelector('.event-banner').previousElementSibling?.id
            })''')
            assert order['summary']>order['endCommands'] and order['sibling']=='actionPanel',('fight',width,order)
            checked+=2
            await page.locator('[data-combat-action="special"]').click()
            await page.wait_for_timeout(220)
            message=await page.locator('#sessionHint').inner_text()
            assert 'Ta waifu' in message and '\n' in message and 'L’adversaire' in message, ('line breaks',width,message)
            assert await page.locator('#sessionHint').evaluate('(el)=>getComputedStyle(el).whiteSpace')=='pre-line'
            assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth+3'),('overflow',width)
            assert not errors,('JS errors',width,errors)
            checked+=4
            await page.screenshot(path=f'/mnt/data/BELLYMON_V12.0.12_Resume_Apres_Commandes_{width}px.png',full_page=True)
            print(f'OK Chromium {width}px, résumé sous les commandes, sans overflow ni erreur JS')
            await page.close()
        await browser.close()
    print(f'TOTAL {checked} vérifications ciblées réussies sur Chromium')

if __name__=='__main__': asyncio.run(verify())
