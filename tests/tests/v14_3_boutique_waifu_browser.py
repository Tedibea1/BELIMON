"""V14.3: boutique achats only; potions in waifu sheets; locked above first floor."""
import asyncio, json, re, sys, uuid
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

def fixture(floor=1):
  slot=json.loads((ROOT/'tests/DEMO_RELAIS_V4.json').read_text())
  slot['id']=str(uuid.uuid4())
  slot['data']['food']={'small':80,'large':30}
  slot['data'].pop('potions',None)
  slot['data']['tower'].update(floor=floor,record=max(floor,1),room='rest',event=None,combat=None)
  return slot

async def data(page,slot):
  return json.loads((await b.snapshot(page))[PREFIX+slot['id']])['data']

async def launch_save(page,slot):
  await b.boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
  await page.locator('.save-controls button').first.click()

async def main():
  checks=0
  async with async_playwright() as pw:
    browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width in (320,390,1440):
      errors=[]
      page=await browser.new_page(viewport={'width':width,'height':900})
      page.on('pageerror',lambda error:errors.append(str(error)))
      slot=fixture()
      await launch_save(page,slot)
      assert await page.title()=='BELLYMON · V14.3';checks+=1
      await page.locator('#tabBoutique').click()
      assert await page.locator('#shopWorking').is_visible();checks+=1
      assert await page.locator('#shopLocked').is_hidden();checks+=1
      assert await page.locator('#shopOffers .shop-card').count()==3;checks+=1
      # All six prices shown in the actual shop match the approved new tiered prices.
      for potion,steaks,gigots in [('petite',9,3),('grande',15,5),('supreme',21,7)]:
        assert (await page.locator(f'[data-shop-buy="{potion}"][data-food-type="small"]').inner_text()).strip()==f'Acheter · {steaks} 🥩';checks+=1
        assert (await page.locator(f'[data-shop-buy="{potion}"][data-food-type="large"]').inner_text()).strip()==f'Acheter · {gigots} 🍖';checks+=1
      assert await page.locator('#paneBoutique').get_by_text('Mes potions').count()==0;checks+=1
      # Buy little, middle, supreme (each alternate currency).
      for p,f in [('petite','small'),('grande','large'),('supreme','small')]:
        await page.locator(f'[data-shop-buy="{p}"][data-food-type="{f}"]').click()
      d=await data(page,slot)
      assert d['food']=={'small':50,'large':25}, d['food'];checks+=1
      assert d['potions']=={'petite':1,'grande':1,'supreme':1},d['potions'];checks+=1
      # Use from first hero sheet, no evolution.
      await page.locator('#tabWaifus').click()
      await page.locator('#ownedGrid .owned-card').first.click()
      assert await page.locator('#waifuDetailOverlay').is_visible();checks+=1
      assert await page.locator('.hero-detail-right [data-potion-type]').count()==3;checks+=1
      await page.locator('[data-potion-type="petite"]').click()
      assert (await page.locator('#feedConfirm').inner_text()).strip()=='Utiliser';checks+=1
      assert await page.locator('#feedQuantityControls').is_hidden();checks+=1
      assert await page.locator('#feedConfirm').is_enabled();checks+=1
      if width==390:
        await page.screenshot(path=str(ROOT.parent/'BELLYMON_V14.3_Fiche_Potion_390px.png'),full_page=True)
      first=next(h for h in d['waifus'] if h['id']==slot['data']['waifus'][0]['id'])
      before=first['hp']; mx=first['maxHp']; exp=min(mx,before+round(mx*.3))
      await page.locator('#feedConfirm').click()
      d=await data(page,slot)
      first=next(h for h in d['waifus'] if h['id']==slot['data']['waifus'][0]['id'])
      assert first['hp']==exp and d['potions']['petite']==0 and first['evolutionPoints']==0,(first,d['potions']);checks+=1
      assert await page.locator('#feedConfirm').is_disabled();checks+=1
      # Use another potion without leaving sheet, then test food works as before.
      await page.locator('[data-potion-type="grande"]').click()
      assert await page.locator('#feedConfirm').is_enabled();checks+=1
      await page.locator('#feedConfirm').click()
      d=await data(page,slot)
      first=next(h for h in d['waifus'] if h['id']==slot['data']['waifus'][0]['id'])
      assert d['potions']['grande']==0 and first['hp']==min(mx,exp+round(mx*.6));checks+=1
      await page.locator('[data-food-type="small"].food-choice').click()
      assert (await page.locator('#feedConfirm').inner_text()).strip()=='🍽️ Nourrir';checks+=1
      assert await page.locator('#feedQuantityControls').is_visible();checks+=1
      await page.locator('#feedConfirm').click()
      d=await data(page,slot)
      first=next(h for h in d['waifus'] if h['id']==slot['data']['waifus'][0]['id'])
      assert first['evolutionPoints']>0 and d['food']['small']<50;checks+=1
      assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'horizontal overflow {width}';checks+=1
      assert not errors,errors
      await page.screenshot(path=str(ROOT.parent/f'BELLYMON_V14.3_Fiche_{width}px.png'),full_page=True)
      # Reload persists potions & HP & XP without breaking.
      snap=await b.snapshot(page)
      await page.close()
      page=await browser.new_page(viewport={'width':width,'height':900})
      page.on('pageerror',lambda error:errors.append(str(error)))
      await b.boot(page,snap)
      await page.locator('.save-controls button').first.click()
      dd=await data(page,slot)
      assert dd['potions']==d['potions'] and dd['waifus'][0]['hp']==first['hp'] and dd['waifus'][0]['evolutionPoints']==first['evolutionPoints'];checks+=1
      assert not errors,errors
      await page.close()
    # floor 50 shop locked, potion usage available in sheet.
    page=await browser.new_page(viewport={'width':390,'height':900})
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    slot=fixture(50);slot['data']['potions']={'petite':1,'grande':0,'supreme':0}
    await launch_save(page,slot)
    await page.locator('#tabBoutique').click()
    assert await page.locator('#shopLocked').is_visible();checks+=1
    assert await page.locator('#shopWorking').is_hidden();checks+=1
    assert await page.locator('#shopReturn').is_visible();checks+=1
    await page.screenshot(path=str(ROOT.parent/'BELLYMON_V14.3_Boutique_Bloquee_390px.png'),full_page=True)
    await page.locator('#tabWaifus').click()
    await page.locator('#ownedGrid .owned-card').first.click()
    await page.locator('[data-potion-type="petite"]').click()
    assert await page.locator('#feedConfirm').is_enabled();checks+=1
    await page.locator('#feedConfirm').click()
    dd=await data(page,slot)
    assert dd['waifus'][0]['hp']>slot['data']['waifus'][0]['hp'] and dd['potions']['petite']==0;checks+=1
    await page.locator('#detailClose').click()
    await page.locator('#tabBoutique').click()
    await page.locator('#shopReturn').click()
    assert await page.locator('#confirmOverlay').is_visible();checks+=1
    assert 'boutique' in (await page.locator('#confirmMessage').inner_text()).lower();checks+=1
    await page.locator('#confirmAccept').click()
    assert (await data(page,slot))['tower']['floor']==1;checks+=1
    await page.locator('#tabBoutique').click()
    assert await page.locator('#shopOffers .shop-card').count()==3;checks+=1
    assert not errors,errors
    await page.close()
    # in combat potions blocked in detail, independently of purchasable status.
    slot=fixture();slot['data']['potions']={'petite':1,'grande':0,'supreme':0}
    slot['data']['tower'].update(room='event',event={'type':'combat','state':'fighting','enemy':{
        'id':'mob','classId':'epeiste','rank':'E','morph':None,'hp':100,'maxHp':100,'energy':100,
        'stats':{'force':15,'rapidite':5,'constitution':10}}},
        combat={'turn':0,'lastMessage':'Combat engagé','effects':{'player':{},'enemy':{}},
        'knockedOutIds':[],'usedHeroIds':[slot['data']['activeWaifuId']]})
    page=await browser.new_page(viewport={'width':390,'height':900})
    await launch_save(page,slot)
    await page.locator('#tabWaifus').click()
    await page.locator('#ownedGrid .owned-card').first.click()
    assert await page.locator('[data-potion-type="petite"]').is_disabled();checks+=1
    assert await page.locator('#feedConfirm').is_disabled();checks+=1
    await page.close()
    await browser.close()
  print('PASS:',checks,'browser assertions')

if __name__=='__main__': asyncio.run(main())
