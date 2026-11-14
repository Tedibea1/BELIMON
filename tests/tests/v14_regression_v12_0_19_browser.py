"""Integration browser checks for Recovery, 7-button grid and AUTO in V12.0.19."""
import asyncio, json, uuid, sys, re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(Path(__file__).parent))
import three_waifus_browser as b
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text()
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=list(sorted(ROOT.joinpath('css').glob('*.css')))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
PREFIX=b.PREFIX

def fixture(auto=False,energy=0, enemy_energy=0, foe_force=40):
    slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
    slot['id']=str(uuid.uuid4());slot['label']='Récupération V12.0.19';slot['data']['autoCombat']=auto
    w=slot['data']['waifus'][0]
    slot['data']['waifus']=[w];slot['data']['activeWaifuId']=w['id']
    w.update(hp=200,maxHp=200,energy=energy,stats={'force':30,'rapidite':90,'constitution':0},injuredUntil=0)
    foe={'id':'foe','classId':'epeiste','rank':'E','morph':None,'hp':300,'maxHp':300,'energy':enemy_energy,
         'stats':{'force':foe_force,'rapidite':1,'constitution':0}}
    slot['data']['tower'].update(floor=2,record=2,room='event',event={'type':'combat','state':'fighting','enemy':foe},
        combat={'turn':0,'lastMessage':'Le combat commence !','effects':{'player':{},'enemy':{}},'knockedOutIds':[],'usedHeroIds':[w['id']]})
    return slot

async def start(page,slot):
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
    await page.locator('.save-controls button').first.click()
    await page.locator('#playScreen').wait_for(state='visible')
    assert await page.title()=='BELLYMON · V14.1'
    return errs

async def saved(page,id):
    return json.loads((await b.snapshot(page))[PREFIX+id])['data']

async def main():
    checks=0
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        for width in [320,390,1440]:
            page=await browser.new_page(viewport={'width':width,'height':920})
            slot=fixture();errs=await start(page,slot)
            assert await page.locator('[data-combat-action]').count()==6;checks+=1
            assert await page.locator('#combatAutoButton').is_visible();checks+=1
            assert await page.locator('[data-combat-action="recover"]').is_visible();checks+=1
            assert await page.locator('[data-combat-action="recover"]').is_enabled();checks+=1
            assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4');checks+=1
            await page.locator('[data-combat-action="recover"]').click()
            await page.wait_for_function('document.querySelector("#actionContext").textContent.includes("Tour 2")',timeout=7000)
            state=await saved(page,slot['id'])
            player=next(w for w in state['waifus'] if w['id']==slot['data']['activeWaifuId'])
            assert player['energy']==67,player['energy'];checks+=1
            assert state['tower']['event']['enemy']['energy']==67,state['tower']['event']['enemy']['energy'];checks+=1
            assert player['hp']==200;checks+=1
            assert 'Récupération' in state['tower']['combat']['lastMessage'] or 'récupère 67 EN' in state['tower']['combat']['lastMessage'];checks+=1
            assert not errs,errs
            await page.screenshot(path=str(ROOT.parent/f'BELLYMON_V12.0.19_Recuperation_{width}px.png'),full_page=True)
            await page.close()
            # AUTO independently restores 0 energy with full control switch preserved
            page=await browser.new_page(viewport={'width':width,'height':920})
            slot=fixture();errs=await start(page,slot)
            await page.locator('#combatAutoButton').click()
            await page.wait_for_function('document.querySelector("#combatAutoLabel").textContent === "ON"',timeout=5000)
            await page.wait_for_function('document.querySelector("#actionContext").textContent.includes("Tour 2")',timeout=10000)
            state=await saved(page,slot['id'])
            assert state['waifus'][0]['energy']>=67,state['waifus'][0]['energy'];checks+=1
            assert state['tower']['event']['enemy']['energy']>=67;checks+=1
            assert state['autoCombat'] is True;checks+=1
            assert not errs,errs
            await page.close()
            # Recovery 30% vulnerable to enemy attack even if player faster.
            page=await browser.new_page(viewport={'width':width,'height':920})
            slot=fixture(energy=0,enemy_energy=100,foe_force=40);errs=await start(page,slot)
            await page.locator('[data-combat-action="recover"]').click()
            await page.wait_for_function('document.querySelector("#actionContext").textContent.includes("Tour 2")',timeout=7000)
            state=await saved(page,slot['id'])
            enemy_move=state['tower']['combat'].get('lastEnemyAction')
            hero=state['waifus'][0]
            assert hero['energy']==67,(enemy_move,hero);checks+=1
            # At mocked rng .4, enemy chooses heavy (52 base damage); incoming *1.3 => 68.
            assert hero['hp']==132,(enemy_move,hero);checks+=1
            assert not errs,errs
            await page.close()
        await browser.close()
    print(f'✅ {checks} focused Chromium integration checks passed')
if __name__=='__main__':asyncio.run(main())
