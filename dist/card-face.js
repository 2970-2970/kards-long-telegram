


(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramCardFace=api;})(typeof globalThis!=='undefined'?globalThis:this,root=>{
'use strict';
const sizes={width:720,height:1040,header:128,artWidth:720,artHeight:656,body:256,orderArtHeight:720,orderBody:320,icon:128,medal:128};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const types={infantry:'步兵',tank:'坦克',artillery:'火炮',fighter:'战斗机',bomber:'轰炸机',order:'指令'};
const engine=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.LongTelegram;
function liveStats(c,options={}){
 return {...options,defense:c.h,damaged:c.h<(c.max??c.h),defenseBuff:c.h>(c.baseH??c.h),attackBuff:(options.attack??c.a)>(c.baseA??c.a)};
}
function defaultForm(c){
 const pool=Object.values(engine.FACTIONS).flatMap(f=>engine.LIB[f.library]);
 const template=pool.find(t=>c.deckId?t.deckId===c.deckId:c.key&&t.key===c.key)||Object.values(engine.GENERATED_CARDS).find(t=>t.deckId===c.deckId)||c.printed||c;
 const form=c.veteran?(template.veteranForm||c.veteranForm):null;
 return {...template,...form,kw:[...(form?.kw||template.kw||[])],...(c.veteran?{veteran:true}:{})};
}
function previewForms(c,{defaults=false,state=null}={}){
 if(defaults){
  const current=defaultForm(c);
  let forms;
  if(c.veteran){
   const base=c.veteranBase||{...current,veteran:false};
   forms=[defaultForm(base),current];
  }else forms=previewForms(current);
  const gained=engine.effectiveKeywords(c,state).filter(k=>!current.kw.includes(k)),armor=engine.armorValue(c,state);
  if(gained.length||armor>(current.armor||0))forms.push({...current,kw:[...new Set([...current.kw,...gained])],armor:Math.max(current.armor||0,armor),addedKeywords:true});
  return forms;
 }
 if(c.veteran&&c.veteranBase)return [c.veteranBase,c];
 if(!c.veteranForm)return [c];
 const form=c.veteranForm;
 return [c,{...(c.printed||c),...form,c:c.c,o:c.o,kw:[...form.kw],veteran:true}];
}
function relatedCards(c){
 const template=defaultForm(c),refs=[...(template.relatedCards||[]),...(c.relatedCards||[]),template.veteranReward,c.veteranReward].filter(Boolean);
 const seen=new Set();
 const pool=[...Object.values(engine.GENERATED_CARDS),...Object.values(engine.FACTIONS).flatMap(f=>engine.LIB[f.library])];
 return refs.map(ref=>engine.GENERATED_CARDS[ref]||pool.find(t=>t.deckId===ref)).filter(card=>{
  if(!card||seen.has(card.deckId))return false;seen.add(card.deckId);return true;
 });
}
function mountPreview(host,c,{defaults=false,liveOptions={},state=null}={}){
 const forms=previewForms(c,{defaults,state}),cards=[...forms,...relatedCards(c)];
 host.classList.toggle('two-forms',cards.length===2);host.classList.toggle('multi-cards',cards.length>1);
 host.style.setProperty('--preview-count',cards.length);
 const faces=cards.map((card,i)=>'<div class="tip-card-face '+(i>=forms.length?'tip-related-face':card.addedKeywords?'tip-enhanced-face':i===0?'tip-base-face':'tip-veteran-face')+'"></div>').join('');
 host.innerHTML=cards.length>1?'<div class="tip-card-pair">'+faces+'</div>':faces;
 host.querySelectorAll('.tip-card-face').forEach((node,i)=>{
  const live=!defaults&&cards[i]===c;
  node.classList.toggle('tip-live-face',live);
  mount(node,cards[i],live?liveStats(c,liveOptions):{});
 });
 return cards;
}
function hasTriggeredAbility(c){
 if(c.suppressed||c.t==='order'||c.t==='hq')return false;
 return !!(c.enemyAirOperationDamage||c.combatDiscardOrder||c.killArmorLoss||c.fighterDeployCopy||c.afterShockSmoke||c.combatOperationDiscount||c.friendlyTankFight||c.retreatGrowth||c.bomberAttack||c.killDraw||c.tankArmor||c.firstFrontDraw||c.firstFrontAttack||c.splash||!c.veteran&&c.veteranForm);
}
const statusIcons={
 triggered:'<path fill-rule="evenodd" d="m10 1 4 0 .5 3 2 .8 2.5-1.5 2.8 2.8-1.5 2.5.8 2 3 .5v4l-3 .5-.8 2 1.5 2.5-2.8 2.8-2.5-1.5-2 .8-.5 3h-4l-.5-3-2-.8-2.5 1.5-2.8-2.8L4 16.6l-.8-2-3-.5v-4l3-.5.8-2L2.5 5 5.3 2.2 7.8 3.7l2-.8Zm2 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>',
 guard:'<path d="M4 2h16v10c0 5-8 10-8 10S4 17 4 12Z"/>',
 protected:'<path d="M4 2h16v10c0 5-8 10-8 10S4 17 4 12Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 2H4v10c0 5 8 10 8 10Z"/>',
 pinned:'<path d="M8 2h8v10h6L12 22 2 12h6Z"/>',
 suppressed:'<path d="m5 2 7 7 7-7 3 3-7 7 7 7-3 3-7-7-7 7-3-3 7-7-7-7Z"/>',
 destruction:'<path d="M4 9a8 8 0 0 1 16 0v6l-4 2v5H8v-5l-4-2Z"/><path d="M7 9h3v4H7zm7 0h3v4h-3zm-3 6h2v3h-2z" fill="#252523"/>',
 blitz:'<path d="M13 1 3 14h7l-1 9L22 9h-8l3-8Z"/>',
 smokescreen:'<path d="M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12Z"/>',
 ambush:'<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="3"/><path d="M11 0h2v8h-2zm0 16h2v8h-2zM0 11h8v2H0zm16 0h8v2h-8z"/>',
 heavyArmor:'<path d="M3 1h18v12c0 5-9 10-9 10S3 18 3 13Z"/>',
 veteran:'<path d="m12 1 3 7 8 1-6 5 2 9-7-4-7 4 2-9-6-5 8-1Z"/>',
 shock:'<path d="m12 3 2.5 5 5-2-2 5 3.5 3-5.5 1-.5 5-4-4-5 3 1-5L3 10l6-1Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>',
 fury:'<path d="M13 1 3 14h7l-1 9L22 9h-8l3-8Z"/>',
 intercepted:'<path d="M10 1h4v8l9 5v3l-9-2v5l3 2H7l3-2v-5l-9 2v-3l9-5Z"/>'
};
function statusMarkup(c,{state=null,protectedByGuard=false,intercepted=false}={}){
 const active=engine.effectiveKeywords(c,state),keys=[...new Set([...active,...(c.spentKeywords||[]),...(c.suppressedIcons||[]),...(c.destruction?['destruction']:[]),...(c.shockUsed?['shock']:[]),...(c.smokescreenUsed?['smokescreen']:[]),...(c.suppressed?['suppressed']:[]),...(c.pinned?['pinned']:[]),...(protectedByGuard?['protected']:[]),...(intercepted?['intercepted']:[]),...(hasTriggeredAbility(c)?['triggered']:[])])];
 const labels={triggered:'Triggered ability',guard:'Guard',blitz:'Blitz',smokescreen:'Smokescreen',ambush:'Ambush',heavyArmor:'Heavy Armor',veteran:'Veteran',shock:'Shock',fury:'Fury',destruction:'Destruction',pinned:'Pinned.',suppressed:'Suppressed.',protected:'Guard protection',intercepted:'Fighter interception'};
 return keys.filter(k=>statusIcons[k]&&k!=='intercepted').map(k=>{
  const spent=k==='ambush'?c.ambushUsed||!active.includes(k):k==='blitz'?(!c.sleeping&&(c.moved||c.attacked||c.turnsOnBoard>0))||!active.includes(k):k==='fury'?c.attacks>=2||!active.includes(k):['pinned','suppressed','protected','intercepted','triggered'].includes(k)?false:k==='destruction'?!c.destruction:!active.includes(k);
  const title=(root.LongTelegramI18n?.t(labels[k])||labels[k])+(k==='heavyArmor'?' '+(engine.armorValue(c,state)||c.printed?.armor||1):'');
  return '<span class="unit-status-icon status-'+k+(spent?' status-spent':'')+'" data-status="'+k+'" title="'+esc(title)+'" aria-label="'+esc(title)+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+statusIcons[k]+(k==='heavyArmor'?'<text x="12" y="16" text-anchor="middle">'+(engine.armorValue(c,state)||c.printed?.armor||1)+'</text>':'')+'</svg></span>';
 }).join('');
}
function markup(c,options={}){
 const I=options.i18n||root.LongTelegramI18n,unit=c.t!=='order',attack=options.attack??c.a,defense=options.defense??c.h,operation=options.operation??c.o;
 const boardUnit=unit&&options.compact;
 const words=boardUnit?'':I.keywordLabels(c).join(' · '),skill=boardUnit?'':I.skillText(c);
 const traits=words?'<span class="face-keywords">'+esc(words)+'</span>':'';
 const title='<div class="face-title" title="'+esc(I.name(c))+'">'+esc(I.name(c))+'</div>';
 const badge='<span class="face-type-badge" data-type-icon="'+esc(c.t)+'" aria-label="'+esc(I.t(types[c.t]))+'">'+(unit?'':'!')+'</span>';
 const ranged=['artillery','fighter','bomber'].includes(c.t);
 const textWeight=skill.replace(/[^\x00-\x7F]/g,'xx').length;
 const skillSize=textWeight>230?'3.15cqw':textWeight>150?'3.7cqw':'';
 const rarity=!boardUnit&&!c.generated?'<img class="face-rarity" data-rarity="'+esc(c.rarity||'standard')+'" src="./assets/emblems/rarity-'+esc(c.rarity||'standard')+'.svg" alt="'+esc(I.t(c.rarity||'standard'))+'" title="'+esc(I.t(c.rarity||'standard'))+'">':'';
 return '<div class="card-face'+(boardUnit?' compact-face':'')+(unit?'':' order-face')+'" data-faction="'+esc(c.faction)+'">'+
 '<div class="face-top">'+(boardUnit?'<div class="face-cost" aria-label="'+esc(I.t('行动')+' '+operation+' K')+'"><b class="face-operation">'+operation+'</b></div>':'<div class="face-cost" aria-label="'+esc(I.t('部署')+' '+c.c+' K'+(unit?' · '+I.t('行动')+' '+operation+' K':''))+'"><b class="face-deploy">'+c.c+'</b><div class="face-cost-side"><span>K</span>'+(unit?'<small class="face-operation">'+operation+'</small>':'')+'</div></div>'+(unit?title:''))+'</div>'+
 '<div class="face-medal" aria-hidden="true"></div>'+
 '<div class="face-art"><span class="face-placeholder">'+esc(I.t(types[c.t]))+'</span></div>'+
 (unit?'<div class="face-stats"><span class="face-attack'+(ranged?' ranged-attack':'')+(options.attackBuff?' stat-buffed':'')+'" aria-label="'+esc(I.t('攻击'))+'"><b>'+attack+'</b></span>'+badge+'<span class="face-defense'+(options.damaged?' stat-damaged':options.defenseBuff?' stat-buffed':'')+'" aria-label="'+esc(I.t('防御'))+'"><b>'+defense+'</b></span></div>':badge)+
 (boardUnit?'':'<div class="face-body">'+(unit?'':title)+(traits?'<div class="face-traits">'+traits+'</div>':'')+(skill?'<div class="face-skill"'+(skillSize?' style="--skill-size:'+skillSize+'"':'')+'>'+esc(skill)+'</div>':'')+'</div>')+rarity+'</div>';
}
function mount(host,c,options={}){
 host.innerHTML=markup(c,options);const media=root.LongTelegramMedia,icons=root.LongTelegramEmblems||{};
 media.mountArt(host.querySelector('.face-art'),c,root.LongTelegramI18n.t(types[c.t]));
 media.mountArt(host.querySelector('.face-type-badge'),{art:icons.types?.[c.t]},c.t==='order'?'!':'');
 const faction=root.LongTelegram?.FACTIONS[c.faction];
 media.mountArt(host.querySelector('.face-medal'),{art:icons.nations?.[c.faction]},faction?.emblem||'');
 return host;
}
let preview,active=null;
function hidePreview(){active=null;if(preview)preview.hidden=true;}
function previewFor(card,anchor){
 if(!anchor.isConnected)return;
 if(!preview){preview=root.document.createElement('div');preview.id='deckCardPreview';preview.className='deck-card-preview';preview.setAttribute('role','tooltip');root.document.body.appendChild(preview);}
 if(active!==card){
  mountPreview(preview,card,{defaults:true});
  active=card;
 }
 preview.hidden=false;const r=anchor.getBoundingClientRect(),width=preview.offsetWidth,height=preview.offsetHeight,pad=12;
 let x=r.right+12;if(x+width>root.innerWidth-pad)x=r.left-width-12;
 const y=Math.max(pad,Math.min(root.innerHeight-height-pad,r.top+r.height/2-height/2));
 preview.style.left=Math.max(pad,Math.min(root.innerWidth-width-pad,x))+'px';preview.style.top=y+'px';
}
function bindPreview(element,card){
 element.tabIndex=0;element.setAttribute('aria-describedby','deckCardPreview');
 element.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')previewFor(card,element)});
 element.addEventListener('pointerleave',hidePreview);
 element.addEventListener('focusin',()=>previewFor(card,element));
 element.addEventListener('focusout',e=>{if(!element.contains(e.relatedTarget))hidePreview()});
 element.addEventListener('click',e=>{if(!e.target.closest('button'))previewFor(card,element)});
}
if(root.document){root.document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePreview()});root.document.addEventListener('scroll',hidePreview,true);root.addEventListener('resize',hidePreview);root.document.addEventListener('pointerdown',e=>{if(!e.target.closest('.builder-card'))hidePreview()});}
return {sizes,liveStats,defaultForm,previewForms,relatedCards,mountPreview,hasTriggeredAbility,statusMarkup,markup,mount,bindPreview,hidePreview};
});
