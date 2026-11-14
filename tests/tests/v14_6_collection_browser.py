"""V14.6: active hero appears first in the collection at mobile and desktop widths.
The rest remains S→E, selection is live, and local saves survive a reload.
"""
import asyncio
import copy
import json
import re
import sys
import uuid
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text()
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=sorted(ROOT.joinpath('css').glob('*.css'))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']


def fixture():
    slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
    slot['id']=str(uuid.uuid4())
    slot['label']='Tri collection V14.6'
    slot['data']['tower'].update(floor=1,record=226,room='rest',event=None,combat=None,activeTraps=[])
    base=copy.deepcopy(slot['data']['waifus'][0])
    slot['data']['waifus']=[]
    # 17 heroes, active E placed last in the persisted array; others of mixed rank.
    for i, rank in enumerate(['B','S','A','D','C','S','A','S','B','C','S','E','S','A','B','E','E']):
        hero=copy.deepcopy(base)
        hero['id']=f'v14-6-hero-{i:02d}'
        hero['classId']='epeiste'
        hero['rank']=rank
        hero['morph']='musclee' if rank!='E' else None
        hero['nickname']=f'Waifu {i:02d}'
        hero['hp']=hero['maxHp']
        slot['data']['waifus'].append(hero)
    slot['data']['activeWaifuId']='v14-6-hero-16'
    return slot


def ranks_in_expected_order(slot):
    ids=[w['id'] for w in slot['data']['waifus']]
    active=slot['data']['activeWaifuId']
    rorder=['S','A','B','C','D','E']
    remaining=[w for w in slot['data']['waifus'] if w['id']!=active]
    remaining.sort(key=lambda h:rorder.index(h['rank']))
    return [active]+[h['id'] for h in remaining]


async def shown_ids(page):
    return await page.locator('#ownedGrid .owned-card').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.heroId)')


async def run():
    checks=0
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width in (320,390,1440):
            page=await browser.new_page(viewport={'width':width,'height':950})
            page.set_default_timeout(10000)
            page.on('pageerror',lambda e:errors.append(str(e)))
            slot=fixture()
            initial={b.PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)}
            await b.boot(page,initial)
            await page.locator('.save-controls button').first.click()
            await page.locator('#tabWaifus').click()
            assert await page.title()=='BELLYMON · V14.6';checks+=1
            assert 'active en premier' in (await page.locator('.collection-sort-note').inner_text()).lower();checks+=1
            assert await page.locator('.owned-card').count()==17;checks+=1
            observed=await shown_ids(page)
            expected=ranks_in_expected_order(slot)
            assert observed==expected,(width,observed,expected);checks+=1
            assert (await page.locator('.owned-card').first.get_attribute('data-hero-id'))=='v14-6-hero-16';checks+=1
            assert await page.locator('.owned-card').first.evaluate('(n)=>n.classList.contains("is-active")');checks+=1
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+3');checks+=1
            # Change selection to a low-ranked hero near the bottom. Moves to first.
            target='v14-6-hero-11'
            await page.locator(f'.owned-card[data-hero-id="{target}"]').click()
            await page.locator('#detailSelect').click()
            await page.wait_for_function('(id)=>document.querySelector("#ownedGrid .owned-card")?.dataset.heroId===id',arg=target)
            assert (await shown_ids(page))[0]==target;checks+=1
            assert await page.locator('#waifuDetailOverlay').is_hidden();checks+=1
            snap=await b.snapshot(page)
            saved=json.loads(snap[b.PREFIX+slot['id']]);slot=saved
            assert slot['data']['activeWaifuId']==target;checks+=1
            assert await shown_ids(page)==ranks_in_expected_order(slot);checks+=1
            # Capture screen: visually check the top-left card on each viewport.
            await page.evaluate('window.scrollTo(0, Math.max(0, document.getElementById("paneWaifus").getBoundingClientRect().top + window.scrollY - 150))')
            await page.wait_for_timeout(150)
            await page.screenshot(path=str(ROOT.parents[1]/f'BELLYMON_V14.6_Collection_{width}px.png'),full_page=False)
            await page.close()
            page=await browser.new_page(viewport={'width':width,'height':950})
            page.set_default_timeout(10000)
            page.on('pageerror',lambda e:errors.append(str(e)))
            await b.boot(page,snap)
            await page.locator('.save-controls button').first.click()
            await page.locator('#tabWaifus').click()
            assert (await shown_ids(page))[0]==target;checks+=1
            assert await shown_ids(page)==ranks_in_expected_order(slot);checks+=1
            # Promote a different S-ranked hero to active, leaving the others sorted.
            target='v14-6-hero-07'
            await page.locator(f'.owned-card[data-hero-id="{target}"]').click()
            await page.locator('#detailSelect').click()
            await page.wait_for_function('(id)=>document.querySelector("#ownedGrid .owned-card")?.dataset.heroId===id',arg=target)
            assert (await shown_ids(page))[0]==target;checks+=1
            slot['data']['activeWaifuId']=target
            assert await shown_ids(page)==ranks_in_expected_order(slot);checks+=1
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+3');checks+=1
            await page.close()
        await browser.close()
    assert not errors, errors
    print('PASS',checks,'contrôles Chromium : active en premier, 17 waifus, tri reste, changement, sauvegarde, responsive')


if __name__=='__main__':
    asyncio.run(run())
