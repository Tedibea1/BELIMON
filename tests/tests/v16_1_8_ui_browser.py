"""BELLYMON V16.1.8 — paramètres, hôpital épuré, rire en fin de piège."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re

root=Path(__file__).resolve().parents[2]
page_html=(root/'index.html').read_text('utf-8')
css_files=re.findall(r'<link[^>]*href="([^"]+\.css)"',page_html)
js_files=re.findall(r'<script[^>]*src="([^"]+\.js)"[^>]*></script>',page_html)
page_html=re.sub(r'<link[^>]*href="[^"]+\.css"[^>]*>', '', page_html)
page_html=re.sub(r'<script[^>]*src="[^"]+\.js"[^>]*></script>', '', page_html)

def boot(page,saved=None):
    page.set_content(page_html)
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
    for css in css_files:page.add_style_tag(content=(root/css).read_text('utf-8'))
    for js in js_files:page.add_script_tag(content=(root/js).read_text('utf-8'))

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    checks=0
    for width,height in [(1440,900),(390,844)]:
        ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference')
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        boot(page)
        # Hôpital accessible en mode repos (le texte superflu n'est plus dans le DOM).
        assert 'Trois lits maximum' not in page.locator('#paneHopital').inner_text()
        assert 'énergie revient à 100' not in page.locator('#paneHopital').inner_text()
        assert page.locator('#hospitalOccupancy').count()==1
        assert 'Tester le son' in page.locator('#audioPreviewBtn').inner_text()
        assert 'rot' not in page.locator('#audioPreviewBtn').inner_text().lower()
        assert page.locator('#audioPreviewBtn').get_attribute('title') is None
        checks+=5
        page.locator('#audioSettingsBtn').click()
        master=page.locator('#masterVolume')
        assert master.is_visible()
        assert master.input_value()=='30'
        assert page.locator('#masterVolumeValue').inner_text()=='30 %'
        assert [page.locator('#'+id).input_value() for id in ['musicVolume','combatVolume','sfxVolume']]==['30']*3
        master.fill('40')
        assert [page.locator('#'+id).input_value() for id in ['musicVolume','combatVolume','sfxVolume']]==['40']*3
        assert page.locator('#masterVolumeValue').inner_text()=='40 %'
        page.locator('#combatVolume').fill('70')
        assert [page.locator('#'+id).input_value() for id in ['musicVolume','combatVolume','sfxVolume']]==['40','70','40']
        assert page.locator('#masterVolumeValue').inner_text()=='Personnalisé'
        master.fill('35')
        assert [page.locator('#'+id).input_value() for id in ['musicVolume','combatVolume','sfxVolume']]==['35']*3
        checks+=9
        # Le bouton test reste volontairement énigmatique, mais le son reste un rot.
        page.evaluate('''() => {
          window.previewEffects=[];
          HTMLMediaElement.prototype.play=function(){window.previewEffects.push(this.src);return Promise.resolve();};
        }''')
        page.locator('#audioPreviewBtn').click()
        assert len([src for src in page.evaluate('window.previewEffects') if '/burps/rot_' in src])==1
        checks+=1
        page.locator('#audioDoneBtn').click()
        # La roulette joue le rire UNIQUEMENT à l'arrêt.
        page.evaluate('''() => {
          window.results=[];
          window.BellymonAudio={playEffect:(kind)=>window.results.push(kind)};
          document.getElementById('eventResultOverlay').hidden=false;
          window.BellymonMotion.playResult({kind:'trap',trapType:'force'});
        }''')
        assert page.evaluate("window.results.filter(x=>x==='trap').length")==0
        assert page.evaluate("window.results.includes('trapSpin')")
        assert page.locator('#eventResultText').is_hidden()
        assert page.locator('#v16RevealSkip').is_visible()
        page.locator('#v16RevealSkip').click()
        assert page.evaluate("window.results.filter(x=>x==='trap').length")==1
        assert page.locator('#eventResultText').is_visible()
        page.wait_for_timeout(180)
        assert page.evaluate("window.results.filter(x=>x==='trap').length")==1
        checks+=6
        page.evaluate("BellymonMotion.cancelResult();document.getElementById('eventResultOverlay').hidden=true;")
        # Auto : le résultat est visible immédiatement, rire exactement une fois.
        page.locator('#audioSettingsBtn').click()
        page.locator('#v16AutoSkipToggle').click()
        page.locator('#audioDoneBtn').click()
        page.evaluate("document.getElementById('eventResultOverlay').hidden=false;BellymonMotion.playResult({kind:'trap',trapType:'rapidite'});")
        assert page.evaluate("window.results.filter(x=>x==='trap').length")==2
        assert page.locator('#v16RevealSkip').is_hidden()
        assert page.locator('#v16Showcase .v16-wheel-disc').count()==1
        checks+=3
        assert not errors,errors
        checks+=1
        saved=page.evaluate('window.__storageValues')
        assert all(str(v) in saved['bellymon_audio_preferences_v1'] for v in ['35'])
        page.close()
        page=ctx.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
        boot(page,saved)
        page.locator('#audioSettingsBtn').click()
        assert page.locator('#masterVolumeValue').inner_text()=='35 %'
        assert [page.locator('#'+id).input_value() for id in ['musicVolume','combatVolume','sfxVolume']]==['35']*3
        checks+=3
        # Valeurs préexistantes et mixtes : on ne les écrase pas à l'ouverture.
        page.close();page=ctx.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
        boot(page,{'bellymon_audio_preferences_v1':'{"music":true,"sfx":true,"musicVolume":20,"combatVolume":55,"sfxVolume":85}'})
        page.locator('#audioSettingsBtn').click()
        assert page.locator('#masterVolumeValue').inner_text()=='Personnalisé'
        assert [page.locator('#'+id).input_value() for id in ['musicVolume','combatVolume','sfxVolume']]==['20','55','85']
        checks+=2
        assert not errors, errors
        page.close();ctx.close()
    browser.close()
    print(f'PASS V16.1.8 : {checks} vérifications sur ordinateur et mobile, sans erreur JavaScript')
