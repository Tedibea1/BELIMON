#!/usr/bin/env python3
"""BELLYMON V15.5.1 : les journaux doivent rester synchronises sans doublons visibles."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys,re
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
import v14_browser as fixture_lib

def route_local(route):
    path=route.request.url.split('bellymon.test/',1)[-1].split('?',1)[0]
    target=ROOT/path
    if target.is_file(): route.fulfill(path=str(target))
    else: route.abort()

html=ROOT.joinpath('index.html').read_text(encoding='utf-8')
css_files=re.findall(r'<link rel="stylesheet" href="([^"]+)"',html)
js_files=re.findall(r'<script defer src="([^"]+)"></script>',html)
html=re.sub(r'<link rel="stylesheet" href="[^"]+">','',html)
html=re.sub(r'<script defer src="[^"]+"></script>','',html)
html=html.replace('<head>','<head><base href="https://bellymon.test/">',1)
checks=0
errors=[]
def check(cond,why):
    global checks
    if not cond: raise AssertionError(why)
    checks+=1

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in (340,390,720,1024,1120,1121,1366,1648):
        for state in ('rest','fighting'):
            page=browser.new_page(viewport={'width':width,'height':900})
            page.on('pageerror',lambda exc:errors.append(str(exc)))
            page.route('https://bellymon.test/**',route_local)
            slot=fixture_lib.fixture(21,'exorciste','spectre',state)
            slot['data']['tower']['history']=['Journal recent depuis la sauvegarde','Journal precedent depuis la sauvegarde']
            if state=='fighting':
                slot['data']['tower']['combat']['lastMessage']='Ta waifu utilise Frappe spectrale : 70 degats.\nTa waifu esquive l’attaque !'
            raw=json.dumps(slot,ensure_ascii=False)
            page.goto('about:blank')
            page.evaluate('''({id,raw}) => {const map=new Map([['tour_des_waifus_v1_slot_'+id,raw]]); Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return map.get(String(k))??null},setItem(k,v){map.set(String(k),String(v))},removeItem(k){map.delete(String(k))},clear(){map.clear()},key(i){return [...map.keys()][i]??null},get length(){return map.size}}})}''',{'id':slot['id'],'raw':raw})
            page.set_content(html,wait_until='domcontentloaded')
            for css in css_files: page.add_style_tag(content=(ROOT/css).read_text(encoding='utf-8'))
            for js in js_files: page.add_script_tag(content=(ROOT/js).read_text(encoding='utf-8'))
            page.locator('.save-controls button').first.click()
            page.locator('#playScreen:not([hidden])').wait_for()
            check(page.title()=='BELLYMON · V15.5.2',f'V15.5.1 title {width} {state}')
            sidebar=page.locator('.game-sidebar-right')
            banner=page.locator('.event-banner')
            check(page.locator('.game-sidebar-right').count()==1 and banner.count()==1,'both journal containers present')
            check(sidebar.is_visible() == (width>1120),f'Right journal visibility {width} {state}')
            check(banner.is_visible() == (width<=1120),f'Mobile journal visibility {width} {state}')
            check(int(sidebar.is_visible())+int(banner.is_visible())==1,f'Only one journal visible {width} {state}')
            check(page.locator('#logTop').text_content()==page.locator('#mobileLogTop').text_content()==slot['data']['tower']['history'][0],f'History latest match {width}')
            check(page.locator('#logBottom').text_content()==page.locator('#mobileLogBottom').text_content()==slot['data']['tower']['history'][1],f'History earlier match {width}')
            check(page.locator('#sessionHint').text_content()==page.locator('#desktopJournalHint').text_content(),f'Combat/event summary match {width}')
            check(page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+4'),f'Horizontal overflow {width} {state}')
            # On uniformise aussi les tailles des commandes dans chaque viewport.
            values=page.evaluate('''() => Object.fromEntries(['startCombatBtn','chooseFighterBtn','quitTowerBtn','towerAutoButton'].map(id=>[id,getComputedStyle(document.getElementById(id)).fontSize]))''')
            check(len(set(values.values()))==1,f'Font mismatch {width}: {values}')
            check(values['quitTowerBtn']==('13px' if width>720 else '12px' if width>340 else '11px'),f'Unexpected action font size {width}: {values}')
            if state=='fighting':
                check('Frappe spectrale' in page.locator('#desktopJournalHint').text_content(),f'Fight details lost {width}')
                check(page.locator('.event-banner').evaluate('(e)=>e.previousElementSibling.id')=='actionPanel',f'Combat narration should remain after actions {width}')
            else:
                check(page.locator('.event-banner').evaluate('(e)=>e.nextElementSibling.id')=='actionPanel',f'Non-combat journal should remain before actions {width}')
            if width in (390,1366) and state=='fighting':
                page.screenshot(path=str(ROOT/'tests'/f'journal_v15_5_1_{width}.png'),full_page=True)
            if width in (390,1366) and state=='fighting':
                # Verifier la mise a jour apres un vrai tour, avec le meme texte de chaque cote.
                hero=slot['data']['waifus'][0]
                page.locator('[data-combat-action="defend"]').click()
                page.wait_for_function('''id => {const raw=localStorage.getItem('tour_des_waifus_v1_slot_'+id);return raw && JSON.parse(raw).data.tower.combat?.turn>=1}''',arg=slot['id'],timeout=13000)
                page.wait_for_timeout(120)
                check(page.locator('#sessionHint').text_content()==page.locator('#desktopJournalHint').text_content(),f'Summary unsynced after real turn {width}')
                check(page.locator('#logTop').text_content()==page.locator('#mobileLogTop').text_content(),f'History unsynced after turn {width}')
                check('Tour 1' not in page.locator('#logTop').text_content(),f'Latest turn duplicated in history {width}')
                check(sidebar.is_visible() == (width>1120) and banner.is_visible() == (width<=1120),f'Visibility changed after turn {width}')
            page.close()
    check(not errors,'JavaScript page errors: '+str(errors[:5]))
    browser.close()
print(f'BELLYMON V15.5.1 : {checks} validations Chromium (8 largeurs x 2 etats + vrais tours), 0 erreurs JS')
