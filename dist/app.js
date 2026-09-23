(()=>{'use strict';
const E=window.LongTelegram;
const P=window.LongTelegramPlacement;
const Media=window.LongTelegramMedia,Effects=window.LongTelegramEffects,Face=window.LongTelegramCardFace;
let actionPlayer,effects;
const I=window.LongTelegramI18n,T=I.t,N=I.name;
try{I.setLanguage(localStorage.getItem('long-telegram.language')||'zh')}catch(_){I.setLanguage('zh')}
const localizedFaction=id=>({...E.FACTIONS[id],name:T(E.FACTIONS[id].name),city:T(E.FACTIONS[id].city),hq:T(E.FACTIONS[id].city)});
if(!E)throw new Error('LongTelegram engine missing');
const $=id=>document.getElementById(id);
const ICON={infantry:'♟',tank:'▰',artillery:'⬢',fighter:'✈',bomber:'⌁',order:'◉'};
const TYPE={infantry:'步兵',tank:'坦克',artillery:'火炮',fighter:'战斗机',bomber:'轰炸机',order:'指令',hq:'总部'};
let S,selectedUnit=null,selectedCard=null,aiTimer=null,pdrag=null,suppressClickUntil=0,tooltipPinned=false,longPressTimer=null;
let chosenFaction='usa',choosingFaction=true,hasMatch=false,inspection=null,lastPointer=null,returnFocus=null;
let placement=null,historyOpen=false,historyStep=null,historyReturnFocus=null;
let pendingPlay=null,pendingBoost=null;
let settingsOpen=false,settingsReturnFocus=null,settingsInert=[];
let deckBuilder,activeDeckPlan=null;
let openingActive=false,openingBusy=false,openingSelection=new Set();
const nation=side=>({...localizedFaction(S[side].faction),city:T(E.headquarters(S[side]).city),hq:T(E.headquarters(S[side]).city)});

async function start(){
  if(actionPlayer?.busy||openingBusy)return;
  clearTimeout(aiTimer);clearTimeout(longPressTimer);cleanDrag();
  const plan=choosingFaction?deckBuilder.get():(activeDeckPlan||deckBuilder.get());
  const issue=E.deckIssue(plan);if(issue){notify(issue);return;}
  activeDeckPlan=JSON.parse(JSON.stringify(plan));chosenFaction=plan.main;
  const enemyPlan=E.opponentDeck(plan);
  S=E.createGame(Math.random,plan.main,plan,enemyPlan,{mulligan:true});selectedUnit=null;selectedCard=null;
  openingActive=true;openingBusy=true;openingSelection=new Set();
  pendingPlay=null;pendingBoost=null;$('boostOverlay').classList.add('hidden');
  historyStep=null;historyOpen=false;$('historyOverlay').classList.add('hidden');
  Face.hidePreview();choosingFaction=false;hasMatch=true;
  Media.startRadio(plan.main,plan.ally,{restart:true});
  $('factionOverlay').classList.add('hidden');$('game').inert=false;
  $('resultOverlay').classList.add('hidden');$('resultOverlay').inert=false;hideInfo(true);render();renderOpening();
  const events=['p','e'].flatMap(side=>S[side].hand.map(c=>({kind:'draw',side,id:c.id})));
  try{await effects.drawCards(events,S,openingDestination);}finally{effects.cleanup();openingBusy=false;renderOpening();$('confirmOpeningBtn').focus();}
}
function openingDestination(side,id){return document.querySelector(side==='p'?'[data-opening-id="'+id+'"]':'#enemyHand [data-hand-id="'+id+'"]');}
function renderOpening(){
  $('openingOverlay').classList.toggle('hidden',!openingActive);$('hand').classList.toggle('opening-hand',openingActive);
  if(!openingActive)return;
  $('game').inert=true;const host=$('openingCards');host.replaceChildren();
  host.parentElement.setAttribute('aria-busy',String(openingBusy));
  for(const c of S.p.hand){
    const b=document.createElement('button');b.type='button';b.className='opening-choice';b.dataset.openingId=c.id;b.disabled=openingBusy;
    const face=document.createElement('div');face.className='opening-face';Face.mount(face,c);b.appendChild(face);
    const status=document.createElement('span');status.className='opening-status';b.appendChild(status);
    const update=()=>{const selected=openingSelection.has(c.id);b.setAttribute('aria-pressed',String(selected));status.textContent=T(selected?'opening.replace':'opening.keep');b.setAttribute('aria-label',N(c)+' · '+status.textContent);};update();
    b.onclick=()=>{if(openingBusy)return;openingSelection.has(c.id)?openingSelection.delete(c.id):openingSelection.add(c.id);update();updateOpeningButton();};
    Face.bindPreview(b,c);host.appendChild(b);
  }
  updateOpeningButton();
}
function updateOpeningButton(){
  $('confirmOpeningBtn').disabled=openingBusy;
  $('confirmOpeningBtn').textContent=openingBusy?T('opening.dealing'):openingSelection.size?T('opening.confirm',{n:openingSelection.size}):T('opening.keepAll');
}
async function confirmOpening(){
  if(!openingActive||openingBusy||settingsOpen)return;
  const next=JSON.parse(JSON.stringify(S)),enemyPicks=E.chooseMulligan(next,'e');
  const playerResult=E.mulligan(next,'p',[...openingSelection]),enemyResult=E.mulligan(next,'e',enemyPicks);
  if(!playerResult.ok||!enemyResult.ok)return notify(playerResult.error||enemyResult.error);
  openingBusy=true;Face.hidePreview();renderOpening();
  try{
    await effects.returnCards([...openingSelection].map(id=>({side:'p',element:openingDestination('p',id)})).concat(enemyPicks.map(id=>({side:'e',element:openingDestination('e',id)}))));
    S=next;openingSelection.clear();render();renderOpening();
    await effects.drawCards([...playerResult.events,...enemyResult.events],S,openingDestination);
    $('hand').classList.remove('opening-hand');await effects.openingToHand(S);
  }finally{
    S=next;effects.cleanup();openingActive=false;openingBusy=false;openingSelection.clear();renderOpening();$('game').inert=false;render();$('endTurnBtn').focus();
  }
}
function canAct(){return !openingActive&&!actionPlayer?.busy&&!settingsOpen&&!choosingFaction&&!historyOpen&&!pendingBoost&&!S.over&&S.turn==='p'}
function selectFaction(){
  const plan=deckBuilder.get();chosenFaction=plan.main;
  const {main:opponent,ally}=E.opponentDeck(plan);
  $('matchupText').textContent=T('deck.ai',{main:localizedFaction(opponent).name,ally:ally?' + '+localizedFaction(ally).name:''});
  $('startMatchBtn').textContent=hasMatch?T('开始新对局'):T('开始对局');
  $('cancelFactionBtn').textContent=T(S?.over?'返回':'继续当前对局');
}
function openFactionPicker(){
  if(actionPlayer?.busy||openingActive)return;
  Media.startRadio();
  returnFocus=document.activeElement;clearTimeout(aiTimer);clearTimeout(longPressTimer);cleanDrag();hideInfo(true);
  choosingFaction=true;$('game').inert=true;$('resultOverlay').inert=true;
  $('factionOverlay').classList.remove('hidden');$('cancelFactionBtn').hidden=!hasMatch;
  deckBuilder.render();selectFaction();$('mainChoices').querySelector('button').focus();
}
function closeFactionPicker(){
  if(!hasMatch)return;Face.hidePreview();choosingFaction=false;$('factionOverlay').classList.add('hidden');
  $('game').inert=false;$('resultOverlay').inert=false;chosenFaction=S.p.faction;
  if(S.over)Media.playResult(S.p.faction,S.winner==='p'?'victory':S.winner==='e'?'defeat':null);
  else Media.startRadio(S.p.faction,S.p.ally);
  render();returnFocus?.focus();if(S.turn==='e'&&!S.over)aiTimer=setTimeout(aiStep,420);
}
function notify(message){
  const t=$('toast');t.dataset.message=message;t.textContent=I.message(message);t.classList.add('show');
  clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),1500);
}
function abilityDescription(c){return I.skillText(c)}
function statusText(c,side,zone){
  const owner=(side==='p'?T('友方'):T('敌方'))+' · '+nation(side).name;
  if(zone==='hand')return owner+' · '+T('手牌');
  const parts=[owner,zone==='front'?T('前线'):T('后方')];
  const guards=E.guardSources(S,side,zone,c.id);
  if(guards.length)parts.push(T('guardedBy',{names:guards.map(N).join(', ')}));
  if(E.interceptorSources(S,side,zone,c.id).length)parts.push(T('战斗机掩护：轰炸机不可直接攻击'));
  if(c.t!=='hq'){
    parts.push(...E.unitStatus(c).map(I.message));
    if(c.sleeping)parts.push(T('刚部署：等待下一回合'));
    else if(c.attacked)parts.push(E.activityError(S,side,c,'attack')?T('本回合已攻击'):T('仍可再次攻击'));
    else if(c.moved)parts.push(c.t==='tank'?T('已移动，仍可攻击'):T('本回合已移动'));
    else if(S.turn!==side)parts.push(T('等待友方回合'));
    else parts.push(S[side].k>=E.operationCost(S,side,c,'attack')?T('可行动'):T('行动点不足'));
  }
  return parts.join(' · ');
}
function showInfo(c,event,side='p',zone='hand',pin=false){
  if(openingActive||actionPlayer?.busy||pdrag?.active||choosingFaction||historyOpen||pendingBoost||settingsOpen||S.p.hand.find(c=>c.id===selectedCard)?.t==='order')return;

  if(c.t!=='hq'&&zone!=='hand'){c=E.loc(S,side,c.id)?.u;if(!c){hideInfo(true);return;}}
  const t=$('cardTooltip'),description=abilityDescription(c),keywords=I.keywordLabels(c);
  const isUnit=!['order','hq'].includes(c.t);
  t.classList.remove('two-forms','multi-cards');t.style.setProperty('--preview-count',1);
  t.classList.toggle('action-preview',zone==='hand'&&!!selectedCard);
  t.innerHTML='<div class="tip-top"><span class="tip-cost">'+(c.t==='hq'?nation(side).emblem:c.c+'K')+'</span><span class="tip-name">'+N(c)+'</span></div>'+
    '<div class="tip-meta">'+(side==='e'?T('敌方'):T('友方'))+' · '+localizedFaction(c.faction||S[side].faction).name+' · '+T(TYPE[c.t])+(isUnit?' · '+T('行动')+' '+(zone==='hand'?c.o:E.operationCost(S,side,c,'attack'))+'K':'')+(c.elite?' · '+T('ELITE'):'')+(c.era?' · '+(I.getLanguage()==='zh'?c.era.replace('1950s','1950年代'):c.era):'')+'</div>'+
    (isUnit?'<div class="tip-stats"><span>'+T('攻击')+' '+E.attackValue(c,null,{},S)+'</span><span>'+T('防御')+' '+c.h+(c.max?' / '+c.max:'')+'</span></div>':c.t==='hq'?'<div class="tip-stats">'+T('生命')+' '+c.h+'</div>':'')+
    (keywords.length?'<div class="tip-keyword">'+keywords.join(' · ')+'</div>':'')+
    '<div class="tip-art"></div>'+
    (description?'<div class="tip-text">'+description.replace(/\n/g,'<br>')+'</div>':'')+
    '<div class="tip-status">'+statusText(c,side,zone)+'</div>';
  if(c.t!=='hq'){
    Face.mountPreview(t,c,{defaults:zone!=='hand',state:S,liveOptions:{attack:E.attackValue(c,null,{},S),operation:c.o}});
    const status=document.createElement('div');status.className='tip-status';status.textContent=statusText(c,side,zone);t.appendChild(status);
  }else{
    t.innerHTML='<div class="tip-card-face"></div><div class="tip-status"></div>';
    window.LongTelegramHQ.mount(t.querySelector('.tip-card-face'),E.headquarters(S[side]),{hp:S[side].hp});
    t.querySelector('.tip-status').textContent=statusText(c,side,zone);
  }
  const art=t.querySelector('.tip-art');if(art){if(Media.config(c).art)Media.mountArt(art,c);else art.remove();}
  inspection={id:c.id,side,zone,event};tooltipPinned=pin;t.classList.add('show');t.classList.toggle('pinned',pin);t.setAttribute('aria-hidden','false');positionInfo(event);
}
function positionInfo(event){
  const t=$('cardTooltip');if(!t.classList.contains('show'))return;
  const x=event?.clientX??window.innerWidth/2,y=event?.clientY??window.innerHeight/2;
  const r=t.getBoundingClientRect(),pad=12;
  t.style.left=Math.max(pad,Math.min(window.innerWidth-r.width-pad,x+18))+'px';
  t.style.top=Math.max(pad,Math.min(window.innerHeight-r.height-pad,y-r.height*.42))+'px';
}
function hideInfo(force=false){if(force||!tooltipPinned){$('cardTooltip').classList.remove('show');$('cardTooltip').setAttribute('aria-hidden','true');tooltipPinned=false;inspection=null}}
function bindInfo(el,c,side,zone){
  el.dataset.inspect=c.id;el.dataset.inspectSide=side;el.dataset.inspectZone=zone;
  el.setAttribute('aria-label',T('inspect',{side:T(side==='e'?'敌方':'友方'),name:N(c)}));
  el.setAttribute('aria-describedby','cardTooltip');
}
function inspectElement(el,event,pin=false){
  if(!el)return;
  const side=el.dataset.inspectSide,zone=el.dataset.inspectZone,id=el.dataset.inspect;
  const c=id==='hq'?{id:'hq',n:T('hqName',{city:nation(side).city}),t:'hq',h:S[side].hp}:
    zone==='hand'?S[side].hand.find(c=>c.id===id):E.loc(S,side,id)?.u;
  if(c)showInfo(c,event,side,zone,pin);
}
function refreshInspection(){
  if(choosingFaction||historyOpen||pdrag?.active)return;
  if(tooltipPinned&&inspection){
    const el=document.querySelector('[data-inspect="'+inspection.id+'"][data-inspect-side="'+inspection.side+'"]');
    if(el)inspectElement(el,inspection.event,true);else hideInfo(true);
  }else if(lastPointer){
    const el=document.elementFromPoint(lastPointer.clientX,lastPointer.clientY)?.closest('[data-inspect]');
    if(el)inspectElement(el,lastPointer);else hideInfo();
  }
}
function unitNode(u,side,zone){
  const b=document.createElement('button');b.type='button';
  const canAttack=side==='p'&&!E.activityError(S,'p',u,'attack');
  b.className='unit '+(side==='p'?'player-unit':'enemy-unit')+
    (u.sleeping||(!canAttack&&side==='p')?' exhausted':'')+
    (selectedUnit===u.id?' selected':'')+(u.kw.includes('guard')?' guard':'');
  b.dataset.side=side;b.dataset.unit=u.id;b.dataset.faction=u.faction||S[side].faction;
  const op=E.operationCost(S,side,u,'attack'),attack=E.attackValue(u,null,{},S);
  Face.mount(b,u,Face.liveStats(u,{compact:true,operation:op,attack}));
  const ready=document.createElement('span');ready.className='unit-ready';
  ready.textContent=u.locked?T('LOCKED'):u.sleeping?T('WAIT'):u.attacked&&canAttack?(u.fury?T('Fury'):T('EXTRA')):u.attacked?T('USED'):u.moved?T('MOVED'):T('READY');b.appendChild(ready);
  b.onclick=e=>{if(Date.now()<suppressClickUntil)return;if(side==='p'&&pendingPlay)choosePlayTarget(u.id);else if(side==='p')selectUnit(u.id);else if(canAct()&&(pendingPlay||selectedUnit||S.p.hand.find(x=>x.id===selectedCard)?.fx==='strike'))targetUnit(u.id);else inspectElement(b,e,true)};
  bindInfo(b,u,side,zone);
  if(side==='p'&&!u.sleeping)bindDrag(b,{kind:'unit',id:u.id});
  return b;
}
function hqNode(side){
  const h=$((side==='p'?'player':'enemy')+'Hq');
  const f=nation(side);h.dataset.faction=S[side].faction;
  if(S[side].hp<=0&&S.over&&!actionPlayer?.busy){
    if(!h.classList.contains('hq-ruin')){h.replaceChildren();h.classList.add('hq-ruin');window.LongTelegramBlast.ruins(h);}
    h.classList.remove('guarded','targetable');h.removeAttribute('data-inspect');h.removeAttribute('aria-describedby');h.setAttribute('aria-label',T('hq.destroyed'));h.tabIndex=-1;h.onclick=null;return h;
  }
  h.classList.remove('hq-ruin');h.tabIndex=0;
  window.LongTelegramHQ.mount(h,E.headquarters(S[side]),{hp:S[side].hp,hpId:side==='p'?'playerHp':'enemyHp'});
  h.setAttribute('aria-label',T('hqName',{city:f.city}));
  bindInfo(h,{id:'hq',n:T('hqName',{city:f.city})},side,'support');
  h.onclick=e=>{if(Date.now()<suppressClickUntil)return;if(side==='e'&&canAct()&&(pendingPlay||selectedUnit))targetHq();else inspectElement(h,e,true)};
  return h;
}
function gapLabel(entries,index){
  const left=entries[index-1],right=entries[index];
  const name=x=>x?.id==='hq'?T('总部'):(x?.u?N(x.u):'');
  if(!left)return T('部署到最左侧');
  if(!right)return T('部署到最右侧');
  return T('gap',{left:name(left),right:name(right)});
}
function renderSupport(side){
  const id=side==='p'?'playerSupportSlots':'enemySupportSlots',el=$(id),entries=E.row(S,side,'support');
  const nodes=entries.map(x=>x.id==='hq'?hqNode(side):unitNode(x.u,side,'support'));
  el.replaceChildren(...nodes);
  if(side==='p')el.appendChild(placementNode('support'));
}
function placementNode(zone){
  const b=document.createElement('button');b.type='button';b.className='placement-preview';
  b.textContent=zone==='support'?T('部署'):T('推进');b.tabIndex=-1;
  b.onclick=e=>{e.stopPropagation();commitPlacement(zone)};
  b.onkeydown=e=>{
    if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
    e.preventDefault();const count=E.row(S,'p',zone).length;
    showPlacement(zone,Math.max(0,Math.min(count,(placement?.gap??count)+(e.key==='ArrowLeft'?-1:1))));
  };
  return b;
}
function clearPlacement(){
  for(const id of ['playerSupportSlots','frontSlots']){
    const row=$(id);row.classList.remove('placing');
    row.querySelectorAll('.unit,.hq-card').forEach(n=>n.style.removeProperty('transform'));
    const preview=row.querySelector('.placement-preview');if(preview)preview.tabIndex=-1;
  }
  placement=null;
}
function showPlacement(zone,gap){
  if(placement?.zone===zone&&placement.gap===gap)return;
  clearPlacement();const row=$(zone==='support'?'playerSupportSlots':'frontSlots');
  const entries=E.row(S,'p',zone),geometry=P.preview(entries.length,row.clientWidth,gap);
  row.classList.add('placing');
  row.querySelectorAll('.unit,.hq-card').forEach((n,i)=>n.style.transform='translateX('+geometry.shifts[i]+'px)');
  const preview=row.querySelector('.placement-preview');
  preview.style.left=geometry.left+'px';preview.tabIndex=0;preview.setAttribute('aria-label',gapLabel(entries,gap));
  placement={zone,gap};
}
function commitPlacement(zone){
  if(!canAct()||placement?.zone!==zone)return;
  const gap=placement.gap;
  if(zone==='support'&&selectedCard)playSelectedCard(gap);
  else if(zone==='front'&&selectedUnit)run({type:'move',id:selectedUnit,gap});
}
function fillFront(){
  const side=S.p.front.length?'p':S.e.front.length?'e':null,el=$('frontSlots');
  el.innerHTML='';if(side)S[side].front.forEach(u=>el.appendChild(unitNode(u,side,'front')));
  if(side!=='e')el.appendChild(placementNode('front'));
  $('frontOwner').textContent=T('前线')+' · '+(side?nation(side).name:T('中立'));
}
function cardNode(c,i){
  const b=document.createElement('button');b.type='button';
  const d=i-(S.p.hand.length-1)/2,selectingHand=S.p.hand.find(u=>u.id===pendingPlay?.id)?.fx==='searchAndDestroy',blocked=!selectingHand&&!!E.playBaseError(S,'p',c.id);
  b.className='card'+(blocked?' unaffordable':'')+(selectedCard===c.id?' selected':'');
  b.style.setProperty('--fan-r',(d*3.2)+'deg');b.style.setProperty('--fan-y',(Math.abs(d)*5)+'px');
  b.style.setProperty('--fan-x',(d*Math.min(70.4,820/Math.max(1,S.p.hand.length-1)))+'px');b.dataset.card=c.id;b.dataset.faction=c.faction||S.p.faction;
  Face.mount(b,c);
  b.onclick=e=>{
    if(actionPlayer?.busy||Date.now()<suppressClickUntil)return;
    if(selectingHand)return choosePlayTarget(c.id);
    pendingPlay=null;selectedCard=selectedCard===c.id?null:c.id;selectedUnit=null;
    showInfo(c,e,'p','hand',!!selectedCard);
    if(selectedCard&&canAct()&&c.t==='order'&&(E.targetSteps(S,'p',c).length||c.fx==='searchAndDestroy'))beginPlay(c.id);
    else render();
  };
  bindInfo(b,c,'p','hand');if(canAct()&&!blocked&&(!pendingPlay||pendingPlay.id===c.id))bindDrag(b,{kind:'card',id:c.id});
  return b;
}
function applyGuardVisuals(){
  for(const side of ['p','e']){
    for(const zone of ['support','front'])for(const u of S[side][zone]){
      const el=document.querySelector('[data-side="'+side+'"][data-unit="'+u.id+'"]');
      const protectedByGuard=E.guardSources(S,side,zone,u.id).length>0,intercepted=E.interceptorSources(S,side,zone,u.id).length>0;
      el?.classList.toggle('guarded',protectedByGuard);
      if(el){const icons=document.createElement('span');icons.className='unit-status-icons';icons.innerHTML=Face.statusMarkup(u,{state:S,protectedByGuard,intercepted});el.appendChild(icons);}
    }
    const hq=$(side==='p'?'playerHq':'enemyHq'),protectedByGuard=E.guardSources(S,side,'support','hq').length>0;
    hq.classList.toggle('guarded',protectedByGuard);hq.querySelector('.unit-status-icons')?.remove();
    if(S[side].hp>0){const icons=document.createElement('span');icons.className='unit-status-icons';icons.innerHTML=Face.statusMarkup({t:'hq',kw:[]},{protectedByGuard,intercepted:E.interceptorSources(S,side,'support','hq').length>0});hq.appendChild(icons);}
  }
}
function render(){
  $('changeFactionBtn').hidden=S.over;
  if(!pdrag?.active&&S.p.hand.find(c=>c.id===selectedCard)?.t!=='order')$('attackLayer').classList.remove('active');
  placement=null;
  for(const side of ['p','e']){
    const f=nation(side),commander=document.querySelector(side==='p'?'.player-commander':'.enemy-commander');
    commander.dataset.faction=S[side].faction;
    commander.querySelector('.commander-name').textContent=S[side].ally?f.label+' + '+E.FACTIONS[S[side].ally].label:f.name;
    const portrait=commander.querySelector('.portrait');portrait.textContent=f.emblem;
    if(S[side].faction==='usa')portrait.innerHTML='<img src="./assets/emblems/usa_emblem.svg" alt="">';

  }
  $('enemyHand').setAttribute('aria-label',T('hiddenHand',{side:nation('e').name}));
  $('hand').setAttribute('aria-label',T('yourHand',{side:nation('p').name}));
  $('playerKNow').textContent=S.p.k;$('playerKMax').textContent=S.p.maxK;
  $('enemyKNow').textContent=S.e.k;$('enemyKMax').textContent=S.e.maxK;
  $('turnText').textContent=T('turn',{side:nation(S.turn).name,n:S.round});
  $('deckCount').textContent=T('decks',{own:S.p.deck.length,total:S.p.deckSize,enemy:S.e.deck.length,enemyTotal:S.e.deckSize});$('endTurnBtn').disabled=!canAct();
  renderSupport('p');renderSupport('e');fillFront();
  const hand=$('hand');hand.innerHTML='';S.p.hand.forEach((c,i)=>hand.appendChild(cardNode(c,i)));
  const eh=$('enemyHand');eh.innerHTML='';S.e.hand.forEach((c,i)=>{
    const d=document.createElement('div');d.className='card-back';d.dataset.handId=c.id;
    d.style.setProperty('--back-overlap',(-Math.max(42,102-560/Math.max(1,S.e.hand.length)))+'px');
    d.style.setProperty('--r',((i-(S.e.hand.length-1)/2)*Math.min(4,30/S.e.hand.length))+'deg');eh.appendChild(d);
  });
  applyGuardVisuals();markTargets();
  if(S.over&&!actionPlayer?.busy){
    $('resultTitle').textContent=T(S.winner==='p'?'result.victory':S.winner==='e'?'result.defeat':'result.draw');
    $('resultOverlay').classList.remove('hidden');
    $('game').inert=true;
  }
  refreshInspection();
  renderHistory();
  renderActionPrompt();
  if(openingActive)$('game').inert=true;
}
function selectUnit(id){if(!canAct())return;pendingPlay=null;selectedUnit=selectedUnit===id?null:id;selectedCard=null;hideInfo(true);render()}
function targetUnit(id){
  if(pendingPlay)return choosePlayTarget(id);
  if(selectedCard){
    const c=S.p.hand.find(x=>x.id===selectedCard);
    if(c?.fx==='strike')return run({type:'play',id:c.id,target:id});
  }
  if(selectedUnit)return run({type:'attack',id:selectedUnit,target:id});
}
function targetHq(){if(pendingPlay)return choosePlayTarget('hq');if(selectedUnit)run({type:'attack',id:selectedUnit,target:'hq'})}
function playSelectedCard(gap){
  const c=S.p.hand.find(x=>x.id===selectedCard);if(!c)return;
  if(c.fx==='strike')return notify('请把这张指令拖到或点击一个敌方单位');
  beginPlay(c.id,gap);
}
function beginPlay(id,gap,firstTarget){
  const error=E.playBaseError(S,'p',id);if(error)return notify(error);
  const c=S.p.hand.find(c=>c.id===id);pendingPlay={type:'play',id,gap,targets:[]};selectedCard=id;selectedUnit=null;
  if(firstTarget){
    if(!E.targetCandidates(S,'p',c,[]).includes(firstTarget)){pendingPlay=null;return notify('Choose a highlighted target.');}
    pendingPlay.targets.push(firstTarget);
  }
  advancePlay();
}
function advancePlay(){
  const c=S.p.hand.find(c=>c.id===pendingPlay?.id);if(!c)return;
  if(c.fx==='searchAndDestroy'){hideInfo(true);render();return;}
  if(pendingPlay.targets.length<E.targetSteps(S,'p',c).length){
    if(!E.targetCandidates(S,'p',c,pendingPlay.targets).length){pendingPlay=null;notify('No valid targets.');}
    hideInfo(true);render();return;
  }
  const action=pendingPlay;pendingPlay=null;run(action);
}
function choosePlayTarget(id){
  if(!canAct()||!pendingPlay)return;
  const c=S.p.hand.find(c=>c.id===pendingPlay.id);
  if(c.fx==='searchAndDestroy'&&pendingPlay.targets.includes(id)){pendingPlay.targets=pendingPlay.targets.filter(x=>x!==id);render();return;}
  if(!E.targetCandidates(S,'p',c,pendingPlay.targets).includes(id))return notify('Choose a highlighted target.');
  pendingPlay.targets.push(id);advancePlay();
}
function renderActionPrompt(){
  const bar=$('actionPrompt');bar.hidden=!pendingPlay||choosingFaction||historyOpen;
  if(bar.hidden)return;
  const c=S.p.hand.find(c=>c.id===pendingPlay.id),steps=E.targetSteps(S,'p',c);
  $('finishTargetsBtn').hidden=c.fx!=='searchAndDestroy';
  $('actionPromptText').textContent=N(c)+' · '+(c.fx==='searchAndDestroy'?T('search.selection',{n:pendingPlay.targets.length,max:steps.length}):(pendingPlay.targets.length+1)+'/'+steps.length+' — '+I.message(steps[pendingPlay.targets.length]));
}
function finishTargets(){
  if(!canAct()||S.p.hand.find(c=>c.id===pendingPlay?.id)?.fx!=='searchAndDestroy')return;
  const action=pendingPlay;pendingPlay=null;run(action);
}
function cancelAction(){
  if(actionPlayer?.busy)return;
  pendingPlay=null;pendingBoost=null;$('boostOverlay').classList.add('hidden');$('game').inert=false;
  cleanDrag();selectedCard=null;selectedUnit=null;hideInfo(true);render();
}
function run(action,side='p'){
  if(openingActive||actionPlayer.busy||choosingFaction||settingsOpen||historyOpen)return false;
  const choiceCard=action.type==='play'&&S[side].hand.find(c=>c.id===action.id);
  if(side==='p'&&choiceCard?.choices&&!action.choice){
    const error=E.playError(S,side,action.id,action.target,{...action,choice:choiceCard.choices[0]});if(error)return notify(error);
    pendingBoost=action;hideInfo(true);clearPlacement();$('game').inert=true;renderBoostDialog();$('boostOverlay').classList.remove('hidden');$('boostNormalBtn').focus();return true;
  }
  if(side==='p'&&action.boost===undefined){
    const c=action.type==='play'?S.p.hand.find(c=>c.id===action.id):E.loc(S,'p',action.id)?.u;
    if((action.type==='play'&&c?.key==='t80')||(action.type==='attack'&&c?.key==='t54a')){
      const error=action.type==='play'?E.playError(S,'p',c.id,action.target,action):E.attackError(S,'p',c.id,action.target,action);
      if(error)return notify(error);
      pendingBoost=action;hideInfo(true);clearPlacement();$('game').inert=true;
      renderBoostDialog();
      $('boostOverlay').classList.remove('hidden');$('boostNormalBtn').focus();return true;
    }
  }

  const next=JSON.parse(JSON.stringify(S)),result=E.act(next,side,action);
  if(!result.ok){notify(result.error);return false}
  const card=action.type==='play'?S[side].hand.find(c=>c.id===action.id):E.loc(S,side,action.id)?.u;
  cleanDrag();const context={side,action,card,next,result,...effects.capture(S,side,action)};
  pendingPlay=null;selectedUnit=null;selectedCard=null;hideInfo(true);$('actionPrompt').hidden=true;
  return actionPlayer.play(context);
}
function renderBoostDialog(){
  const action=pendingBoost;if(!action)return;
  const deploy=action.type==='play',c=deploy?S.p.hand.find(c=>c.id===action.id):E.loc(S,'p',action.id)?.u;
  const base=deploy?c.c:E.operationCost(S,'p',c,'attack');
  $('boostTitle').textContent=N(c);
  if(c.choices){$('boostText').textContent=T('Choose an option.');$('boostNormalBtn').textContent=T('choice.draw');$('boostPaidBtn').textContent=T('choice.kredits');$('boostPaidBtn').disabled=false;return;}
  $('boostText').textContent=deploy?T('boostDeploy',{n:Math.max(0,S.p.k-c.c-2)}):T('Full Firepower: pay 1 extra K for +2 attack on this attack.');
  $('boostNormalBtn').textContent=T(deploy?'Deploy':'Attack')+' · '+base+' K';
  $('boostPaidBtn').textContent=T(deploy?'Fury':'Full Firepower')+' · '+(base+(deploy?2:1))+' K';
  $('boostPaidBtn').disabled=!!(deploy?E.playError(S,'p',c.id,action.target,{...action,boost:true}):E.attackError(S,'p',c.id,action.target,{boost:true}));
}
function confirmBoost(boost){const action=pendingBoost;if(!action)return;const c=S.p.hand.find(c=>c.id===action.id);pendingBoost=null;$('boostOverlay').classList.add('hidden');$('game').inert=false;run(c?.choices?{...action,choice:c.choices[boost?1:0]}:{...action,boost});}
function markTargets(){
  clearPlacement();
  document.querySelectorAll('.targetable,.picked-target,.guard-blocked,.intercept-blocked,.drop-hot,.drop-valid').forEach(x=>x.classList.remove('targetable','picked-target','guard-blocked','intercept-blocked','drop-hot','drop-valid'));
  $('playerSupportSlots').classList.remove('deploy-mode');
  const cardId=pdrag?.active&&pdrag.payload.kind==='card'?pdrag.payload.id:selectedCard;
  if(cardId){
    const c=S.p.hand.find(x=>x.id===cardId);if(!c)return;
    if(pendingPlay||(c.t==='order'&&E.targetSteps(S,'p',c).length)){
      const picked=pendingPlay?.targets||[],valid=E.playBaseError(S,'p',c.id)?[]:E.targetCandidates(S,'p',c,picked);
      if(c.fx==='searchAndDestroy'){
        document.querySelectorAll('#hand .card').forEach(el=>{el.classList.toggle('targetable',valid.includes(el.dataset.card));el.classList.toggle('picked-target',picked.includes(el.dataset.card));});return;
      }
      $('enemyHq').classList.toggle('targetable',valid.includes('hq'));
      document.querySelectorAll('.unit').forEach(el=>{
        el.classList.toggle('targetable',valid.includes(el.dataset.unit));el.classList.toggle('picked-target',picked.includes(el.dataset.unit));
      });return;
    }
    if(c.fx==='strike')document.querySelectorAll('.enemy-unit').forEach(el=>{
      if(!E.playError(S,'p',c.id,el.dataset.unit))el.classList.add('targetable');
    });
    else if(!E.playBaseError(S,'p',c.id)){
      $('playerSupportSlots').classList.add('deploy-mode');
      if(!pdrag?.active&&c.t!=='order')showPlacement('support',S.p.hqIndex);
    }
    return;
  }
  const unitId=pdrag?.active&&pdrag.payload.kind==='unit'?pdrag.payload.id:selectedUnit;
  if(!unitId)return;
  for(const u of [...S.e.support,...S.e.front]){
    const el=document.querySelector('[data-side="e"][data-unit="'+u.id+'"]'),error=E.attackError(S,'p',unitId,u.id);
    if(!error)el?.classList.add('targetable');
    else if(error.includes('守卫'))el?.classList.add('guard-blocked');
    else if(error.includes('战斗机拦截'))el?.classList.add('intercept-blocked');
  }
  const hqError=E.attackError(S,'p',unitId,'hq');
  if(!hqError)$('enemyHq').classList.add('targetable');
  else if(hqError.includes('守卫'))$('enemyHq').classList.add('guard-blocked');
  else if(hqError.includes('战斗机拦截'))$('enemyHq').classList.add('intercept-blocked');
  if(!E.moveError(S,'p',unitId)){
    $('frontline').classList.add('drop-valid');
    if(!pdrag?.active)showPlacement('front',S.p.front.length);
  }
}
function bindDrag(el,payload){
  el.addEventListener('pointerdown',e=>{
    if(!canAct()||pendingPlay&&pendingPlay.id!==payload.id)return;
    if(e.button!==undefined&&e.button!==0)return;
    const r=el.getBoundingClientRect();
    pdrag={payload,source:el,id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:r.left+r.width/2,oy:r.top+r.height/2,active:false,proxy:null};
    try{el.setPointerCapture(e.pointerId)}catch(_){}
    window.addEventListener('pointermove',dragMove,{passive:false});
    window.addEventListener('pointerup',dragEnd,{passive:false});
    window.addEventListener('pointercancel',dragCancel,{passive:false});
  },{passive:true});
}
function activateDrag(e){
  if(!pdrag||pdrag.active)return;pdrag.active=true;hideInfo(true);clearTimeout(longPressTimer);
  const order=pdrag.payload.kind==='card'&&S.p.hand.find(c=>c.id===pdrag.payload.id)?.t==='order';pdrag.arrow=order||pdrag.payload.kind==='unit';
  pdrag.source.classList.add(order?'order-source':'drag-source');
  if(pdrag.payload.kind==='card'){
    if(pendingPlay?.id!==pdrag.payload.id)pendingPlay=null;
    selectedCard=pdrag.payload.id;selectedUnit=null;
    if(!order){pdrag.proxy=pdrag.source.cloneNode(true);pdrag.proxy.classList.add('drag-proxy');document.body.appendChild(pdrag.proxy);moveProxy(e.clientX,e.clientY);}
  }else{selectedUnit=pdrag.payload.id;selectedCard=null;}
  if(pdrag.arrow){$('attackLayer').classList.add('active');setArrow(pdrag.ox,Math.min(pdrag.oy,window.innerHeight-18),e.clientX,e.clientY);}
  markTargets();
}
function dragMove(e){
  if(!pdrag||e.pointerId!==pdrag.id)return;
  const dx=e.clientX-pdrag.sx,dy=e.clientY-pdrag.sy;
  if(!pdrag.active&&Math.hypot(dx,dy)>(e.pointerType==='mouse'?4:9))activateDrag(e);
  if(!pdrag.active)return;e.preventDefault();
  pdrag.arrow?setArrow(pdrag.ox,Math.min(pdrag.oy,window.innerHeight-18),e.clientX,e.clientY):moveProxy(e.clientX,e.clientY);
  hotDrop(e.clientX,e.clientY,pdrag.payload);
}
function dragEnd(e){
  if(!pdrag||e.pointerId!==pdrag.id)return;
  if(!pdrag.active){cleanDrag();return}
  e.preventDefault();const payload=pdrag.payload,target=findDrop(e.clientX,e.clientY);
  suppressClickUntil=Date.now()+350;cleanDrag();performDrop(payload,target);
}
function dragCancel(e){if(pdrag&&e.pointerId===pdrag.id){cleanDrag();pendingPlay=null;selectedCard=null;selectedUnit=null;markTargets();renderActionPrompt()}}
function moveProxy(x,y){if(pdrag?.proxy){pdrag.proxy.style.left=x+'px';pdrag.proxy.style.top=y+'px'}}
function setArrow(x1,y1,x2,y2){
  const svg=$('attackLayer'),l=$('attackLine'),width=window.innerWidth,height=window.innerHeight;
  svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.setAttribute('preserveAspectRatio','none');
  for(const [key,value] of Object.entries({x1,y1,x2,y2}))l.setAttribute(key,Math.max(22,Math.min((key[0]==='x'?width:height)-22,value)));
}
function findDrop(x,y){
  const el=document.elementFromPoint(x,y);if(!el)return null;
  const c=S.p.hand.find(c=>c.id===(pdrag?.payload.kind==='card'?pdrag.payload.id:selectedCard));
  const hand=el.closest('#hand [data-card]');if(hand&&c?.fx==='searchAndDestroy')return {type:'hand-card',id:hand.dataset.card};
  const friend=el.closest('.player-unit');
  if(friend&&c?.t==='order'&&E.targetSteps(S,'p',c).length)return {type:'friendly-unit',id:friend.dataset.unit};
  if(el.closest('#playerSupport'))return {type:'support',gap:rowGap('support',x)};
  const u=el.closest('.enemy-unit');if(u)return{type:'enemy-unit',id:u.dataset.unit};
  if(el.closest('#enemyHq'))return{type:'enemy-hq'};
  if(el.closest('#frontline'))return{type:'front',gap:rowGap('front',x)};
  return null;
}
function rowGap(zone,clientX){
  const row=$(zone==='support'?'playerSupportSlots':'frontSlots'),r=row.getBoundingClientRect();

  return P.gapAt(E.row(S,'p',zone).length,row.clientWidth,(clientX-r.left)*row.clientWidth/r.width);
}
function validDrop(p,t){
  if(!t)return false;
  if(p.kind==='card'){
    const c=S.p.hand.find(x=>x.id===p.id);if(!c)return false;
    if(c.t==='order'&&E.targetSteps(S,'p',c).length)return !E.playBaseError(S,'p',c.id)&&['friendly-unit','enemy-unit','enemy-hq','hand-card'].includes(t.type)&&E.targetCandidates(S,'p',c,pendingPlay?.id===c.id?pendingPlay.targets:[]).includes(t.type==='enemy-hq'?'hq':t.id);
    if(t.type==='enemy-unit')return c.fx==='strike'&&!E.playError(S,'p',c.id,t.id);
    if(c.t==='order'&&c.fx!=='strike')return ['support','front'].includes(t.type)&&!E.playBaseError(S,'p',c.id);
    return t.type==='support'&&c.fx!=='strike'&&!E.playBaseError(S,'p',c.id);
  }
  if(t.type==='front')return!E.moveError(S,'p',p.id);
  if(t.type==='enemy-hq')return!E.attackError(S,'p',p.id,'hq');
  if(t.type==='enemy-unit')return!E.attackError(S,'p',p.id,t.id);
  return false;
}
function hotDrop(x,y,p){
  document.querySelectorAll('.drop-hot').forEach(n=>n.classList.remove('drop-hot'));
  const t=findDrop(x,y);if(!validDrop(p,t)){clearPlacement();return}
  const unitCard=p.kind==='card'&&S.p.hand.find(c=>c.id===p.id)?.t!=='order';
  if((t.type==='support'&&unitCard)||(t.type==='front'&&p.kind==='unit'))showPlacement(t.type==='support'?'support':'front',t.gap);
  else clearPlacement();
  const el=t.type==='support'?$('playerSupportSlots'):
    t.type==='hand-card'?document.querySelector('#hand [data-card="'+t.id+'"]'):
    t.type==='friendly-unit'?document.querySelector('[data-side="p"][data-unit="'+t.id+'"]'):
    t.type==='enemy-unit'?document.querySelector('[data-side="e"][data-unit="'+t.id+'"]'):
    t.type==='enemy-hq'?$('enemyHq'):$('frontline');
  el?.classList.add('drop-hot');
}
function performDrop(p,t){
  if(!validDrop(p,t)){notify('无效目标');markTargets();return}
  if(p.kind==='card'){
    const c=S.p.hand.find(c=>c.id===p.id);
    if(c.fx==='strike')run({type:'play',id:p.id,target:t.id});
    else if(pendingPlay?.id===p.id)choosePlayTarget(t.type==='enemy-hq'?'hq':t.id);
    else beginPlay(p.id,t.gap,['friendly-unit','enemy-unit','hand-card','enemy-hq'].includes(t.type)?(t.type==='enemy-hq'?'hq':t.id):undefined);
  }else if(t.type==='front')run({type:'move',id:p.id,gap:t.gap});
  else run({type:'attack',id:p.id,target:t.type==='enemy-hq'?'hq':t.id});
}
function cleanDrag(){
  clearPlacement();
  $('attackLayer').classList.remove('active');
  if(!pdrag)return;try{pdrag.source.releasePointerCapture(pdrag.id)}catch(_){}
  pdrag.source.classList.remove('drag-source','order-source');pdrag.proxy?.remove();
  document.querySelectorAll('.drop-hot,.drop-valid').forEach(n=>n.classList.remove('drop-hot','drop-valid'));
  window.removeEventListener('pointermove',dragMove);window.removeEventListener('pointerup',dragEnd);
  window.removeEventListener('pointercancel',dragCancel);pdrag=null;
}
function endTurn(){if(canAct())return run({type:'end'});}
function aiStep(){
  if(openingActive||actionPlayer.busy||choosingFaction||historyOpen||settingsOpen)return;
  if(S.over||S.turn!=='e')return render();
  if(run(E.chooseAI(S,'e'),'e')===false)run({type:'end'},'e');
}
function trapFocus(e,root){
  const buttons=[...root.querySelectorAll('button, summary, a[href], input, select'),...(!settingsOpen?[$('settingsBtn')]:[])].filter(b=>!b.hidden&&!b.disabled&&b.getClientRects().length);
  if(!buttons.length)return;
  const current=buttons.indexOf(document.activeElement);
  const next=current<0?(e.shiftKey?buttons.length-1:0):(current+(e.shiftKey?-1:1)+buttons.length)%buttons.length;
  e.preventDefault();buttons[next].focus();
}
function openHistory(){
  if(openingActive||actionPlayer?.busy||choosingFaction)return;
  historyReturnFocus=document.activeElement;historyOpen=true;clearTimeout(aiTimer);cleanDrag();hideInfo(true);
  $('game').inert=true;$('resultOverlay').inert=true;$('historyOverlay').classList.remove('hidden');
  renderHistory();$('closeHistoryBtn').focus();
}
function closeHistory(){
  historyOpen=false;$('historyOverlay').classList.add('hidden');$('game').inert=false;$('resultOverlay').inert=false;
  render();historyReturnFocus?.focus();if(S.turn==='e'&&!S.over)aiTimer=setTimeout(aiStep,420);
}
function historyResult(entry){
  const results=[],names={};
  for(const side of ['p','e'])for(const zone of ['support','front'])for(const c of entry.before[side][zone])names[side+':'+c.id]=N(c);
  const draws={p:0,e:0},buffs={p:{},e:{}};
  for(const event of entry.events){
    const owner=localizedFaction(entry.before[event.side].faction).name;
    const name=names[event.side+':'+event.id]||(event.name?N(event.name):owner);
    if(event.kind==='damage')results.push(name+' −'+event.amount+(event.reason==='fatigue'?' ('+T('疲劳')+')':''));
    if(event.kind==='heal')results.push(T('heal',{name,n:event.amount}));
    if(event.kind==='destroy')results.push(T('destroy',{name:N(event.name)}));
    if(event.kind==='draw')draws[event.side]++;
    if(event.kind==='burn')results.push(T('burn',{side:owner}));
    if(event.kind==='buff')buffs[event.side][event.amount]=(buffs[event.side][event.amount]||0)+1;
    if(event.kind==='effect')results.push(N(event.name)+': '+I.message(event.text));
    if(event.kind==='recover')results.push(T('recover',{name:N(event.name),n:event.amount}));
    if(event.kind==='spawn')results.push(T('spawn',{side:owner,name:N(event.name)}));
    if(event.kind==='generate')results.push(T('generate',{side:owner,name:N(event.name)}));
    if(event.kind==='retreat')results.push(T('retreat',{name:N(event.name)}));
    if(event.kind==='kreditSlots')results.push(T('kreditSlots',{side:owner,n:-event.amount}));
    if(event.kind==='kredits')results.push(T('gainedKredits',{side:owner,n:event.amount}));
    if(event.kind==='discard')results.push(T('discardedCard',{side:owner,name:N(event.name)}));
  }
  for(const side of ['p','e']){
    const owner=localizedFaction(entry.before[side].faction).name;
    if(draws[side])results.push(T('draw',{side:owner,n:draws[side]}));
    for(const [amount,n] of Object.entries(buffs[side]))results.push(T('buff',{side:owner,n,amount}));
  }
  if(entry.after.over)results.push(entry.after.winner==='draw'?T('平局'):T('win',{side:localizedFaction(entry.after[entry.after.winner].faction).name}));
  return results.join('; ')||T(entry.type==='play'?'部署完成':entry.type==='move'?'进入前线':'回合交接');
}
function renderHistory(){
  $('historyCount').textContent=String(S.history.length);
  if(!historyOpen)return;
  const body=$('historyRows');body.replaceChildren();
  $('historyEmpty').hidden=S.history.length>0;
  const selected=historyStep??S.history.at(-1)?.step;
  for(const entry of [...S.history].reverse()){
    const tr=document.createElement('tr');tr.classList.toggle('history-selected',entry.step===selected);
    const turn=document.createElement('td');turn.textContent=entry.round+' · '+localizedFaction(entry.faction).name;
    const action=document.createElement('td'),button=document.createElement('button');
    button.type='button';button.className='history-action';button.textContent=entry.step+'. '+I.summary(entry);
    button.setAttribute('aria-pressed',String(entry.step===selected));
    button.onclick=()=>{historyStep=entry.step;renderHistory();$('historyDetail').focus()};
    action.appendChild(button);const outcome=document.createElement('div');outcome.className='history-outcome';outcome.textContent=historyResult(entry);action.appendChild(outcome);
    const cost=document.createElement('td');cost.textContent=entry.cost?'−'+entry.cost+' K':'—';
    tr.append(turn,action,cost);body.appendChild(tr);
  }
  const entry=S.history.find(e=>e.step===selected),detail=$('historyDetail');detail.replaceChildren();
  if(!entry)return;
  const heading=document.createElement('h3');heading.textContent=T('step',{n:entry.step,summary:I.summary(entry)});detail.appendChild(heading);
  const snapshots=document.createElement('div');snapshots.className='history-snapshots';
  for(const [title,snapshot] of [[T('行动前'),entry.before],[T('行动后'),entry.after]]){
    const section=document.createElement('section'),h=document.createElement('h4');h.textContent=title;section.appendChild(h);
    for(const side of ['e','p']){
      const p=snapshot[side],label=document.createElement('p');
      label.className='snapshot-side';label.textContent=localizedFaction(p.faction).name+' · '+T('总部')+' '+p.hp+' · '+p.k+'/'+p.maxK+' K';section.appendChild(label);
      for(const zone of ['support','front']){
        const line=document.createElement('div');line.className='snapshot-line';
        const caption=document.createElement('span');caption.textContent=zone==='support'?T('后方'):T('前线');line.appendChild(caption);
        const units=document.createElement('div');units.className='snapshot-units';
        for(const c of p[zone]){
          const card=document.createElement('span');card.className='snapshot-card';card.textContent=N(c)+' '+(c.t==='hq'?c.h:c.a+'/'+c.h+' · '+c.o+' K')+(c.status?.length?' · '+c.status.map(I.message).join(', '):'');units.appendChild(card);
        }
        if(!p[zone].length)units.textContent=T('空');line.appendChild(units);section.appendChild(line);
      }
      const counts=document.createElement('small');counts.textContent=T('counts',{hand:p.handCount,deck:p.deckCount});section.appendChild(counts);
    }
    snapshots.appendChild(section);
  }
  detail.appendChild(snapshots);
}
$('historyBtn').onclick=openHistory;$('closeHistoryBtn').onclick=closeHistory;
$('historyLatestBtn').onclick=()=>{historyStep=null;renderHistory()};
$('historyOverlay').onclick=e=>{if(e.target===$('historyOverlay'))closeHistory()};
$('frontline').addEventListener('click',e=>{
  if(!canAct()||!selectedUnit||Date.now()<suppressClickUntil)return;
  if(!e.target.closest('.enemy-unit')&&!E.moveError(S,'p',selectedUnit)){
    const gap=e.target.closest('.placement-preview')&&e.detail===0?placement?.gap:rowGap('front',e.clientX);
    e.stopPropagation();run({type:'move',id:selectedUnit,gap});
  }
},true);
$('playerSupport').addEventListener('click',e=>{
  if(!canAct()||!selectedCard||Date.now()<suppressClickUntil)return;
  if(pendingPlay)return;
  const c=S.p.hand.find(c=>c.id===selectedCard);if(!c||c.fx==='strike')return;
  const gap=e.target.closest('.placement-preview')&&e.detail===0?placement?.gap:rowGap('support',e.clientX);
  e.stopPropagation();playSelectedCard(gap);
},true);
$('endTurnBtn').onclick=endTurn;$('restartBtn').onclick=start;$('settingsBtn').onclick=openSettings;
$('confirmOpeningBtn').onclick=confirmOpening;
$('changeFactionBtn').onclick=openFactionPicker;$('startMatchBtn').onclick=()=>{$('resultOverlay').inert=false;start()};
$('resultFactionBtn').onclick=openFactionPicker;
$('cancelFactionBtn').onclick=closeFactionPicker;
$('cancelActionBtn').onclick=cancelAction;$('boostCancelBtn').onclick=cancelAction;$('finishTargetsBtn').onclick=finishTargets;
$('boostNormalBtn').onclick=()=>confirmBoost(false);$('boostPaidBtn').onclick=()=>confirmBoost(true);
document.addEventListener('keydown',e=>{
  if(actionPlayer?.busy)return;
  if(settingsOpen){if(e.key==='Escape')closeSettings();if(e.key==='Tab')trapFocus(e,$('settingsOverlay'));return;}
  if(openingActive){if(e.key==='Tab')trapFocus(e,$('openingOverlay'));return;}
  if(S.over&&!choosingFaction&&!historyOpen){if(e.key==='Tab')trapFocus(e,$('resultOverlay'));return;}
  if(pendingBoost){
    if(e.key==='Escape')cancelAction();
    if(e.key==='Tab')trapFocus(e,$('boostOverlay'));
    return;
  }
  if(historyOpen){
    if(e.key==='Escape')closeHistory();
    if(e.key==='Tab')trapFocus(e,$('historyOverlay'));
    return;
  }
  if(choosingFaction){
    if(e.key==='Escape')closeFactionPicker();
    if(e.key==='Tab')trapFocus(e,$('factionOverlay'));
    return;
  }
  if(e.key==='Escape'){lastPointer=null;cancelAction()}
});
document.addEventListener('pointermove',e=>{
  clearTimeout(longPressTimer);
  const aimedOrder=S.p.hand.find(c=>c.id===selectedCard&&c.t==='order');
  if(canAct()&&!pdrag?.active&&aimedOrder){
    const source=document.querySelector('#hand [data-card="'+aimedOrder.id+'"]'),r=source?.getBoundingClientRect();
    if(r){$('attackLayer').classList.add('active');setArrow(r.left+r.width/2,Math.min(r.top+r.height/2,window.innerHeight-18),e.clientX,e.clientY);}
    hotDrop(e.clientX,e.clientY,{kind:'card',id:aimedOrder.id});hideInfo(true);return;
  }
  if(canAct()&&!pdrag?.active&&!pendingPlay&&(selectedCard||selectedUnit)){
    hotDrop(e.clientX,e.clientY,{kind:selectedCard?'card':'unit',id:selectedCard||selectedUnit});
  }
  if(e.pointerType==='touch')return;
  lastPointer={clientX:e.clientX,clientY:e.clientY};
  if(pdrag?.active||choosingFaction||historyOpen)return;
  const el=e.target.closest('[data-inspect]');
  if(el)inspectElement(el,e);else hideInfo();
});
document.addEventListener('pointerover',e=>{
  if(e.pointerType==='touch')return;
  lastPointer={clientX:e.clientX,clientY:e.clientY};
  inspectElement(e.target.closest('[data-inspect]'),e);
});
document.addEventListener('pointerout',e=>{
  const from=e.target.closest('[data-inspect]'),to=e.relatedTarget?.closest?.('[data-inspect]');
  if(from&&from!==to)hideInfo();
});
document.addEventListener('focusin',e=>{
  const el=e.target.closest('[data-inspect]');if(!el)return;
  const r=el.getBoundingClientRect();inspectElement(el,{clientX:r.right,clientY:r.top+r.height/2});
});
document.addEventListener('focusout',()=>hideInfo());
document.addEventListener('pointerdown',e=>{
  if(e.target.closest('#cardTooltip'))return;
  const el=e.target.closest('[data-inspect]');
  if(!el){hideInfo(true);return}
  if(e.pointerType==='touch'){
    clearTimeout(longPressTimer);longPressTimer=setTimeout(()=>{
      suppressClickUntil=Date.now()+900;inspectElement(el,e,true);
    },450);
  }
});
for(const event of ['pointerup','pointercancel'])document.addEventListener(event,()=>clearTimeout(longPressTimer));
function registerTools(){
  const c=document.modelContext;if(!c?.registerTool)return;
  c.registerTool({name:'read_battle_state',description:'Read the current KARDS: Long Telegram match state.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({choosingFaction,playerFaction:S.p.faction,enemyFaction:S.e.faction,animating:actionPlayer.busy,turn:S.turn,round:S.round,playerHp:S.p.hp,enemyHp:S.e.hp,kredits:S.p.k,hand:S.p.hand.map(c=>c.n)})});
  c.registerTool({name:'end_player_turn',description:'End the player turn.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>{if(!canAct())throw Error('Not the player turn');endTurn();return{ok:true}}});
}
function openSettings(){
  if(openingBusy||actionPlayer?.busy||settingsOpen)return;
  Face.hidePreview();settingsReturnFocus=document.activeElement;settingsOpen=true;clearTimeout(aiTimer);cleanDrag();hideInfo(true);
  settingsInert=['game','factionOverlay','historyOverlay','boostOverlay','resultOverlay','openingOverlay'].map(id=>{const el=$(id),old=el.inert;el.inert=true;return [el,old]});
  $('settingsOverlay').classList.remove('hidden');$('settingsBtn').setAttribute('aria-expanded','true');
  document.querySelector('[data-language="'+I.getLanguage()+'"]').focus();
}
function closeSettings(){
  if(!settingsOpen)return;
  settingsOpen=false;$('settingsOverlay').classList.add('hidden');$('settingsBtn').setAttribute('aria-expanded','false');
  settingsInert.forEach(([el,old])=>el.inert=old);settingsInert=[];
  render();settingsReturnFocus?.focus();
  if(!choosingFaction&&!historyOpen&&!S.over&&S.turn==='e')aiTimer=setTimeout(aiStep,420);
}
$('closeSettingsBtn').onclick=closeSettings;
$('settingsOverlay').onclick=e=>{if(e.target===$('settingsOverlay'))closeSettings()};
function renderRuleGuide(){
  const host=$('ruleGuide'),opened=new Set([...host.querySelectorAll('details[open]')].map(d=>d.dataset.rule));
  host.replaceChildren();
  for(const group of ['unitTypes','keywords','effects']){
    const heading=document.createElement('h3');heading.textContent=T(group);host.appendChild(heading);
    for(const rule of I.glossary.filter(r=>r.group===group)){
      const detail=document.createElement('details');detail.dataset.rule=rule.id;detail.open=opened.has(rule.id);
      const title=document.createElement('summary');title.textContent=T(rule.title);detail.appendChild(title);
      const text=document.createElement('p');text.textContent=rule[I.getLanguage()];detail.appendChild(text);
      if(rule.reference){const note=document.createElement('small');note.textContent=T('referenceOnly');detail.appendChild(note);}
      const source=document.createElement('a');source.href=rule.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent=T('officialRules');detail.appendChild(source);
      host.appendChild(detail);
    }
  }
}
function applyLanguage(){
  document.documentElement.lang=I.getLanguage()==='zh'?'zh-CN':'en';
  document.title='KARDS: Long Telegram';
  $('enemySupport').dataset.lineLabel=T('terminal.enemyLine');
  $('playerSupport').dataset.lineLabel=T('terminal.ownLine');
  document.querySelector('meta[name="description"]').content=I.getLanguage()==='zh'?'冷战题材的前线战术卡牌对战。':'A Cold War frontline tactical card battle game.';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=T(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',T(el.dataset.i18nAria)));
  document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===I.getLanguage())));
  document.documentElement.style.setProperty('--guard-label',JSON.stringify(T('守卫保护')));
  document.documentElement.style.setProperty('--interception-label',JSON.stringify(T('战斗机拦截')));
  if($('toast').dataset.message)$('toast').textContent=I.message($('toast').dataset.message);
  renderRuleGuide();deckBuilder.render();selectFaction();render();renderBoostDialog();renderOpening();
}
function switchLanguage(lang){
  if(lang===I.getLanguage())return;
  cleanDrag();I.setLanguage(lang);
  try{localStorage.setItem('long-telegram.language',lang)}catch(_){}
  applyLanguage();
}
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>switchLanguage(b.dataset.language));
const STAGE_WIDTH=1440,STAGE_HEIGHT=900;
function fitStage(){
  const safeX=window.innerWidth>520?12:4,safeY=window.innerHeight>520?12:4;
  const scale=Math.max(.18,Math.min((window.innerWidth-safeX*2)/STAGE_WIDTH,(window.innerHeight-safeY*2)/STAGE_HEIGHT));
  document.documentElement.style.setProperty('--stage-scale',String(scale));
  document.documentElement.style.setProperty('--drag-scale',String(scale*1.05));
}
window.addEventListener('resize',fitStage,{passive:true});
window.addEventListener('orientationchange',fitStage,{passive:true});
if(window.visualViewport)window.visualViewport.addEventListener('resize',fitStage,{passive:true});
effects=Effects.create({
  face:(host,c)=>Face.mount(host,c,Face.liveStats(c,{attack:E.attackValue(c,null,{},S)})),
  card:c=>cardNode(c,0),sound:c=>Media.deploy(c),destroyedLabel:ctx=>T('fx.hqDestroyed'),
  blastSound:()=>Media.explosion(),beginFinale:ctx=>Media.playResult(ctx.next.p.faction,ctx.next.winner==='p'?'victory':ctx.next.winner==='e'?'defeat':null),
  describe:ctx=>I.summary(ctx.next.history.at(-1))
});
actionPlayer=Effects.createSequencer({
  lock:busy=>{
    if(busy)$('attackLayer').classList.remove('active');
    $('game').inert=busy;$('game').setAttribute('aria-busy',String(busy));
    for(const id of ['settingsBtn','changeFactionBtn','historyBtn','endTurnBtn'])$(id).disabled=busy;
  },
  before:effects.before,prepareFinale:effects.prepareFinale,
  commit:ctx=>{S=ctx.next;render()},
  after:effects.after,finale:effects.finale,cleanup:effects.cleanup,
  error:error=>console.error('Battle presentation:',error),
  done:()=>{render();if(S.over)$('restartBtn').focus();if(!S.over&&S.turn==='e'&&!settingsOpen&&!historyOpen&&!choosingFaction)aiTimer=setTimeout(aiStep,650)}
});
$('soundEnabled').checked=Media.enabled;$('soundVolume').value=Math.round(Media.volume*100);
$('soundEnabled').onchange=e=>Media.setEnabled(e.target.checked);
$('soundVolume').oninput=e=>Media.setVolume(Number(e.target.value)/100);
document.addEventListener('pointerdown',()=>Media.unlock(),{passive:true});
document.addEventListener('keydown',()=>Media.unlock(),{passive:true});
deckBuilder=window.LongTelegramDeckBuilder.create(()=>selectFaction());
fitStage();registerTools();S=E.createGame();applyLanguage();openFactionPicker();
})();
