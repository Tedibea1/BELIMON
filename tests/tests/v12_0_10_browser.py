"""V12.0.10 — tests Chromium du Siphon et de la Malédiction en temps réel."""
import asyncio,json,uuid,copy,sys
from pathlib import Path
from playwright.async_api import async_playwright
sys.path.insert(0,str(Path(__file__).resolve().parent))
from three_waifus_browser import boot,PREFIX,snapshot
ROOT=Path(__file__).resolve().parents[1]

def saved_combat(cls,legacy=False):
    slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
    slot['id']=str(uuid.uuid4())
    slot['label']=f'V12.0.10 test {cls}'
    hero=slot['data']['waifus'][0]
    hero.update(classId=cls,rank='S',morph='musclee',hp=250,maxHp=250,energy=100,
                stats={'force':60,'rapidite':70,'constitution':100})
    slot['data']['activeWaifuId']=hero['id']
    curse={'startTurn':1} if legacy else None
    slot['data']['tower'].update(floor=101,record=101,room='event',event={
        'type':'combat','state':'fighting',
        'enemy':{'id':'ennemi-stable','classId':'bagarreuse','rank':'S','morph':'obese',
                 'hp':9999,'maxHp':9999,'energy':100,
                 'stats':{'force':0,'rapidite':0,'constitution':100}}},
        combat={'turn':1 if legacy else 0,'lastMessage':'Combat en cours.',
                'effects':{'player':{'lastOccultTurn':1} if legacy else {},'enemy':{'curse':curse} if curse else {}},
                'knockedOutIds':[],'usedHeroIds':[hero['id']]})
    return slot

def debuff(data,kind):
    return data['tower']['combat']['effects']['enemy'].get(kind)

async def scenario(browser,width,cls,legacy=False):
    page=await browser.new_page(viewport={'width':width,'height':890})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    slot=saved_combat(cls,legacy)
    await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
    await page.locator('.save-controls button').first.click()
    await page.locator('#combatHud').wait_for(state='visible')
    await page.evaluate('Math.random=()=>.99')
    assert await page.title()=='BELLYMON · V12.0.11'
    desc=await page.locator('#specialActionButton').get_attribute('title')
    if cls=='bagarreuse':assert '2 énergies' in desc,desc
    else:assert '−2 %' in desc and 'sans cooldown' in desc,desc
    if legacy:
        assert '−20%' in await page.locator('#enemyEffectsLine').inner_text()
        assert await page.locator('[data-combat-action="special"]').is_enabled()
    await page.locator('[data-combat-action="special"]').click()
    await page.wait_for_timeout(350)
    state=json.loads((await snapshot(page))[PREFIX+slot['id']])['data']
    kind='siphon' if cls=='bagarreuse' else 'curse'
    effect=debuff(state,kind)
    assert effect is not None,state
    assert effect['expiresTurn']==(slot['data']['tower']['combat']['turn'] + 1 + (3 if cls=='bagarreuse' else 4)),effect
    if cls=='occultiste':assert effect['percent']==(20 if legacy else 0),effect
    assert await page.locator('#statusDetailsBtn').inner_text()!=''
    assert await page.locator('#enemyEffectsLine').is_visible()
    await page.wait_for_timeout(2650)
    state=json.loads((await snapshot(page))[PREFIX+slot['id']])['data']
    effect=debuff(state,kind)
    assert effect is not None
    if cls=='bagarreuse':
        assert state['tower']['event']['enemy']['energy'] in [94,96,98],state['tower']['event']['enemy']['energy']
        assert '−2 énergie' in (await page.locator('#effectsContent').inner_text()) if not await page.locator('#effectsOverlay').is_hidden() else True
        value=state['tower']['event']['enemy']['energy']
    else:
        assert (20 if legacy else 2) <=effect['percent']<=(30 if legacy else 10),effect
        label=await page.locator('#enemyEffectsLine').inner_text()
        assert f'−{effect["percent"]}%' in label,label
        value=effect['percent']
    await page.locator('[data-combat-action="special"]').click()
    await page.wait_for_timeout(150)
    refreshed=json.loads((await snapshot(page))[PREFIX+slot['id']])['data']
    eff=debuff(refreshed,kind)
    assert eff['expiresTurn']==(slot['data']['tower']['combat']['turn'] + 2 + (3 if cls=='bagarreuse' else 4)),eff
    if cls=='occultiste':assert eff['percent']>=value and eff['percent']<=value+2,(value,eff)
    else:assert refreshed['tower']['event']['enemy']['energy']<=value
    assert not errors, errors
    screenshot=ROOT.parent/f'BELLYMON_V12.0.10_{"Siphon" if cls=="bagarreuse" else "Malediction"}_{width}px.png'
    await page.screenshot(path=str(screenshot),full_page=True)
    result={'largeur':width,'personnage':cls,'ancienne_sauvegarde':legacy,'tours_apres_relance':5,'effet_apres_relance':eff,
            'energie_ennemie':refreshed['tower']['event']['enemy']['energy'],'erreurs_JS':errors,'capture':str(screenshot)}
    await page.close()
    return result

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        outs=[]
        for width,cls,legacy in [(390,'bagarreuse',False),(390,'occultiste',False),(1440,'bagarreuse',False),(1440,'occultiste',True)]:
            outs.append(await scenario(browser,width,cls,legacy))
        await browser.close()
    print(json.dumps({'PASS':outs},ensure_ascii=False,indent=2))
if __name__=='__main__':asyncio.run(main())
