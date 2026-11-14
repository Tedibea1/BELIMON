"""Combat réel dans Chromium : Griffeuse S musclée vs Bagarreuse S obèse (Défense)."""
import asyncio,json,uuid,sys
from pathlib import Path
from playwright.async_api import async_playwright
sys.path.insert(0,str(Path(__file__).resolve().parent))
from three_waifus_browser import boot,PREFIX,snapshot
ROOT=Path(__file__).resolve().parents[1]

def get_save():
    slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
    slot['id']=str(uuid.uuid4())
    slot['label']='Test V12.0.9 — Griffes fatales'
    hero=slot['data']['waifus'][1]
    hero.update(rank='S',morph='musclee',stats={'force':79,'rapidite':84,'constitution':45},maxHp=270,hp=270,energy=100)
    slot['data']['activeWaifuId']=hero['id']
    slot['data']['tower'].update(floor=101,record=101,room='event',event={
      'type':'combat','state':'fighting','enemy':{
        'id':'tanking-bagarreuse-s-obese','classId':'bagarreuse','rank':'S','morph':'obese',
        'hp':392,'maxHp':392,'energy':100,'stats':{'force':69,'rapidite':35,'constitution':104}}
    },combat={'turn':0,'lastMessage':'Combat engagé','effects':{'player':{},'enemy':{}},'knockedOutIds':[],'usedHeroIds':[hero['id']]})
    return slot

async def battle(browser,width):
    page=await browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    slot=get_save()
    await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
    await page.locator('.save-controls button').first.click()
    await page.locator('#combatHud').wait_for(state='visible')
    assert (await page.locator('#specialActionButton').inner_text()).find('Griffes fatales')!=-1
    desc=await page.locator('#specialActionButton').get_attribute('title')
    assert '×1,0' in desc and '×3' in desc,desc
    await page.evaluate('Math.random=()=>0.99')
    await page.locator('[data-combat-action="special"]').click()
    await page.wait_for_timeout(150)
    current=json.loads((await snapshot(page))[PREFIX+slot['id']])['data']
    event=current['tower']['event']
    hero=next(h for h in current['waifus'] if h['id']==current['activeWaifuId'])
    assert event['enemy']['hp']==333, event['enemy']['hp']
    assert hero['hp']==270 and hero['energy']==95,hero
    assert event['enemy']['energy']==100,event['enemy']
    msg=current['tower']['combat']['lastMessage']
    assert 'Griffes fatales : 59 dégâts' in msg,msg
    assert 'CRITIQUE' in msg and 'se protège' in msg,msg
    assert current['tower']['combat']['turn']==1
    assert not errors,errors
    screenshot=Path('/mnt/data')/f'BELLYMON_V12.0.9_Griffes_{"Mobile" if width==390 else "PC"}.png'
    await page.screenshot(path=str(screenshot),full_page=True)
    await page.close()
    return {'largeur':width,'degats':59,'pv_bagarreuse':333,'pv_griffeuse':270,'energie_griffeuse':95,'critique':'garanti','chemin_capture':str(screenshot),'erreurs_js':errors}

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        output=[]
        for width in [390,1440]:output.append(await battle(browser,width))
        await browser.close()
    print(json.dumps({'PASS':output},ensure_ascii=False,indent=2))

if __name__=='__main__':asyncio.run(main())
