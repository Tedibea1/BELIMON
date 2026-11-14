#!/usr/bin/env python3
"""V15.5: navigation, class list, E-rank-only portraits, pause and save persistence."""
import re
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=root.joinpath('index.html').read_text()
css_files=re.findall(r'<link rel="stylesheet" href="([^"]+)"',html)
js_files=re.findall(r'<script defer src="([^"]+)"></script>',html)
html=re.sub(r'<link rel="stylesheet" href="[^"]+">','',html)
html=re.sub(r'<script defer src="[^"]+"></script>','',html)
html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
checks=0
errors=[]
def check(assertion,message):
 global checks
 if not assertion:raise AssertionError(message)
 checks+=1
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for viewport in [{'width':1366,'height':900},{'width':390,'height':844}]:
   context=browser.new_context(viewport=viewport)
   page=context.new_page()
   page.on('pageerror',lambda err:errors.append(str(err)))
   def serve_asset(route):
    sub=route.request.url.split('bellymon.test/',1)[-1].split('?')[0]
    file=root/sub
    if file.is_file():route.fulfill(path=str(file))
    else:route.abort()
   page.route('https://bellymon.test/**',serve_asset)
   page.goto('about:blank')
   page.evaluate('''() => {const data=new Map();Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return data.get(String(k))??null},setItem(k,v){data.set(String(k),String(v))},removeItem(k){data.delete(String(k))},key(i){return [...data.keys()][i]||null},get length(){return data.size}}})}''')
   page.set_content(html,wait_until='domcontentloaded')
   for css in css_files:page.add_style_tag(content=(root/css).read_text())
   for js in js_files:page.add_script_tag(content=(root/js).read_text())
   page.locator('#menuScreen:not([hidden])').wait_for(timeout=10000)
   check(page.locator('#openGuideBtn').is_visible(),'Guide missing from main header')
   page.click('#openGuideBtn')
   check(page.locator('#guideScreen').is_visible(),'Guide not visible')
   check(page.locator('#menuScreen').is_hidden(),'Menu not hidden in Guide')
   check(page.locator('.guide-class-card').count()==12,'Guide must display 12 classes')
   check(page.locator('img[src*="/commun/E.png"]').count()==13,'Guide must display only E-class portraits: 12 cards + main')
   check(not page.locator('#guideScreen img[src*="/musclee/"],#guideScreen img[src*="/obese/"],#guideScreen img[src*="/chetive/"]').count(),'Guide must not show rank D-S sprites')
   check(page.locator('#guideContent').inner_text().count('Punition frénétique')==1,'Special description not visible')
   check('×1,5' not in page.locator('#guideScreen').inner_text(),'No damage coefficients in guide')
   page.click('[data-guide-class="spectre"]')
   check('Frappe spectrale' in page.locator('.guide-class-detail').inner_text(),'Latest Spectre special missing')
   check(page.locator('.guide-class-detail .guide-stat-row').nth(1).locator('.guide-diamond.is-filled').count()==4,'Spectre speed must have 4 filled diamonds')
   page.click('[data-guide-tab="morphologies"]')
   check(page.locator('.guide-morph-card').count()==3,'All three morphologies needed')
   check(page.locator('.guide-morph-card .guide-stat-row').count()==9,'Morphology stat rows not displayed')
   check(page.locator('.guide-morph-card .guide-diamond').count()==36,'Morphology ratings must show filled AND empty diamonds')
   check(page.locator('.guide-morph-card').first.locator('.guide-stat-row').nth(0).locator('.guide-diamond.is-filled').count()==3,'Musclee force needs 3 filled diamonds')
   check(page.locator('.guide-morph-card').first.locator('.guide-stat-row').nth(0).locator('.guide-diamond.is-empty').count()==1,'One empty diamond required')
   check(all(page.locator('.guide-stat-row').nth(i).evaluate('(row)=>{const a=row.getBoundingClientRect(),b=row.querySelector(".guide-stat-label").getBoundingClientRect(),c=row.querySelector(".guide-stat-diamonds").getBoundingClientRect();return Math.abs(((b.left+c.right)/2)-(a.left+a.width/2))<7}') for i in range(9)),'Ratings should form a compact centered group')
   page.screenshot(path=str(root/'tests'/f'guide_v15_5_2_morph_{viewport["width"]}.png'),full_page=True)
   check('+++' not in page.locator('#guideContent').inner_text(),'Raw plus ratings should not appear')
   page.click('[data-guide-tab="competences"]')
   check(page.locator('.guide-skill-card').count()==12,'12 skills expected')
   check('Malédiction du sang' in page.locator('#guideContent').inner_text(),'Maudite skill missing')
   check('Vol de puissance' in page.locator('#guideContent').inner_text(),'Envouteuse skill missing')
   check(not re.search(r'\b(?:10|20|35|40|50)\s*%',page.locator('#guideContent').inner_text()),'No exact skill percentages allowed')
   page.click('#guideBackBtn')
   check(page.locator('#menuScreen').is_visible(),'Back-to-menu failed')
   # Check guide from character creation and preserve the form.
   page.click('#newGameBtn')
   check(page.locator('#createScreen').is_visible(),'Creation screen missing')
   page.fill('#partyName','Guide Test')
   page.fill('#playerName','Testeuse')
   page.click('#openGuideBtn')
   check(page.locator('#guideScreen').is_visible(),'Guide inaccessible from creation')
   page.click('#guideBackBtn')
   check(page.locator('#createScreen').is_visible(),'Return to creation failed')
   check(page.locator('#partyName').input_value()=='Guide Test','Form content must persist')
   page.click('button.create-submit')
   page.locator('#playScreen:not([hidden])').wait_for(timeout=10000)
   page.click('#openGuideBtn')
   check(page.locator('#guideScreen').is_visible(),'Guide inaccessible in game')
   page.click('#guideBackBtn')
   check(page.locator('#playScreen').is_visible(),'Return to gameplay failed')
   check('Testeuse' in page.locator('#playingPlayer').inner_text(),'Game state must persist')
   # A screenshot for manual visual inspection, without a transient toast.
   page.evaluate("document.getElementById('toast').hidden=true")
   if viewport['width']==1366:
    page.click('#openGuideBtn')
    page.screenshot(path=str(root/'tests'/'guide_v15_5_desktop.png'),full_page=True)
   else:
    page.click('#openGuideBtn')
    page.screenshot(path=str(root/'tests'/'guide_v15_5_mobile.png'),full_page=True)
   context.close()
  browser.close()
check(len(errors)==0,'JavaScript errors: '+str(errors[:4]))
print(f'V15.5 GUIDE BROWSER: {checks} checks passed; 0 JS errors')
