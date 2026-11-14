"""BELLYMON V12.0.13 — décision ennemie visible et bloquante."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from message_linebreak_browser import launch

async def run():
    checks = 0
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for width in (320,390,1440):
            page = await browser.new_page(viewport={'width':width,'height':850 if width<500 else 900})
            errors=[]
            page.on('pageerror', lambda error:errors.append(str(error)))
            await launch(page)
            assert await page.title() == 'BELLYMON · V12.0.13'
            await page.locator('#newGameBtn').click()
            await page.locator('#partyName').fill('IA test')
            await page.locator('#playerName').fill('Duelliste')
            await page.locator('#createForm button[type=submit]').click()
            await page.locator('#playScreen').wait_for(state='visible')
            await page.locator('#advanceBtn').click()
            await page.locator('#eventAnnouncement').click()
            await page.locator('#startCombatBtn').click()
            await page.locator('#combatActionsGrid').wait_for(state='visible')
            assert await page.locator('#enemyThinking').is_hidden()
            # Sélection d'une action et vérification pendant la décision de l'IA.
            await page.locator('[data-combat-action="defend"]').click(no_wait_after=True)
            await page.locator('#enemyThinking').wait_for(state='visible',timeout=500)
            msg=await page.locator('#enemyThinking').inner_text()
            assert 'L’adversaire choisit son action' in msg,(width,msg)
            assert await page.locator('[data-combat-action="light"]').is_disabled()
            assert await page.locator('#quitTowerBtn').is_disabled()
            assert await page.locator('#combatAutoButton').is_disabled()
            assert await page.locator('#enemyThinking .enemy-thinking-spinner').count()==1
            remaining=await page.locator('#combatTimer').inner_text()
            await page.wait_for_timeout(250)
            assert await page.locator('#combatTimer').inner_text()==remaining,('timer moved during AI',width)
            await page.screenshot(path=f'/mnt/data/BELLYMON_V12.0.13_IA_Reflexion_{width}px.png',full_page=True)
            await page.locator('#enemyThinking').wait_for(state='hidden',timeout=2500)
            assert not await page.locator('[data-combat-action="light"]').is_disabled()
            result=await page.locator('#sessionHint').inner_text()
            assert 'Ta waifu' in result and '\n' in result and 'L’adversaire' in result,(width,result)
            assert await page.locator('#turnIndicator').inner_text() != 'TOUR 1'
            assert not await page.evaluate('document.documentElement.scrollWidth>window.innerWidth+3'), width
            assert not errors,(width,errors)
            checks+=11
            print('OK',width,'px : indicateur, blocage, temps arrêté, résolution et absence de débordement')
            await page.close()
        await browser.close()
    print('SUCCESS:', checks, 'vérifications Chromium')

if __name__=='__main__':asyncio.run(run())
