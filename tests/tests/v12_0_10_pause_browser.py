"""Chromium : les secondes de malédiction ne s'appliquent pas derrière une fenêtre ni hors écran."""
import asyncio,json,sys
from playwright.async_api import async_playwright
from v12_0_10_browser import saved_combat,debuff
from three_waifus_browser import boot,PREFIX,snapshot

async def read(page,id):
  return json.loads((await snapshot(page))[PREFIX+id])['data']

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  slot=saved_combat('occultiste')
  await boot(page,{PREFIX+slot['id']:json.dumps(slot,ensure_ascii=False)})
  await page.locator('.save-controls button').first.click()
  await page.evaluate('Math.random=()=>.99')
  await page.locator('[data-combat-action="special"]').click()
  await page.wait_for_timeout(1600)
  before=debuff(await read(page,slot['id']),'curse')['percent']
  assert before>=2,before
  await page.locator('#statusDetailsBtn').click()
  assert await page.locator('#effectsOverlay').is_visible()
  await page.wait_for_timeout(1600)
  during=debuff(await read(page,slot['id']),'curse')['percent']
  assert during==before,(before,during)
  await page.locator('#effectsClose').click()
  await page.wait_for_timeout(1550)
  after=debuff(await read(page,slot['id']),'curse')['percent']
  assert before+2<=after<=before+4,(before,after)
  snap=await snapshot(page)
  await page.close()
  await asyncio.sleep(1.3)  # Hors navigateur / hors jeu : aucun effet appliqué.
  page=await browser.new_page(viewport={'width':390,'height':844})
  page.on('pageerror',lambda e:errors.append(str(e)))
  await boot(page,snap)
  await page.locator('.save-controls button').first.click()
  resumed=debuff(await read(page,slot['id']),'curse')['percent']
  assert resumed==after,(resumed,after)
  await page.wait_for_timeout(1450)
  running=debuff(await read(page,slot['id']),'curse')['percent']
  assert running==after+2,(running,after)
  assert not errors,errors
  await page.close();await browser.close()
 print(f'PASS Chromium pause/reprise: avant={before} %, modale={during} %, reprise={after} %, tick suivant={running} %, erreurs JS={len(errors)}')

if __name__=='__main__':asyncio.run(main())
