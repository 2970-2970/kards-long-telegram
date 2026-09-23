
(()=>{'use strict';
const E=window.LongTelegram,I=window.LongTelegramI18n,$=id=>document.getElementById(id),T=I.t;
const types={infantry:'步兵',tank:'坦克',artillery:'火炮',fighter:'战斗机',bomber:'轰炸机',order:'指令'};
function create(onChange){
 let plan={...E.presetDeck('usa'),counts:{}},filter='',query='',costFilter='',rarityFilter='';
 try{const saved=E.migrateDeck(JSON.parse(localStorage.getItem('long-telegram.deck')));if(saved)plan={...saved,counts:{}};}catch(_){}
 const count=()=>Object.values(plan.counts).reduce((a,b)=>a+b,0);
 function save(){try{localStorage.setItem('long-telegram.deck',JSON.stringify(plan))}catch(_){}onChange?.(get());}
 function get(){return JSON.parse(JSON.stringify(plan))}
 function changeNation(main,ally){if(main===plan.main&&ally===plan.ally)return;plan={...E.presetDeck(main,ally),counts:{}};filter='';query='';costFilter='';rarityFilter='';$('deckSearch').value='';save();render();}
 function adjust(id,delta){
  const n=plan.counts[id]||0,c=E.catalog(plan.main,plan.ally).find(c=>c.deckId===id);if(delta>0&&(n>=E.copyLimit(c)||count()>=E.NORMAL_DECK_SIZE)||delta<0&&n===0)return;
  const next={...plan,counts:{...plan.counts,[id]:n+delta}};if(E.deckIssue(next,false))return;
  if(!next.counts[id])delete next.counts[id];plan=next;save();renderCards();
 }
 function chooseButton(id,label,pressed,fn,showEmblem=false){const b=document.createElement('button');b.type='button';b.textContent=label;if(showEmblem&&id==='usa'){b.textContent=label.replace('★ ','');const img=document.createElement('img');img.src='./assets/emblems/usa_emblem.svg';img.alt='';img.className='nation-choice-emblem';b.prepend(img);}b.dataset.choice=id;if(E.FACTIONS[id])b.dataset.faction=id;b.setAttribute('aria-pressed',String(pressed));b.onclick=fn;return b;}
 function render(){
  $('mainChoices').replaceChildren(...E.MAIN_NATIONS.map(id=>chooseButton(id,E.FACTIONS[id].emblem+' '+T(E.FACTIONS[id].name),plan.main===id,()=>changeNation(id,plan.ally===id?null:plan.ally),true)));
  $('allyChoices').replaceChildren(...[null,'france','drv',E.FACTIONS[plan.main].opponent].map(id=>chooseButton(id||'none',id?T(E.FACTIONS[id].name):T('deck.none'),plan.ally===id,()=>changeNation(plan.main,id))));
  $('hqChoices').replaceChildren(...E.headquartersFor(plan.main).map(hq=>{
   const button=document.createElement('button');button.type='button';button.className='hq-choice';
   button.dataset.hq=hq.id;button.setAttribute('aria-pressed',String(plan.hqId===hq.id));
   button.setAttribute('aria-label',T('hqName',{city:T(hq.city)})+' · '+hq.hp+' '+T('生命'));
   window.LongTelegramHQ.mount(button,hq);
   button.onclick=()=>{plan.hqId=hq.id;save();render();$('hqChoices').querySelector('[data-hq="'+hq.id+'"]').focus();};
   return button;
  }));
  const select=$('deckNationFilter');select.replaceChildren();
  for(const id of ['',plan.main,...(plan.ally?[plan.ally]:[])]){const o=document.createElement('option');o.value=id;o.textContent=id?T(E.FACTIONS[id].name):T('deck.all');select.appendChild(o);}
  select.value=filter;
  for(const [id,value,options] of [['deckCostFilter',costFilter,[['',T('deck.allCosts')],...['0','1','2','3','4','5','6+'].map(k=>[k,k==='6+'?'6 K+':k+' K'])]],['deckRarityFilter',rarityFilter,[['',T('deck.allRarities')],...Object.keys(E.RARITIES).map(r=>[r,T(r)])]]]){
   const field=$(id);field.replaceChildren(...options.map(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;return option;}));field.value=value;
  }
  $('deckSearch').placeholder=T('deck.search');renderCards();
 }
 function row(c,compact){
  const el=document.createElement('div');el.className='builder-card';el.dataset.faction=c.faction;el.dataset.deckId=c.deckId;
  const info=document.createElement('div'),title=document.createElement('strong');title.textContent=I.name(c);info.appendChild(title);
  const meta=document.createElement('div');meta.className='builder-meta';meta.textContent=c.c+' K · '+T(E.FACTIONS[c.faction].name)+' · '+T(types[c.t])+(c.t!=='order'?' · '+c.a+'/'+c.h+' · '+T('行动')+' '+c.o+' K':'');info.appendChild(meta);
  {const rarity=document.createElement('div');rarity.className='builder-meta';rarity.textContent=T('deck.copyCap',{rarity:T(c.rarity),n:E.copyLimit(c)});info.appendChild(rarity);}
  if(!compact){
   const kw=I.keywordLabels(c);if(kw.length){const tag=document.createElement('div');tag.className='builder-keywords';tag.textContent=kw.join(' · ');info.appendChild(tag);}
   const text=I.skillText(c);if(text){const skill=document.createElement('div');skill.className='builder-skill';skill.textContent=text;info.appendChild(skill);}
  }
  const controls=document.createElement('div');controls.className='builder-controls';const n=plan.counts[c.deckId]||0;
  for(const delta of compact?[-1,0,1]:[0,1]){
   if(!delta){const value=document.createElement('span');value.className='builder-count';value.dataset.countKind=compact?'selected':'remaining';value.textContent=compact?n:E.copyLimit(c)-n;value.setAttribute('aria-label',T(compact?'deck.selectedCount':'deck.remainingCount',{n:Number(value.textContent)}));value.title=value.getAttribute('aria-label');controls.appendChild(value);continue;}
   const b=document.createElement('button');b.type='button';b.textContent=delta<0?'−':'+';b.dataset.cardAdjust=c.deckId+':'+delta+':'+compact;
   b.setAttribute('aria-label',T(delta>0?'deck.add':'deck.remove',{name:I.name(c)}));b.disabled=delta<0?!n:n>=E.copyLimit(c)||count()>=E.NORMAL_DECK_SIZE||!!E.deckIssue({...plan,counts:{...plan.counts,[c.deckId]:n+1}},false);
   b.onclick=()=>{const key=b.dataset.cardAdjust;adjust(c.deckId,delta);const replacement=[...document.querySelectorAll('[data-card-adjust]')].find(x=>x.dataset.cardAdjust===key);if(replacement&&!replacement.disabled)replacement.focus();else $('deckSearch').focus();};controls.appendChild(b);
  }
  el.append(info,controls);window.LongTelegramCardFace.bindPreview(el,c);return el;
 }
 function renderCards(){
  window.LongTelegramCardFace.hidePreview();
  const pool=E.catalog(plan.main,plan.ally),visible=pool.filter(c=>(!filter||c.faction===filter)&&(!costFilter||(costFilter==='6+'?c.c>=6:c.c===Number(costFilter)))&&(!rarityFilter||c.rarity===rarityFilter)&&(!query||[c.n,c.zh,I.name(c),I.skillText(c),I.keywordLabels(c).join(' ')].join(' ').toLowerCase().includes(query)));
  $('cardCatalog').replaceChildren(...visible.map(c=>row(c,false)));$('chosenDeck').replaceChildren(...pool.filter(c=>plan.counts[c.deckId]).sort((a,b)=>a.c-b.c).map(c=>row(c,true)));
  for(const [id,key] of [['cardCatalog','deck.noResults'],['chosenDeck','deck.empty']])if(!$(id).children.length){const empty=document.createElement('p');empty.className='deck-empty';empty.textContent=T(key);$(id).appendChild(empty);}
  const total=count(),primary=pool.filter(c=>c.faction===plan.main).reduce((n,c)=>n+(plan.counts[c.deckId]||0),0),issue=E.deckIssue(plan);
  $('deckTotal').textContent=(total+1)+' / '+E.DECK_SIZE;$('deckNationCount').textContent=T('deck.mainCount',{main:primary,ally:total-primary});$('deckIssue').textContent=T(issue||'deck.ready');$('startMatchBtn').disabled=!!issue;
 }
 $('deckSearch').oninput=e=>{query=e.target.value.trim().toLowerCase();renderCards()};$('deckNationFilter').onchange=e=>{filter=e.target.value;renderCards()};
 $('deckCostFilter').onchange=e=>{costFilter=e.target.value;renderCards()};$('deckRarityFilter').onchange=e=>{rarityFilter=e.target.value;renderCards()};
 $('presetDeckBtn').onclick=()=>{plan=E.presetDeck(plan.main,plan.ally);save();render()};$('clearDeckBtn').onclick=()=>{plan.counts={};save();render()};
 return {get,render};
}
window.LongTelegramDeckBuilder={create};
})();
