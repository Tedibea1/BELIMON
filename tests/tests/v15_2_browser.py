"""BELLYMON V15.2 : Chromium PC/mobile, nouvelle esquive/critique, Griffes, lourde, sauvegarde V15."""
import asyncio,sys
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import three_waifus_browser as b
import v14_browser as v
b.ROOT=ROOT
b.HTML=ROOT.joinpath('index.html').read_text(encoding='utf8')
import re
b.HTML=re.sub(r'<link rel="stylesheet" href="css/[^"]+">','',b.HTML)
b.HTML=re.sub(r'<script defer src="js/[^"]+"></script>','',b.HTML)
b.HTML=b.HTML.replace('<head>','<head><base href="https://bellymon.test/">',1)
b.CSS=sorted(ROOT.joinpath('css').glob('*.css'))
b.JS=['bonuses.js','traps.js','combat.js','hospital.js','shop.js','rewards.js','capture.js','evolution.js','auto.js','combat-ui.js','audio.js','shortcuts.js','game.js']
async def main():
 checks=0;errors=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in (390,1440):
   for action in ('special','heavy'):
    page=await browser.new_page(viewport={'width':width,'height':900})
    page.on('pageerror',lambda e:errors.append(str(e)))
    slot=v.fixture(21,'epeiste','griffeuse','fighting')
    slot['data']['waifus'][0]['stats']={'force':60,'rapidite':20,'constitution':10}
    slot['data']['waifus'][0]['maxHp']=1000;slot['data']['waifus'][0]['hp']=1000
    foe=slot['data']['tower']['event']['enemy']
    foe['stats']={'force':10,'rapidite':7 if action=='special' else 20,'constitution':10}
    foe['maxHp']=1000;foe['hp']=1000;foe['energy']=0
    await v.open_slot(page,slot)
    assert await page.title()=='BELLYMON · V15.2';checks+=1
    assert await page.locator('#specialActionName').inner_text()=='Griffes fatales';checks+=1
    rates=await page.evaluate('''() => {
      const c=window.TDWCombat;
      return [c.combatChances({rapidite:20}).critical,c.combatChances({rapidite:20}).dodge,
              c.combatChances({rapidite:7}).critical,c.rapChance({rapidite:20},{rapidite:20}),
              c.ACTIONS.heavy.power,c.SPECIALS.griffeuse.description.includes('×2')];
    }''')
    assert rates==[10,10,3,50,1.5,True],rates;checks+=1
    await page.locator(f'[data-combat-action="{action}"]').click()
    await page.wait_for_function('''id=>{const raw=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return raw&&JSON.parse(raw).data.tower.combat?.turn===1}''',arg=slot['id'],timeout=11000)
    saved=await v.saved_data(page,slot)
    assert saved['waifus'][0]['energy']==(80 if action=='special' else 85),saved['waifus'][0]['energy'];checks+=1
    assert saved['tower']['event']['enemy']['hp']<1000,(action,saved['tower']['combat']['lastMessage']);checks+=1
    if action=='special':
     assert 'CRITIQUE' in saved['tower']['combat']['lastMessage'];checks+=1
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'overflow {width}';checks+=1
    assert not errors,errors
    await page.close()
  await browser.close()
 print(f'V15.2 CHROMIUM : {checks} vérifications, 0 erreur JavaScript')
if __name__=='__main__':asyncio.run(main())
