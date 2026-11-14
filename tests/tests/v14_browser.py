"""BELLYMON V14 : sélection des starters, rencontres, images, sauvegardes, compétences."""
import asyncio,json,sys,uuid,re,copy
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
CLASSES=['vampire','spectre','nemesis','maudite','envouteuse','exorciste']

def fixture(floor=21,enemy=None,classId='griffeuse',state='rest'):
 slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
 slot['id']=str(uuid.uuid4());slot['label']='V14 test'
 hero=slot['data']['waifus'][0];slot['data']['waifus']=[hero]
 slot['data']['activeWaifuId']=hero['id']
 hero['classId']=classId;hero['rank']='D' if floor>=21 else 'E';hero['morph']='obese' if floor>=21 else None
 hero['energy']=100;hero['hp']=200;hero['maxHp']=200;hero['stats']={'force':20,'rapidite':20,'constitution':20}
 tower=slot['data']['tower'];tower.update(floor=floor,record=floor,room='rest',event=None,combat=None)
 if state=='fighting':
  enemy=enemy or 'maudite'
  tower.update(room='event',event={'type':'combat','state':'fighting','enemy':{'id':'foe-test','classId':enemy,'rank':'D','morph':'musclee','hp':200,'maxHp':200,'energy':100,'stats':{'force':10,'rapidite':5,'constitution':20}}},combat={'turn':0,'lastMessage':'Le combat commence', 'effects':{'player':{},'enemy':{}},'knockedOutIds':[], 'usedHeroIds':[hero['id']]})
 return slot
async def saved_data(page,slot):
 return json.loads((await b.snapshot(page))[PREFIX+slot['id']])['data']
async def open_slot(page,slot):
 await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
 await page.locator('.save-controls button').first.click()
 await page.locator('#playScreen').wait_for(state='visible')
async def main():
 count=0;errors=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in (390,1440):
   page=await browser.new_page(viewport={'width':width,'height':920})
   page.on('pageerror',lambda e:errors.append(str(e)))
   await b.boot(page)
   assert await page.title()=='BELLYMON · V14.1';count+=1
   await page.locator('#newGameBtn').click()
   assert await page.locator('.class-option').count()==6;count+=1
   starterids=await page.locator('[data-class-id]').evaluate_all('(xs)=>xs.map(x=>x.dataset.classId)')
   assert not any(x in starterids for x in CLASSES),starterids;count+=1
   await page.close()
   # étage 20 : aucune nouvelle héroïne, même avec un tirage qui les sélectionnerait
   for floor in (20,21,41,61,81,101):
    slot=fixture(floor=floor);page=await browser.new_page(viewport={'width':width,'height':920})
    page.on('pageerror',lambda e:errors.append(str(e)))
    await open_slot(page,slot)
    await page.evaluate('Math.random=()=>0.55') # combat (.55), puis choix de classe au milieu du pool
    await page.locator('#advanceBtn').click()
    d=await saved_data(page,slot)
    enemy=d['tower']['event']['enemy']
    if floor==20:assert enemy['classId'] not in CLASSES,enemy
    else:assert enemy['classId']=='vampire',enemy
    count+=1
    assert enemy['rank']==('E' if floor==20 else 'D' if floor<=40 else 'C' if floor<=60 else 'B' if floor<=80 else 'A' if floor<=100 else 'S');count+=1
    await page.locator('#eventEnemyPortrait').wait_for(state='visible',timeout=6000)
    assert await page.locator('#eventEnemyPortrait').evaluate('(x)=>x.naturalWidth>0'),f'image enemy {floor}';count+=1
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'overflow {width} floor {floor}';count+=1
    await page.close()
  # 96 fichiers et affichage sprite chétif C/A réellement dédiés aux nouveaux personnages
  from PIL import Image
  for cls in CLASSES:
   for morph,ranks in [('commun','E'),('musclee','DCBAS'),('obese','DCBAS'),('chetive','DCBAS')]:
    for rank in ranks:
     image=ROOT/f'assets/characters/{cls}/{morph}/{rank}.png'
     assert image.exists(),str(image)
     with Image.open(image) as im:assert im.size==(512,512),str(image)
     count+=1
  # vrai combat depuis le bouton special de l'interface + stockage compatible
  for cls in CLASSES:
   page=await browser.new_page(viewport={'width':390,'height':920})
   page.on('pageerror',lambda e:errors.append(str(e)))
   slot=fixture(floor=21,classId=cls,state='fighting',enemy='griffeuse')
   await open_slot(page,slot)
   assert await page.locator('#specialActionName').inner_text() in ['Vampirisation','Frappe spectrale','Miroir magique','Malédiction du sang','Vol de puissance','Purification'];count+=1
   # délai d'IA : ~1 à 3 s puis sauvegarde
   await page.locator('[data-combat-action="special"]').click()
   await page.wait_for_function('''id=>{let s=localStorage.getItem('tour_des_waifus_v1_slot_'+id);if(!s)return false;return JSON.parse(s).data.tower.combat?.turn===1;}''',arg=slot['id'],timeout=7000)
   d=await saved_data(page,slot)
   assert d['waifus'][0]['energy']==80,cls;count+=1
   assert d['tower']['combat']['effects']['player'],cls;count+=1
   assert not errors,errors
   await page.close()
  await browser.close()
 print(f'V14 BROWSER : {count} contrôles réussis, aucune erreur JS')
if __name__=='__main__':asyncio.run(main())
