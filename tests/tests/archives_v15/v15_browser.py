"""BELLYMON V15 : moteur chargé, commandes réelles, jet lourd, sauvegarde et responsive."""
import asyncio,re,sys
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
 checks=0;errors=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in [390,1440]:
   page=await browser.new_page(viewport={'width':width,'height':900})
   page.on('pageerror',lambda e:errors.append(str(e)))
   # Une partie existante V14.9 peut être reprise avec le même format de sauvegarde.
   slot=v.fixture(21,'epeiste','griffeuse','fighting')
   slot['data']['waifus'][0]['stats']={'force':60,'rapidite':105,'constitution':10}
   slot['data']['waifus'][0]['maxHp']=1000;slot['data']['waifus'][0]['hp']=1000
   foe=slot['data']['tower']['event']['enemy']
   foe['stats']={'force':10,'rapidite':5,'constitution':10}
   foe['maxHp']=1000;foe['hp']=1000;foe['energy']=0
   await v.open_slot(page,slot)
   assert await page.title()=='BELLYMON · V15';checks+=1
   assert await page.locator('#specialActionName').inner_text()=='Griffes fatales';checks+=1
   results=await page.evaluate('''() => {
      const C=window.TDWCombat;
      return [C.rapChance({rapidite:0},{rapidite:100}),
        C.rapChance({rapidite:100},{rapidite:100}),
        C.rapChance({rapidite:200},{rapidite:100}),
        C.ACTIONS.heavy.power,
        C.combatChances({rapidite:110},{rapidite:100}).critical,
        C.combatChances({rapidite:90},{rapidite:100}).dodge];
   }''')
   assert results==[0,50,100,1.5,55,45],results;checks+=1
   assert await page.locator('[data-combat-action="heavy"]').is_visible();checks+=1
   await page.locator('[data-combat-action="heavy"]').click()
   await page.wait_for_function('''id=>{let r=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return r&&JSON.parse(r).data.tower.combat?.turn===1;}''',arg=slot['id'],timeout=10000)
   d=await v.saved_data(page,slot)
   assert d['waifus'][0]['energy']==85;checks+=1
   assert d['tower']['event']['enemy']['hp']<1000;checks+=1
   assert 'CRITIQUE' in d['tower']['combat']['lastMessage'];checks+=1
   assert not errors,errors
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4');checks+=1
   await page.close()
  await browser.close()
 print(f'V15 CHROMIUM : {checks} contrôles, 0 erreur JS')
if __name__=='__main__':asyncio.run(main())
