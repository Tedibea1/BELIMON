/* BELLYMON V15.5.2 — Guide en jeu, purement informatif, sans changer les règles.
   Les illustrations publiques sont EXCLUSIVEMENT les sprites communs de rang E.
   Les chiffres de combat, coefficients, coûts et formules ne sont pas exposés.
*/
(() => {
  'use strict';
  const CHARACTER_GUIDE = Object.freeze({
    epeiste:{flavour:'Combattante offensive à l’épée, solide au corps à corps.',skill:'Frappe dévastatrice',kind:'Attaque puissante',description:'Assène un puissant coup d’épée pouvant infliger un critique.'},
    bagarreuse:{flavour:'Protectrice robuste, faite pour encaisser et épuiser ses ennemis.',skill:'Absorption',kind:'Attaque et épuisement',description:'Porte un coup qui draine progressivement l’énergie adverse pendant plusieurs tours, même si l’attaque est esquivée. Purification bloque le malus.'},
    archere_arcanique:{flavour:'Spécialiste des dégâts magiques, très offensive mais fragile.',skill:'Flèche perforante',kind:'Attaque et affaiblissement',description:'Décoche une flèche magique. Même si l’attaque est esquivée, le malus de Constitution s’applique, sauf sous Purification.'},
    occultiste:{flavour:'Experte des malédictions qui fragilisent progressivement la cible.',skill:'Malédiction abyssale',kind:'Attaque et malédiction',description:'Frappe sa cible et l’affaiblit progressivement en Force, Rapidité et Constitution. Le malus passe même après une esquive, sauf Purification.'},
    pretresse:{flavour:'Soigneuse équilibrée, précieuse pour prolonger les combats.',skill:'Bénédiction vitale',kind:'Soin',description:'Restaure une part importante de ses propres points de vie. Ne permet pas de ressusciter.'},
    griffeuse:{flavour:'Combattante aux griffes, rapide et redoutable lorsqu’elle réussit sa frappe.',skill:'Griffes fatales',kind:'Attaque critique',description:'Tente une attaque dont la réussite dépend de sa Rapidité face à celle de sa cible. Si elle touche, son coup est critique.'},
    vampire:{flavour:'Prédatrice capable de se régénérer en blessant ses adversaires.',skill:'Vampirisation',kind:'Attaque et vol de vie',description:'Attaque son ennemi et récupère de la vie en fonction des dégâts qu’elle lui inflige.'},
    spectre:{flavour:'Combattante insaisissable qui privilégie la Rapidité et les ouvertures.',skill:'Frappe spectrale',kind:'Attaque et protection',description:'Frappe sa cible et devient brièvement intangible. Pendant cet état, elle ne peut pas être touchée par les attaques adverses.'},
    nemesis:{flavour:'Défenseuse qui transforme les attaques reçues en représailles.',skill:'Miroir magique',kind:'Protection et riposte',description:'Active un miroir protecteur qui renvoie une partie des dégâts subis pendant plusieurs tours.'},
    maudite:{flavour:'Combattante résistante qui punit les ennemis trop agressifs.',skill:'Malédiction du sang',kind:'Attaque et malédiction',description:'Projette son sang maudit : même si le coup est esquivé, la malédiction s’applique. L’ennemi perd de la vie chaque fois qu’il attaque pendant les tours suivants. Purification peut la bloquer.'},
    envouteuse:{flavour:'Sorcière polyvalente qui retourne la puissance ennemie à son avantage.',skill:'Vol de puissance',kind:'Attaque et affaiblissement',description:'Lance une attaque magique et dérobe temporairement une part de la Force adverse, même si le coup est esquivé. Purification bloque le vol.'},
    exorciste:{flavour:'Spécialiste de la purification et de la défense contre les malus.',skill:'Purification',kind:'Protection',description:'Dissipe ses effets négatifs et se protège contre les nouveaux malus pendant plusieurs tours.'}
  });
  const MORPHS=Object.freeze([
    {id:'musclee',icon:'💪',name:'Musclée',stats:['+++','+','++'],headline:'Puissance physique',description:'La Force progresse le plus vite, suivie de la Constitution. La Rapidité reste sa spécialité la moins développée.'},
    {id:'obese',icon:'🍖',name:'Obèse',stats:['++','+','+++'],headline:'Résistance',description:'La Constitution est sa grande force, suivie de la Force. Elle privilégie la robustesse plutôt que la vitesse.'},
    {id:'chetive',icon:'⚡',name:'Chétive',stats:['++','+++','+'],headline:'Vitesse',description:'La Rapidité se développe davantage, puis la Force. La Constitution progresse moins vite.'}
  ]);
  const LABELS=[['force','💪 FOR'],['rapidite','⚡ RAP'],['constitution','🛡️ CONS']];
  let classes=[], selected='epeiste', morphBonuses={};
  const specialName=id=>window.TDWCombat?.SPECIALS?.[id]?.name || CHARACTER_GUIDE[id].skill;
  const $=id=>document.getElementById(id);
  const safe=s=>String(s).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const stars=(s)=>'+' .repeat(Math.max(1,Math.min(4,Math.round(s/10))));
  const morphProfile=id=>LABELS.map(([key])=>'+'.repeat(Math.max(1,Math.min(3,Math.round((morphBonuses[id]?.[key]||2)/2)))));
  const portrait=id=>`assets/characters/${id}/commun/E.png`;
  function specTable(stats){
    return `<div class="guide-stat-table" aria-label="Spécialisations des statistiques">${LABELS.map(([id,label],i)=>{
      const value=Array.isArray(stats)?stats[i]:stars(stats[id]);
      const count=value.length;
      const diamonds=Array.from({length:4},(_,index)=>`<span class="guide-diamond ${index<count?'is-filled':'is-empty'}" aria-hidden="true">${index<count?'◆':'◇'}</span>`).join('');
      return `<div class="guide-stat-row"><span class="guide-stat-label">${label}</span><strong class="guide-stat-diamonds" role="img" aria-label="${safe(label)} : ${count} losange${count>1?'s':''} rempli${count>1?'s':''} sur 4">${diamonds}</strong></div>`;
    }).join('')}</div>`;
  }
  function renderClasses(){
    const cl=classes.find(c=>c.id===selected)||classes[0]; if(!cl)return '';
    const d=CHARACTER_GUIDE[cl.id];
    return `<div class="guide-section-head"><div><span class="overline">CHOISIS UNE HÉROÏNE</span><h3>Les classes</h3><p>Chaque classe a ses points forts et sa propre compétence. Sélectionne un portrait pour lire sa fiche.</p></div><span class="pill">${classes.length} CLASSES</span></div>
      <div class="guide-classes-layout">
        <div class="guide-class-grid" aria-label="Liste des classes">${classes.map(c=>`<button type="button" class="guide-class-card${c.id===cl.id?' is-active':''}" data-guide-class="${safe(c.id)}" aria-pressed="${c.id===cl.id}"><img src="${portrait(c.id)}" alt="Illustration de ${safe(c.name)} au rang E" loading="eager"><strong>${safe(c.icon)} ${safe(c.name)}</strong><small>${safe(c.role)}</small></button>`).join('')}</div>
        <article class="guide-class-detail panel" aria-label="Fiche de ${safe(cl.name)}">
          <div class="guide-detail-heading"><span class="overline">FICHE DE CLASSE · RANG E</span><span class="guide-rank-label">E</span></div>
          <div class="guide-feature"><img src="${portrait(cl.id)}" alt="${safe(cl.name)} — illustration de rang E" class="guide-feature-img"><div><h3>${safe(cl.icon)} ${safe(cl.name)}</h3><span class="guide-type">${safe(cl.role)}</span><p>${safe(d.flavour)}</p></div></div>
          <h4>Spécialités</h4>${specTable(cl.stats)}
          <div class="guide-skill-feature"><span class="overline">✨ COMPÉTENCE SPÉCIALE</span><h4>${safe(specialName(cl.id))}</h4><p>${safe(d.description)}</p></div>
          <p class="guide-discretion">Plus il y a de losanges remplis, plus la classe se distingue dans cette statistique.</p>
        </article>
      </div>`;
  }
  function renderMorphs(){
    return `<div class="guide-section-head"><div><span class="overline">CHOISIR SON ÉVOLUTION</span><h3>Les morphologies</h3><p>Une morphologie oriente la progression de chaque waifu, indépendamment de sa classe et de son sort spécial.</p></div></div>
      <div class="guide-morph-grid">${MORPHS.map(m=>`<article class="guide-morph-card panel"><div class="guide-morph-icon" aria-hidden="true">${m.icon}</div><div class="overline">${safe(m.headline)}</div><h3>${safe(m.name)}</h3>${specTable(morphProfile(m.id))}<p>${safe(m.description)}</p></article>`).join('')}</div>
      <div class="guide-lesson panel"><h4>💡 Comment lire les losanges ?</h4><p>Plus une statistique possède de <strong>losanges remplis ◆</strong>, plus la classe ou la morphologie la favorise. Les <strong>losanges vides ◇</strong> complètent la jauge. Compare-les pour repérer les points forts de chaque morphologie.</p><p>Le rang E est commun à toutes les branches. La morphologie se choisit lors de l’évolution vers le rang D ; la classe et sa compétence spéciale restent les mêmes.</p></div>`;
  }
  function renderSkills(){
    return `<div class="guide-section-head"><div><span class="overline">L'ARSENAL DES WAIFUS</span><h3>Les compétences spéciales</h3><p>Chaque classe possède un pouvoir unique. Découvre ses effets pour choisir la bonne combattante.</p></div><span class="pill">${classes.length} SORTS</span></div>
      <div class="guide-skills-grid">${classes.map(c=>{
        const d=CHARACTER_GUIDE[c.id];
        return `<article class="guide-skill-card panel"><div class="guide-skill-icon" aria-hidden="true">${safe(c.icon)}</div><div class="guide-skill-body"><span class="guide-class-name">${safe(c.name)}</span><h4>${safe(specialName(c.id))}</h4><span class="guide-skill-kind">${safe(d.kind)}</span><p>${safe(d.description)}</p></div></article>`;
      }).join('')}</div>`;
  }
  function show(tab='classes'){
    if(!['classes','morphologies','competences'].includes(tab))tab='classes';
    document.querySelectorAll('[data-guide-tab]').forEach(btn=>{
      const active=btn.dataset.guideTab===tab;
      btn.classList.toggle('is-selected',active);
      btn.setAttribute('aria-pressed',String(active));
    });
    $('guideContent').innerHTML=tab==='classes'?renderClasses():tab==='morphologies'?renderMorphs():renderSkills();
    $('guideContent').querySelectorAll('[data-guide-class]').forEach(button=>button.addEventListener('click',()=>{
      selected=button.dataset.guideClass;
      show('classes');
      const newButton=$('guideContent').querySelector(`[data-guide-class="${selected}"]`);
      newButton?.focus({preventScroll:true});
    }));
  }
  function init({classes:items,morphBonuses:values}){
    morphBonuses=values;
    classes=items.filter(c=>CHARACTER_GUIDE[c.id]);
    if(!classes.length)throw new Error('Aucune classe pour le Guide.');
    show('classes');
  }
  window.BellymonGuide=Object.freeze({init,show});
})();
