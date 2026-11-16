from pathlib import Path
from playwright.sync_api import sync_playwright
import re

root=Path(__file__).resolve().parents[2]
html=(root/'index.html').read_text(encoding='utf-8')
css_files=re.findall(r'<link[^>]*href="([^"]+\.css)"',html)
js_files=re.findall(r'<script[^>]*src="([^"]+\.js)"[^>]*></script>',html)
html=re.sub(r'<link[^>]*href="[^"]+\.css"[^>]*>', '',html)
html=re.sub(r'<script[^>]*src="[^"]+\.js"[^>]*></script>', '',html)

def boot(page,saved=None):
    page.set_content(html)
    page.evaluate('''(saved) => {
      const values=Object.assign({},saved||{});
      window.__storageValues=values;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem:k=>values[k]??null,setItem:(k,v)=>values[k]=v,removeItem:k=>delete values[k],
        key:i=>Object.keys(values)[i]??null,get length(){return Object.keys(values).length}
      }});
      HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
      HTMLMediaElement.prototype.pause=function(){};
    }''',saved)
    for css in css_files: page.add_style_tag(content=(root/css).read_text(encoding='utf-8'))
    for js in js_files: page.add_script_tag(content=(root/js).read_text(encoding='utf-8'))

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(1440,900),(390,844)]:
        ctx=browser.new_context(viewport={'width':width,'height':height})
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        boot(page)
        assert page.locator('#audioSettingsBtn').inner_text()=='⚙️ Paramètres'
        assert page.locator('#v16MotionToggle').count()==1
        assert not page.locator('#v16MotionToggle').is_visible()
        page.locator('#audioSettingsBtn').click()
        assert page.locator('#audioTitle').inner_text()=='⚙️ Paramètres'
        assert page.locator('#v16MotionToggle').is_visible()
        assert page.locator('#v16AutoSkipToggle').is_visible()
        assert [page.locator('#'+x).input_value() for x in ['musicVolume','combatVolume','sfxVolume']]==['30']*3
        assert page.locator('#v16AutoSkipToggle').get_attribute('aria-pressed')=='false'
        page.locator('#v16AutoSkipToggle').click()
        assert page.locator('#v16AutoSkipToggle').get_attribute('aria-pressed')=='true'
        assert page.evaluate('BellymonMotion.isAutoSkip()') is True
        assert page.evaluate('BellymonMotion.isEnabled()') is True
        page.locator('#musicVolume').fill('50')
        page.locator('#v16MotionToggle').click()
        assert page.locator('#v16MotionToggle').get_attribute('aria-pressed')=='false'
        saved=page.evaluate('window.__storageValues')
        assert saved['bellymon-v16-auto-skip']=='on'
        assert saved['bellymon-v16-motion']=='off'
        page.close()
        page=ctx.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        boot(page,saved)
        page.locator('#audioSettingsBtn').click()
        assert page.locator('#musicVolume').input_value()=='50'
        assert page.locator('#v16MotionToggle').get_attribute('aria-pressed')=='false'
        assert page.locator('#v16AutoSkipToggle').get_attribute('aria-pressed')=='true'
        page.locator('#v16MotionToggle').click()
        assert page.evaluate('BellymonMotion.isEnabled()') is True
        page.locator('#audioDoneBtn').click()
        # Coffre pré-tiré avec bonus : deux rouleaux finaux, sans attente ni doublon sonore.
        page.evaluate('''() => {
          window.audioEffectsPlayed=[];
          window.BellymonAudio={playEffect:k=>window.audioEffectsPlayed.push(k)};
          document.getElementById('eventResultOverlay').hidden=false;
          BellymonMotion.playResult({kind:'chest',reward:{food:{small:3,large:0},bonus:'force'}});
        }''')
        assert page.locator('#v16RevealSkip').is_hidden()
        assert page.locator('#eventResultClose').is_enabled()
        assert page.locator('#v16Showcase .v16-reel-col').count()==2
        assert page.locator('#v16Showcase .v16-reel-col').nth(0).get_attribute('aria-label')=='Steak, 3'
        assert page.evaluate('window.audioEffectsPlayed')==['chest']
        page.evaluate("() => {BellymonMotion.cancelResult();document.getElementById('eventResultOverlay').hidden=true;}")
        # Piège automatique : roue visible à l'arrêt, rire joué une seule fois.
        page.evaluate("document.getElementById('eventResultOverlay').hidden=false; BellymonMotion.playResult({kind:'trap',trapType:'rapidite'})")
        assert page.locator('#v16RevealSkip').is_hidden()
        assert page.locator('#v16Showcase .v16-wheel-disc').count()==1
        assert page.locator('#v16Showcase .v16-slot-caption').inner_text()=='Malédiction révélée'
        assert page.evaluate('window.audioEffectsPlayed')==['chest','trap']
        page.evaluate("() => {BellymonMotion.cancelResult();document.getElementById('eventResultOverlay').hidden=true;}")
        # AUTO désactivé : l'ancien bouton de passage manuel reste fonctionnel.
        page.locator('#audioSettingsBtn').click()
        page.locator('#v16AutoSkipToggle').click()
        assert page.evaluate('BellymonMotion.isAutoSkip()') is False
        page.locator('#audioDoneBtn').click()
        page.evaluate("document.getElementById('eventResultOverlay').hidden=false; BellymonMotion.playResult({kind:'chest',reward:{food:{small:2,large:0}}})")
        assert page.locator('#v16RevealSkip').is_visible()
        assert page.locator('#eventResultClose').is_disabled()
        page.locator('#v16RevealSkip').click()
        assert page.locator('#eventResultClose').is_enabled()
        assert page.locator('#v16RevealSkip').is_hidden()
        assert page.locator('#v16Showcase .v16-reel-col').count()==1
        assert page.evaluate('window.audioEffectsPlayed')==['chest','trap','chest']
        page.evaluate("() => {BellymonMotion.cancelResult();document.getElementById('eventResultOverlay').hidden=true;}")
        # « Effets OFF » ne supprime pas les récompenses.
        page.locator('#audioSettingsBtn').click()
        page.locator('#v16MotionToggle').click()
        assert page.evaluate('BellymonMotion.isEnabled()') is False
        assert page.evaluate('BellymonMotion.isAutoSkip()') is False
        page.locator('#audioDoneBtn').click()
        page.evaluate("document.getElementById('eventResultOverlay').hidden=false; BellymonMotion.playResult({kind:'chest',reward:{food:{large:2},bonus:'constitution'}})")
        assert page.locator('#v16Showcase .v16-reel-col').count()==2
        assert page.locator('#eventResultClose').is_enabled()
        assert page.locator('#v16RevealSkip').is_hidden()
        page.evaluate("() => {BellymonMotion.cancelResult();document.getElementById('eventResultOverlay').hidden=true;}")
        page.locator('#audioSettingsBtn').click()
        # Le test peut créer une capture locale si nécessaire.
        # page.screenshot(path=str(root.parent/f'parametres_{width}.png'))
        # Responsive: accessible by scrolling the modal, no horizontal spill.
        assert page.locator('#audioDoneBtn').is_visible()
        assert page.evaluate('document.querySelector("#audioOverlay .audio-modal").scrollWidth <= document.querySelector("#audioOverlay .audio-modal").clientWidth + 1')
        assert not errors,errors
        print(f'PASS {width}x{height}: UI, persistence, AUTO coffre + piège, audio x1, skip manuel, effets OFF, modal responsive, zéro erreur JS')
        ctx.close()
    browser.close()
