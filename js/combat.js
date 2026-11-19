/* BELLYMON — V15.10 : règles des combats et coefficients spéciaux actualisés.
   Module pur pour les tours : aucun minuteur ni accès au navigateur.
   L'interface gère le chrono de 15 s et les malus chronométrés en temps réel.
*/
(() => {
  'use strict';
  const COST=Object.freeze({light:2,heavy:3,special:5,defend:0,idle:0});
  // V15.6 : aucune récupération active d’énergie pendant les combats.
  const RECOVERY_COOLDOWN_TURNS=0;
  const ACTIONS=Object.freeze({
    light:{label:'Légère',power:1.0,accuracy:100},
    heavy:{label:'Lourde',power:1.5,accuracy:null},
    special:{label:'Spéciale',power:0,accuracy:100},
    defend:{label:'Défense',power:0,accuracy:100},
    idle:{label:'Temps écoulé',power:0,accuracy:100}
  });
  const SPECIALS=Object.freeze({
    epeiste:{name:'Frappe dévastatrice',description:'Force ×2 · frappe à l’épée pouvant infliger un critique.'},
    bagarreuse:{name:'Absorption',description:'Force ×0,5 · retire 3 énergies par seconde pendant 4 tours (relançable, sans cumul).'},
    archere_arcanique:{name:'Flèche perforante',description:'Force ×1,7 · −15 % Constitution ennemie jusqu’à la fin du combat.'},
    occultiste:{name:'Malédiction abyssale',description:'Force ×1 · −2 % aux 3 stats par seconde active jusqu’à −50 %. Dure 5 tours ; relançable sans cooldown ni cumul.'},
    pretresse:{name:'Bénédiction vitale',description:'Soigne 40 % des PV maximum, sans ressusciter.'},
    griffeuse:{name:'Griffes fatales',description:'Force ×1,5 · test de RAP façon Assassinat (100 % si RAP ≥ 2× celle de la cible, 50 % à RAP égale), puis esquive normale ; critique ×2 garanti si elle touche.'},
    vampire:{name:'Vampirisation',description:'Force ×1,5 · soigne 35 % des dégâts réellement infligés.'},
    spectre:{name:'Frappe spectrale',description:'Force ×1,3 · intangible pendant 2 tours (activation comprise) ; indisponible au tour suivant.'},
    nemesis:{name:'Miroir magique',description:'Renvoie 40 % des dégâts reçus pendant 5 tours (activation comprise), sans cumul.'},
    maudite:{name:'Malédiction du sang',description:'Force ×0,5 · malus impossible à esquiver (sauf Purification) : l’ennemi perd 10 % de ses PV max à chaque attaque offensive durant les 3 tours suivant le lancement, sans cumul.'},
    envouteuse:{name:'Vol de puissance',description:'Force ×1,0 · si l’attaque touche, vole 20 % de la Force ennemie durant les 3 tours suivant le lancement, sans cumul.'},
    exorciste:{name:'Purification',description:'Dissipe les malus et protège des nouveaux malus pendant 5 tours (activation comprise).'}
  });
  const BONUSES=window.BellymonBonuses;
  const safe=n=>Number.isFinite(n)?Math.max(0,n):0;
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  function combatStats(character,collectionBonuses={},penalties={},trapPenalties={}){
    const base=character.stats||{};
    // V8 : bonus plat partagé ; aucun coefficient de rang appliqué ici.
    // V9 : seuls les points personnels sont réduits par les pièges.
    // Les bonus permanents (+2 par niveau) ne sont jamais touchés.
    const personal={};
    for(const stat of ['force','rapidite','constitution']){
      personal[stat]=Math.round(safe(base[stat])*(1-clamp(safe(trapPenalties[stat]),0,1)));
    }
    const modified=BONUSES?BONUSES.totalStats(personal,collectionBonuses):{
      force:personal.force+2*safe(collectionBonuses.force),
      rapidite:personal.rapidite+2*safe(collectionBonuses.rapidite),
      constitution:personal.constitution+2*safe(collectionBonuses.constitution)
    };
    const result={};
    for(const stat of ['force','rapidite','constitution']){
      result[stat]=Math.max(0,Math.round(modified[stat]*(1-clamp(safe(penalties[stat]),0,1))+(stat==='force'?(penalties.forceFlat||0):0)));
    }
    return result;
  }
  // V15 — Probabilité unique et symétrique pour les DEUX camps.
  // +100 RAP = 100 %, même RAP = 50 %, −100 RAP = 0 %.
  // Les statistiques reçues sont déjà modifiées par les bonus de collection,
  // les pièges et les malus actifs, selon les règles existantes.
  function rapChance(ownStats,opponentStats){
    return clamp(50+(ownStats.rapidite-opponentStats.rapidite)/2,0,100);
  }
  // V15.1 — Règles des critiques/esquives ordinaires inspirées de RPG FURRY V21.
  // Probabilités indépendantes de la RAP adverse, plancher entier, plafonnées à 100 %.
  // Les bonus de collection et malus sont déjà inclus dans la RAP effective reçue.
  function combatChances(stats){
    const chance=clamp(Math.floor(safe(stats.rapidite)/2),0,100);
    return {dodge:chance,critical:chance};
  }
  // V15.2 — Griffes fatales : copie de la formule de réussite d’Assassinat (RPG FURRY V21).
  // Vérification supplémentaire AVANT l’esquive ordinaire de la cible (RAP / 2).
  // Contrairement à la V14.9, on compare le RAPPORT entre les RAP, pas leur écart absolu.
  function griffesAssassinationChance(attackerStats,defenderStats){
    const attackerRap=safe(attackerStats?.rapidite);
    const defenderRap=safe(defenderStats?.rapidite);
    // Furry refuse RAP attaquant = 0 ; BELLYMON autorise 0 après certains malus.
    // Cas limite déterministe : 0 contre 0 => 50 % ; 0 contre >0 => 0 %.
    if(attackerRap===0)return defenderRap===0?50:0;
    return clamp(50+100*((attackerRap-defenderRap)/attackerRap),0,100);
  }
  function emptyEffect(){return {swordCons:false,curse:null,siphon:null,
    intangible:null,spectreReadyTurn:1,recoverReadyTurn:1,mirror:null,bloodCurse:null,
    powerGain:null,powerLoss:null,purification:null};}
  const active=(e,turn)=>!!e&&turn>=e.startTurn&&turn<=e.expiresTurn;
  const timed=(value)=>value&&Number.isSafeInteger(value.startTurn)&&Number.isSafeInteger(value.expiresTurn)
    && value.startTurn>=1&&value.expiresTurn>=value.startTurn?{startTurn:value.startTurn,expiresTurn:value.expiresTurn}:null;
  function offensiveSkill(id){return ['epeiste','bagarreuse','archere_arcanique','occultiste','griffeuse','vampire','spectre','maudite','envouteuse'].includes(id);}
  function isOffensiveAction(character,action){return action==='light'||action==='heavy'||(action==='special'&&offensiveSkill(character.classId));}
  function isPurified(effect,turn){return active(effect?.purification,turn);}
  function normalizeEffects(effects={},turn=1){
    const normalize=src=>{
      const e=emptyEffect();
      if(src && typeof src==='object'){
        e.swordCons=src.swordCons===true;
        const curse=src.curse;
        if(curse && Number.isSafeInteger(curse.expiresTurn) && curse.expiresTurn>0){
          e.curse={expiresTurn:curse.expiresTurn,
            percent:clamp(Number.isFinite(curse.percent)?curse.percent:0,0,50),
            nextTickAt:Number.isFinite(curse.nextTickAt)?Math.max(0,curse.nextTickAt):0};
        }else if(curse && Number.isSafeInteger(curse.startTurn) && curse.startTurn>0){
          // Sauvegardes V12.0.9 : convertir l'ancien −10 %/tour sans
          // invalider un duel commencé avant la mise à jour.
          e.curse={expiresTurn:curse.startTurn+4,
            percent:clamp((turn-curse.startTurn+1)*10,10,50),nextTickAt:0};
        }
        if(src.siphon && Number.isSafeInteger(src.siphon.expiresTurn) && src.siphon.expiresTurn>0){
          e.siphon={expiresTurn:src.siphon.expiresTurn,nextTickAt:Number.isFinite(src.siphon.nextTickAt)?Math.max(0,src.siphon.nextTickAt):0};
        }
        e.intangible=timed(src.intangible);
        e.mirror=timed(src.mirror);
        e.bloodCurse=timed(src.bloodCurse);
        e.purification=timed(src.purification);
        e.spectreReadyTurn=Number.isSafeInteger(src.spectreReadyTurn)&&src.spectreReadyTurn>0?src.spectreReadyTurn:1;
        // Absent dans les sauvegardes V14 : la récupération reste immédiatement disponible.
        e.recoverReadyTurn=Number.isSafeInteger(src.recoverReadyTurn)&&src.recoverReadyTurn>0?src.recoverReadyTurn:1;
        for(const id of ['powerGain','powerLoss']){
          const t=timed(src[id]);
          if(t)e[id]={...t,amount:clamp(Number.isFinite(src[id].amount)?src[id].amount:0,0,100000)};
        }
      }
      return e;
    };
    return {player:normalize(effects?.player),enemy:normalize(effects?.enemy)};
  }
  function penaltyFor(effect,turn){
    const curse=effect?.curse && turn<=effect.curse.expiresTurn
      ?clamp(effect.curse.percent,0,50)/100:0;
    const boost=active(effect?.powerGain,turn)?effect.powerGain.amount:0;
    const drain=active(effect?.powerLoss,turn)?effect.powerLoss.amount:0;
    return {force:curse,rapidite:curse,constitution:curse+(effect?.swordCons?0.15:0),forceFlat:boost-drain};
  }
  function canPay(energy,action){return Object.hasOwn(COST,action) && energy>=COST[action];}
  function recoveryTurnsRemaining(turn=1,effect=emptyEffect()){
    return Math.max(0,(effect?.recoverReadyTurn||1)-turn);
  }
  function canRecover(character,turn=1,effect=emptyEffect()){
    return false; // Ancienne API conservée pour les sauvegardes et les extensions.
  }
  function canUseSpecial(character,energy,turn=1,effect=emptyEffect()){
    // Plus de délai propre à Malédiction abyssale : chaque nouvelle utilisation
    // réactualise la durée sans empiler les pourcentages.
    return !!character && Object.hasOwn(SPECIALS,character.classId) && canPay(energy,'special') &&
      (character.classId!=='spectre'||turn>=(effect?.spectreReadyTurn||1));
  }
  const clockDue=(effect,now)=>!!effect && (!effect.nextTickAt || now>=effect.nextTickAt);
  function timedTickDue(effects,now){
    for(const side of ['player','enemy']){
      const fx=effects?.[side];
      if(fx?.siphon && clockDue(fx.siphon,now))return true;
      if(fx?.curse && fx.curse.percent<50 && clockDue(fx.curse,now))return true;
    }
    return false;
  }
  function tickTimedEffects(effects,player,enemy,now=Date.now(),turn=1,intervalMs=1000){
    // En manuel : 1 s ; sous AUTO ×4 : 250 ms. Par défaut, ancien rythme.
    const tickMs=Number.isFinite(intervalMs)&&intervalMs>=50&&intervalMs<=1000?intervalMs:1000;
    const updated=normalizeEffects(effects,turn);
    const changes={siphon:{player:0,enemy:0},curse:{player:0,enemy:0}};
    for(const side of ['player','enemy']){
      const fx=updated[side],target=side==='player'?player:enemy;
      if(fx.siphon){
        if(!fx.siphon.nextTickAt)fx.siphon.nextTickAt=now+tickMs;
        else if(now>=fx.siphon.nextTickAt){
          const before=target.energy;
          target.energy=Math.max(0,target.energy-3);
          changes.siphon[side]=before-target.energy;
          fx.siphon.nextTickAt=now+tickMs;
        }
      }
      if(fx.curse && fx.curse.percent<50){
        if(!fx.curse.nextTickAt)fx.curse.nextTickAt=now+tickMs;
        else if(now>=fx.curse.nextTickAt){
          fx.curse.percent=Math.min(50,fx.curse.percent+2);
          changes.curse[side]=2;
          fx.curse.nextTickAt=fx.curse.percent>=50?0:now+tickMs;
        }
      }
    }
    return {effects:updated,changes};
  }
  function chooseEnemyAction(energy,rng=Math.random,enemy=null,turn=1,effect=emptyEffect()){
    // Les PNJ ne récupèrent jamais leur énergie. À court de ressources, défense.
    if(energy<COST.light)return 'defend';
    const choices=[{id:'light',weight:35},{id:'heavy',weight:30},{id:'special',weight:25},{id:'defend',weight:10}]
      .filter(item=>item.id==='special'?canUseSpecial(enemy,energy,turn,effect):canPay(energy,item.id));
    if(enemy?.classId==='pretresse' && energy>=COST.special && enemy.maxHp>0 && enemy.hp/enemy.maxHp<=0.55 && rng()<0.7)return 'special';
    if(canUseSpecial(enemy,energy,turn,effect)){
      if(enemy?.classId==='vampire'&&enemy.hp<enemy.maxHp*.65&&rng()<.75)return 'special';
      if(enemy?.classId==='spectre'&&!active(effect.intangible,turn)&&rng()<.70)return 'special';
      if(enemy?.classId==='nemesis'&&!active(effect.mirror,turn)&&rng()<.68)return 'special';
      if(enemy?.classId==='exorciste'&&(effect.swordCons||effect.curse||effect.siphon||effect.bloodCurse||effect.powerLoss)&&!isPurified(effect,turn)&&rng()<.85)return 'special';
    }
    const total=choices.reduce((sum,item)=>sum+item.weight,0);
    let roll=rng()*total;
    for(const item of choices){roll-=item.weight;if(roll<0)return item.id;}
    return choices.at(-1).id;
  }
  function strike(attacker,defender,action,attackerStats,defenderStats,defends,rng,powerOverride=null,forcedCrit=false,criticalMultiplier=2,incomingMultiplier=1,intangible=false){
    const info=ACTIONS[action];
    if(!info || action==='defend'||action==='idle')throw Error('Attaque invalide');
    const outcome={action,miss:false,dodged:false,critical:false,defended:!!defends,damage:0};
    // Lourde : UN seul jet de précision comparative, sans deuxième esquive.
    // Griffes fatales : 1er jet de réussite basé sur le RAPPORT de RAP, puis
    // 2e jet d'esquive ordinaire (RAP adverse / 2), comme Assassinat dans Furry.
    // Autres légères/spéciales : précision propre puis esquive ordinaire.
    // L'intangibilité du Spectre reste une immunité indépendante.
    const comparativeAccuracy=action==='heavy'?rapChance(attackerStats,defenderStats):null;
    const isGriffes=action==='special'&&attacker.classId==='griffeuse';
    if(isGriffes){
      if(rng()*100>=griffesAssassinationChance(attackerStats,defenderStats)){
        outcome.miss=true;return outcome;
      }
    }else if(comparativeAccuracy!==null){
      if(rng()*100>=comparativeAccuracy){outcome.miss=true;return outcome;}
    }else if(rng()*100>=info.accuracy){outcome.miss=true;return outcome;}
    if(intangible){outcome.dodged=true;return outcome;}
    if(comparativeAccuracy===null && rng()*100<combatChances(defenderStats).dodge){
      outcome.dodged=true;return outcome;
    }
    const power=powerOverride===null?info.power:powerOverride;
    let damage=Math.round((attackerStats.force*power)*100/(100+defenderStats.constitution));
    outcome.critical=forcedCrit || rng()*100<combatChances(attackerStats).critical;
    // Tous les coups critiques, y compris Griffes fatales, utilisent ×2.
    if(outcome.critical)damage*=criticalMultiplier;
    if(defends)damage=Math.round(damage*0.5);
    // Multiplicateur de dégâts générique, sans bonus de récupération.
    if(incomingMultiplier!==1)damage=Math.round(damage*incomingMultiplier);
    outcome.damage=Math.max(1,damage);
    defender.hp=Math.max(0,defender.hp-outcome.damage);
    return outcome;
  }
  function formatOutcome(name,target,action,res,classId=''){
    if(action==='idle')return `${name} n’agit pas : temps écoulé.`;
    if(action==='defend')return `${name} se protège (−50 % des dégâts).`;
    const skill=action==='special'?SPECIALS[classId]?.name:'';
    const verb=skill?` utilise ${skill}`:action==='heavy'?' lance une attaque lourde':' lance une attaque légère';
    if(res?.miss)return `${name}${verb}, mais rate son coup.`;
    if(res?.dodged)return `${target} esquive ${skill||'l’attaque'} !`;
    if(res?.heal!==undefined)return `${name} utilise ${skill} et récupère ${res.heal} PV.`;
    if(res?.support!==undefined)return `${name} utilise ${skill} : ${res.support}.`;
    return `${name}${verb} : ${res.damage} dégâts${res.critical?' — CRITIQUE !':''}${res.defended?' (défense)':''}.`;
  }
  function expireEffects(effects,turn){
    for(const side of ['player','enemy']){
      const effect=effects[side];
      if(effect.curse && turn>=effect.curse.expiresTurn)effect.curse=null;
      if(effect.siphon && turn>=effect.siphon.expiresTurn)effect.siphon=null;
      for(const kind of ['intangible','mirror','bloodCurse','powerGain','powerLoss','purification']){
        if(effect[kind]&&turn>=effect[kind].expiresTurn)effect[kind]=null;
      }
    }
  }
  // Deux actions sélectionnées sur le même chrono ; priorité Défense, puis Rapidité.
  // La défense protège même si l'autre combattante est plus rapide.
  function combatOrder(playerAction,enemyAction,pStats,eStats,rng=Math.random){
    if(playerAction==='defend' && enemyAction!=='defend')return ['player','enemy'];
    if(enemyAction==='defend' && playerAction!=='defend')return ['enemy','player'];
    if(pStats.rapidite>eStats.rapidite)return ['player','enemy'];
    if(eStats.rapidite>pStats.rapidite)return ['enemy','player'];
    return rng()<0.5?['player','enemy']:['enemy','player'];
  }
  function resolveTurn(player,enemy,playerAction,bonuses={},rng=Math.random,context={}){
    const turn=Number.isSafeInteger(context.turn)&&context.turn>0?context.turn:1;
    const effects=normalizeEffects(context.effects,turn);
    const trapPenalties=context.trapPenalties||{};
    if(playerAction==='special'?!canUseSpecial(player,player.energy,turn,effects.player):
      !canPay(player.energy,playerAction))
      throw Error('Énergie insuffisante ou action non disponible');
    if(player.hp<=0||enemy.hp<=0)throw Error('Combat terminé');
    const requested=context.enemyAction;
    const ai=(requested && (requested==='defend' || (requested==='special'
      ?canUseSpecial(enemy,enemy.energy,turn,effects.enemy):canPay(enemy.energy,requested))))
      ?requested:chooseEnemyAction(enemy.energy,rng,enemy,turn,effects.enemy);
    const p={...player},e={...enemy};
    const playerDefends=playerAction==='defend',enemyDefends=ai==='defend';
    const details={player:null,enemy:null},reports={player:[],enemy:[]};
    const pStats=combatStats(p,bonuses,penaltyFor(effects.player,turn),trapPenalties);
    const eStats=combatStats(e,{},penaltyFor(effects.enemy,turn),{});
    const order=combatOrder(playerAction,ai,pStats,eStats,rng);
    // Les deux actions sont choisies simultanément : les protections qui prennent
    // effet « ce tour » sont prêtes même si leur lanceuse est plus lente.
    function clearMaluses(effect){
      const had=!!(effect.swordCons||effect.curse||effect.siphon||effect.bloodCurse||effect.powerLoss);
      effect.swordCons=false;effect.curse=null;effect.siphon=null;effect.bloodCurse=null;
      effect.powerLoss=null;
      return had;
    }
    function precast(attacker,defender,action,own,target,owner){
      if(action!=='special')return;
      if(attacker.classId==='spectre'){
        own.intangible={startTurn:turn,expiresTurn:turn+1};
        own.spectreReadyTurn=turn+3;
      }else if(attacker.classId==='nemesis'){
        own.mirror={startTurn:turn,expiresTurn:turn+4};
      }else if(attacker.classId==='exorciste'){
        if(own.powerLoss)target.powerGain=null; // le lien du vol de Force est rompu
        clearMaluses(own);
        own.purification={startTurn:turn,expiresTurn:turn+4};
      }
    }
    // Les protections de Némésis et de l'Exorciste sont prêtes dès le tour
    // d'incantation, indépendamment de la RAP et de l'ordre d'initiative.
    // En V15.4, la Maudite applique son malus APRES avoir touché, et
    // uniquement pour les trois tours SUIVANTS.
    for(const side of ['player','enemy']){
      const actor=side==='player'?p:e;
      const action=side==='player'?playerAction:ai;
      precast(actor,side==='player'?e:p,action,effects[side],effects[side==='player'?'enemy':'player'],side);
    }
    function act(attacker,defender,action,owner,target,attackerEffect,targetEffect,defends,name,targetName){
      const report=reports[owner];
      if(action==='defend'||action==='idle'){
        report.push(formatOutcome(name,targetName,action,null));return null;
      }
      const aStats=combatStats(attacker,owner==='player'?bonuses:{},penaltyFor(attackerEffect,turn),owner==='player'?trapPenalties:{});
      const dStats=combatStats(defender,target==='player'?bonuses:{},penaltyFor(targetEffect,turn),target==='player'?trapPenalties:{});
      if(action==='special' && attacker.classId==='pretresse'){
        const heal=Math.min(attacker.maxHp-attacker.hp,Math.round(attacker.maxHp*0.4));
        attacker.hp+=heal;
        const result={heal};report.push(formatOutcome(name,targetName,action,result,attacker.classId));return result;
      }
      if(action==='special' && ['nemesis','exorciste'].includes(attacker.classId)){
        const message=attacker.classId==='nemesis'
          ?'renvoi de 40 % des dégâts reçus pendant 5 tours (activation comprise)'
          :'malus dissipés et protection pendant 5 tours (activation comprise)';
        const result={support:message};report.push(formatOutcome(name,targetName,action,result,attacker.classId));return result;
      }
      let power=null,forcedCrit=false;
      if(action==='special'){
        power={epeiste:2.0,bagarreuse:0.5,archere_arcanique:1.7,occultiste:1.0,griffeuse:1.5,vampire:1.5,spectre:1.3,maudite:0.5,envouteuse:1.0}[attacker.classId];
        forcedCrit=attacker.classId==='griffeuse';
      }
      const result=strike(attacker,defender,action,aStats,dStats,defends,rng,power,forcedCrit,2,
        1,
        active(targetEffect.intangible,turn));
      report.push(formatOutcome(name,targetName,action,result,attacker.classId));
      if(action==='special'&&attacker.classId==='vampire'&&result.damage>0){
        const healed=Math.min(attacker.maxHp-attacker.hp,Math.round(result.damage*.35));
        attacker.hp+=healed;
        if(healed)report.push(`${name} récupère ${healed} PV grâce à Vampirisation.`);
      }
      if(result.damage>0&&active(targetEffect.mirror,turn)){
        const reflected=Math.max(1,Math.round(result.damage*.40));
        attacker.hp=Math.max(0,attacker.hp-reflected);
        report.push(`🪞 Miroir magique : ${reflected} dégâts renvoyés à ${name}.`);
      }
      if(isOffensiveAction(attacker,action)&&active(attackerEffect.bloodCurse,turn)){
        const penalty=Math.max(1,Math.round(attacker.maxHp*.10));
        attacker.hp=Math.max(0,attacker.hp-penalty);
        report.push(`🩸 Malédiction du sang : ${name} perd ${penalty} PV en attaquant.`);
      }
      // Malédiction du sang est indépendante du coup physique : une esquive,
      // un MISS ou l’intangibilité annule les dégâts ×0,5, pas le malus.
      // Les autres compétences restent conditionnées à un coup réussi.
      if(action==='special' && (attacker.classId==='maudite' || (!result.miss && !result.dodged))){
        switch(attacker.classId){
          case 'maudite':{
            if(isPurified(targetEffect,turn)){report.push('Malédiction du sang bloquée par Purification.');break;}
            // Tour de lancement exclu : seuls T+1, T+2, T+3 sont concernés.
            targetEffect.bloodCurse={startTurn:turn+1,expiresTurn:turn+3};
            report.push('Malédiction du sang appliquée : −10 % PV max par attaque offensive durant les 3 prochains tours.');
            break;
          }
          case 'envouteuse':{
            if(isPurified(targetEffect,turn)){report.push('Vol de puissance bloqué par Purification.');break;}
            // Transfert de 20 % de la Force effective, sans empilement ; la Force
            // disponible est calculée sans le transfert temporaire précédent.
            const unaffected=combatStats(defender,target==='player'?bonuses:{},
              {...penaltyFor(targetEffect,turn),forceFlat:0},target==='player'?trapPenalties:{});
            const amount=Math.max(0,Math.round(unaffected.force*0.20));
            attackerEffect.powerGain={startTurn:turn+1,expiresTurn:turn+3,amount};
            targetEffect.powerLoss={startTurn:turn+1,expiresTurn:turn+3,amount};
            report.push(`${amount} FOR transférée(s) (20 % de la Force adverse) : actif pendant les 3 prochains tours, sans cumul.`);
            break;
          }
          case 'archere_arcanique':if(!isPurified(targetEffect,turn)){targetEffect.swordCons=true;report.push('Constitution adverse −15 % jusqu’à la fin du combat.');}else report.push('Malus bloqué par Purification.');break;
          case 'bagarreuse':if(!isPurified(targetEffect,turn)){targetEffect.siphon={expiresTurn:turn+3,nextTickAt:0};report.push('Absorption active pendant 4 tours : −3 EN/s.');}else report.push('Absorption bloquée par Purification.');break;
          case 'occultiste':{
            if(isPurified(targetEffect,turn)){report.push('Malédiction bloquée par Purification.');break;}
            const existing=targetEffect.curse;
            targetEffect.curse=existing && existing.expiresTurn>=turn
              ?{...existing,expiresTurn:turn+4}
              :{expiresTurn:turn+4,percent:0,nextTickAt:0};
            report.push(existing?'Malédiction renouvelée (5 tours, sans cumul).':'Malédiction active : −2 %/s aux 3 stats, jusqu’à −50 %.');
            break;
          }
          default:break;
        }
      }
      return result;
    }
    for(const side of order){
      if(p.hp<=0||e.hp<=0){
        reports[side].push(side==='player'?'Ta waifu est KO avant de pouvoir agir.':'L’adversaire est KO avant de pouvoir agir.');
        continue;
      }
      const action=side==='player'?playerAction:ai;
      const attacker=side==='player'?p:e;
      const defender=side==='player'?e:p;
      attacker.energy-=COST[action];
      details[side]=act(attacker,defender,action,side,side==='player'?'enemy':'player',
        effects[side],effects[side==='player'?'enemy':'player'],side==='player'?enemyDefends:playerDefends,
        side==='player'?'Ta waifu':'L’adversaire',side==='player'?'L’adversaire':'Ta waifu');
    }
    // Retour de la règle historique : un duel sans énergie des deux côtés
    // doit pouvoir se terminer, y compris en mode AUTO et dans la tour.
    if(p.energy<COST.light && e.energy<COST.light && p.hp>0 && e.hp>0){
      const fatigue=15;
      p.hp=Math.max(0,p.hp-fatigue);
      e.hp=Math.max(0,e.hp-fatigue);
      details.exhaustion={player:fatigue,enemy:fatigue};
      reports.player.push(`Épuisement : les deux combattantes perdent ${fatigue} PV.`);
    }
    if(p.hp===0)reports.player.push('Ta waifu est KO !');
    if(e.hp===0)reports.enemy.push('L’adversaire est KO !');
    const result=p.hp===0?'lost':e.hp===0?'won':'fighting';
    expireEffects(effects,turn);
    // Conserver la présentation « joueur / ennemi », même si l'ennemi a agi avant.
    const summary=[reports.player.join(' '),reports.enemy.join(' ')].filter(Boolean).join('\n');
    return {player:p,enemy:e,effects,aiAction:ai,playerAction,details,summary,result,order};
  }

  window.TDWCombat=Object.freeze({COST,ACTIONS,SPECIALS,RECOVERY_COOLDOWN_TURNS,recoveryTurnsRemaining,canRecover,combatStats,combatChances,rapChance,griffesAssassinationChance,emptyEffect,normalizeEffects,
    penaltyFor,canPay,canUseSpecial,combatOrder,timedTickDue,tickTimedEffects,chooseEnemyAction,strike,resolveTurn});
})();
