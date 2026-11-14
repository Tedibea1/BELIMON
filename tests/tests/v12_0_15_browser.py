"""V12.0.16 : Chromium, cout des attaques et siphon -3 EN/s reels."""
import asyncio, json, uuid
from pathlib import Path
from playwright.async_api import async_playwright
from three_waifus_browser import boot,PREFIX,snapshot
ROOT=Path(__file__).resolve().parents[1]

def save_brawler():
    slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
    slot['id']=str(uuid.uuid4())
    slot['label']='V12.0.16 test Siphon'
    hero=slot['data']['waifus'][0]
    hero.update(classId='bagarreuse',rank='S',morph='obese',hp=500,maxHp=500,energy=100,
        stats={'force':69,'rapidite':35,'constitution':104})
    slot['data']['activeWaifuId']=hero['id']
    tower=slot['data']['tower']
    tower.update(floor=101,record=101,room='event',event={
       'type':'combat','state':'fighting','enemy':{'id':'test-ennemi','classId':'epeiste',
       'rank':'S','morph':'musclee','hp':1500,'maxHp':1500,'energy':100,
       'stats':{'force':0,'rapidite':0,'constitution':100}}},combat={
       'turn':0,'lastMessage':'Combat engagé','effects':{'player':{},'enemy':{}},
       'knockedOutIds':[],'usedHeroIds':[hero['id']]})
    return slot

def getstate(store,slot):
    return json.loads(store[PREFIX+slot['id']])['data']

async def test(width,browser):
    slot=save_brawler()
    page=await browser.new_page(viewport={'width':width,'height':900})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
    await page.locator('.save-controls button').first.click()
    await page.locator('#combatHud').wait_for(state='visible')
    assert await page.title()=='BELLYMON · V12.0.16'
    light=page.locator('[data-combat-action="light"]')
    assert 'Légère' in await light.inner_text() and '2' in await light.inner_text(),await light.inner_text()
    assert 'Lourde' in await page.locator('[data-combat-action="heavy"]').inner_text()
    special_title=await page.locator('#specialActionButton').get_attribute('title')
    assert '3 énergies' in special_title,special_title
    assert (await page.evaluate('TDWCombat.COST.light'))==2
    assert (await page.evaluate('TDWCombat.COST.heavy'))==3
    assert (await page.evaluate('TDWCombat.COST.special'))==5
    assert (await page.evaluate('TDWCombat.chooseEnemyAction(1,()=>0, {classId:"epeiste"})'))=='defend'
    assert (await page.evaluate('TDWCombat.chooseEnemyAction(2,()=>0, {classId:"epeiste"})'))=='light'
    await page.evaluate('Math.random=()=>0.99')
    await page.locator('[data-combat-action="special"]').click()
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2")',timeout=4000)
    state=getstate(await snapshot(page),slot)
    enemy=state['tower']['event']['enemy'];hero=next(h for h in state['waifus'] if h['id']==state['activeWaifuId'])
    assert hero['energy']==95,hero
    assert '−3 EN/s' in state['tower']['combat']['lastMessage'],state['tower']['combat']['lastMessage']
    assert state['tower']['combat']['effects']['enemy']['siphon']['expiresTurn']==4
    assert 'Siphon' in await page.locator('#enemyEffectsLine').inner_text()
    assert enemy['energy']==100,enemy
    # Des secondes actives reelles, aucun ajout d'energie, debit exactement multiple de 3.
    await page.wait_for_timeout(3550)
    state=getstate(await snapshot(page),slot)
    energy=state['tower']['event']['enemy']['energy']
    assert 85<=energy<=97 and (100-energy)%3==0,(width,energy)
    # Tour suivant : une attaque legere ne coute que 2 EN; IA en defense.
    await light.click()
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 3")',timeout=4000)
    state=getstate(await snapshot(page),slot)
    hero=next(h for h in state['waifus'] if h['id']==state['activeWaifuId'])
    assert hero['energy']==93,hero
    assert 'attaque légère' in state['tower']['combat']['lastMessage'],state['tower']['combat']['lastMessage']
    assert state['tower']['event']['enemy']['energy']<=energy
    assert await page.locator('#combatAutoButton').is_visible()
    assert (await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 3'))
    assert not errors,errors
    screenshot=ROOT.parent/f'BELLYMON_V12.0.16_Siphon_{width}px.png'
    await page.screenshot(path=str(screenshot),full_page=True)
    print(f'Chromium OK {width}px : spéciale 5 EN, légère 2 EN, siphon {100-energy} EN consommées en 3.55s, 0 erreur JS')
    await page.close()
    return screenshot

async def test_queued_action_loses_energy(browser):
    # L'effet retire 3 EN/s AVANT que l'IA termine sa décision (1.9s).
    # Une action choisie à 5 EN ne doit pas produire d'exception si elle devient impayable.
    slot=save_brawler()
    slot['data']['waifus'][0]['energy']=5
    slot['data']['tower']['combat']['effects']['player']={'siphon':{'expiresTurn':4,'nextTickAt':0}}
    page=await browser.new_page(viewport={'width':390,'height':850})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
    await page.locator('.save-controls button').first.click()
    await page.locator('#combatHud').wait_for(state='visible')
    await page.locator('[data-combat-action="special"]').click(no_wait_after=True)
    await page.wait_for_function('document.querySelector("#turnIndicator").textContent.includes("TOUR 2")',timeout=4000)
    state=getstate(await snapshot(page),slot)
    assert state['waifus'][0]['energy']==2,state['waifus'][0]
    assert 'se protège' in state['tower']['combat']['lastMessage'],state['tower']['combat']['lastMessage']
    assert not errors,errors
    await page.close()
    print('Chromium OK action choisie puis vidée par Siphon : défense automatique, aucun blocage')

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width in [390,1440]: await test(width,browser)
        await test_queued_action_loses_energy(browser)
        await browser.close()
    print('V12.0.16 : 3 scénarios de combat Chromium réussis')
if __name__=='__main__':asyncio.run(main())
