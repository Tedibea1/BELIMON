import asyncio,re,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
import v14_browser as v
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text(encoding='utf-8')
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=sorted(ROOT.joinpath('css').glob('*.css'))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']
async def main():
    passed=0;errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width in (390,1440):
            page=await browser.new_page(viewport={'width':width,'height':930})
            page.on('pageerror',lambda e: errors.append(str(e)))
            slot=v.fixture(21,'epeiste','griffeuse','fighting')
            slot['data']['waifus'][0]['stats']={'force':60,'rapidite':105,'constitution':10}
            slot['data']['waifus'][0]['maxHp']=1000
            slot['data']['waifus'][0]['hp']=1000
            slot['data']['tower']['event']['enemy']['stats']={'force':10,'rapidite':5,'constitution':10}
            slot['data']['tower']['event']['enemy']['maxHp']=1000
            slot['data']['tower']['event']['enemy']['hp']=1000
            await v.open_slot(page,slot)
            assert await page.title()=='BELLYMON · V14.9';passed+=1
            assert await page.locator('#specialActionName').inner_text()=='Griffes fatales';passed+=1
            desc=await page.evaluate('window.TDWCombat.SPECIALS.griffeuse.description')
            assert '50 %' in desc and '100 %' in desc and '×3' in desc;passed+=1
            assert await page.evaluate('window.TDWCombat.griffesHitChance({rapidite:105},{rapidite:5})')==100;passed+=1
            await page.locator('[data-combat-action="special"]').click()
            await page.wait_for_function('''id=>{const raw=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return raw&&JSON.parse(raw).data.tower.combat?.turn===1}''',arg=slot['id'],timeout=9000)
            saved=await v.saved_data(page,slot)
            assert saved['waifus'][0]['energy']==80;passed+=1
            assert saved['tower']['event']['enemy']['hp']<1000;passed+=1
            assert not errors,errors
            await page.close()
        await browser.close()
    print(f'V14.9 BROWSER : {passed} contrôles, 0 erreur JavaScript')
if __name__=='__main__':asyncio.run(main())
