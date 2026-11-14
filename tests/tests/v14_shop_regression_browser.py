# Test historique de l’interface Boutique V13, remplacée dans V14.2.
# Pour les nouveaux comportements, lancer : python tests/v14_2_boutique_waifu_browser.py
"""Boutique V13 : vérifications UI, achats, soins et sauvegardes anciennes."""
import asyncio, copy, json, re, sys, uuid
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
b.CSS=list(sorted(ROOT.joinpath('css').glob('*.css')))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','game.js']
PREFIX=b.PREFIX

def fixture():
    slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
    slot['id']=str(uuid.uuid4())
    slot['data']['food']={'small':90,'large':30}
    slot['data'].pop('potions',None)  # vieux JSON non destructivement accepté
    slot['data']['tower'].update(floor=1,record=1,room='rest',event=None,combat=None)
    return slot

async def get_data(page,slot):
    snap=await b.snapshot(page)
    return json.loads(snap[PREFIX+slot['id']])['data']

async def main():
    checks=0
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width in (320,390,1440):
            errors=[]; page=await browser.new_page(viewport={'width':width,'height':930})
            page.on('pageerror', lambda e: errors.append(str(e)))
            slot=fixture()
            await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
            assert await page.title()=='BELLYMON · V14.1';checks+=1
            await page.locator('.save-controls button').first.click()
            await page.locator('#tabBoutique').click()
            assert await page.locator('#paneBoutique').is_visible();checks+=1
            assert await page.locator('#shopOffers .shop-card').count()==3;checks+=1
            assert '90' in await page.locator('#shopWallet').inner_text();checks+=1
            assert '30' in await page.locator('#shopWallet').inner_text();checks+=1
            assert '90 %' in await page.locator('#shopOffers').inner_text();checks+=1
            # Acheter petite avec steaks, grande avec gigots, suprême avec steaks.
            await page.locator('[data-shop-buy="petite"][data-food-type="small"]').click()
            d=await get_data(page,slot)
            assert d['food']=={'small':81,'large':30} and d['potions']=={'petite':1,'grande':0,'supreme':0},d;checks+=1
            await page.locator('[data-shop-buy="grande"][data-food-type="large"]').click()
            d=await get_data(page,slot)
            assert d['food']=={'small':81,'large':24} and d['potions']['grande']==1;checks+=1
            await page.locator('[data-shop-buy="supreme"][data-food-type="small"]').click()
            d=await get_data(page,slot)
            assert d['food']=={'small':51,'large':24} and d['potions']['supreme']==1;checks+=1
            # Soigne la titulaire : 9 / 82 +25 (30%) => 34 ; potion suprême complète ensuite.
            before=d['waifus'][0]['hp'];max_hp=d['waifus'][0]['maxHp']
            assert d['activeWaifuId']==d['waifus'][0]['id'];checks+=1
            await page.locator('[data-shop-use="petite"]').click()
            d=await get_data(page,slot)
            assert d['waifus'][0]['hp']==min(max_hp,before+round(max_hp*.30)),d['waifus'][0];checks+=1
            assert d['potions']['petite']==0;checks+=1
            await page.locator('[data-shop-use="supreme"]').click()
            d=await get_data(page,slot)
            assert d['waifus'][0]['hp']==max_hp and d['potions']['supreme']==0;checks+=1
            # Changement de cible ne nécessite pas de changer de waifu active.
            await page.locator('#shopHeroSelect').select_option(slot['data']['waifus'][1]['id'])
            other_before=d['waifus'][1]['hp'];other_max=d['waifus'][1]['maxHp']
            await page.locator('[data-shop-use="grande"]').click()
            d=await get_data(page,slot)
            assert d['waifus'][1]['hp']==min(other_max,other_before+round(other_max*.6));checks+=1
            assert d['potions']['grande']==0;checks+=1
            assert d['activeWaifuId']==slot['data']['activeWaifuId'];checks+=1
            assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'overflow width {width}';checks+=1
            assert not errors,errors
            await page.screenshot(path=str(ROOT.parent/f'BELLYMON_V13_Boutique_{width}px.png'),full_page=True)
            # Fermeture/rechargement : achat et soins persistent.
            snap=await b.snapshot(page)
            await page.close()
            page=await browser.new_page(viewport={'width':width,'height':930})
            page.on('pageerror', lambda e: errors.append(str(e)))
            await b.boot(page,snap)
            await page.locator('.save-controls button').first.click()
            await page.locator('#tabBoutique').click()
            d2=await get_data(page,slot)
            assert d2['food']==d['food'] and d2['potions']==d['potions'] and d2['waifus'][1]['hp']==d['waifus'][1]['hp'];checks+=1
            assert not errors,errors
            await page.close()
        # Aux étages élevés : boutique verrouillée mais potions utilisables.
        slot=fixture();slot['data']['tower'].update(floor=15,record=15)
        slot['data']['potions']={'petite':1,'grande':0,'supreme':0}
        page=await browser.new_page(viewport={'width':390,'height':880})
        await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
        await page.locator('.save-controls button').first.click();await page.locator('#tabBoutique').click()
        assert await page.locator('[data-shop-buy="petite"][data-food-type="small"]').is_disabled();checks+=1
        assert await page.locator('[data-shop-use="petite"]').is_enabled();checks+=1
        await page.locator('[data-shop-use="petite"]').click()
        d=await get_data(page,slot)
        assert d['waifus'][0]['hp']>slot['data']['waifus'][0]['hp'];checks+=1
        await page.close()
        # En combat : ni achat, ni utilisation, même avec une potion en stock.
        slot=fixture();slot['data']['potions']={'petite':1,'grande':0,'supreme':0}
        slot['data']['tower'].update(room='event',event={
            'type':'combat','state':'fighting','enemy':{
                'id':'mob','classId':'epeiste','rank':'E','morph':None,'hp':100,'maxHp':100,'energy':100,
                'stats':{'force':15,'rapidite':5,'constitution':10}}},
            combat={'turn':0,'lastMessage':'Combat engagé','effects':{'player':{},'enemy':{}},
                    'knockedOutIds':[],'usedHeroIds':[slot['data']['activeWaifuId']]})
        page=await browser.new_page(viewport={'width':390,'height':880})
        await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
        await page.locator('.save-controls button').first.click();await page.locator('#tabBoutique').click()
        assert await page.locator('[data-shop-use="petite"]').is_disabled();checks+=1
        assert await page.locator('[data-shop-buy="petite"][data-food-type="small"]').is_disabled();checks+=1
        await page.close();await browser.close()
    print(f'✅ {checks} assertions Chromium V13 ; 320, 390 et 1440 px')

if __name__=='__main__':asyncio.run(main())
