
(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramEffects=api;})(typeof globalThis!=='undefined'?globalThis:this,root=>{
'use strict';
function createSequencer(hooks){
 let busy=false;
 return {get busy(){return busy},async play(context){
  if(busy)return false;busy=true;let committed=false;
  const safe=async phase=>{try{await phase(context)}catch(error){hooks.error?.(error)}};
  try{hooks.lock(true);await safe(hooks.before);if(context.next.over&&hooks.prepareFinale)await safe(hooks.prepareFinale);hooks.commit(context);committed=true;await safe(hooks.after);if(context.next.over)await safe(hooks.finale);}
  finally{try{hooks.cleanup()}finally{busy=false;hooks.lock(false);if(committed)hooks.done(context)}}
  return true;
 }};
}
function create(options){
 const doc=root.document,layer=doc.getElementById('battleEffects'),caption=doc.getElementById('battleCaption');
 const reduced=()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const wait=ms=>new Promise(resolve=>root.setTimeout(resolve,ms));
 const center=r=>({x:r.left+r.width/2,y:r.top+r.height/2});
 const rect=el=>el?.getBoundingClientRect();
 const key=(side,id)=>side+':'+id;
 const node=(side,id)=>id==='hq'?doc.getElementById(side==='p'?'playerHq':'enemyHq'):doc.querySelector('#game [data-side="'+side+'"][data-unit="'+id+'"]');
 let hidden=[];
 function hide(el){if(el){hidden.push([el,el.style.visibility]);el.style.visibility='hidden';}}
 function animate(el,frames,ms){
  if(!el?.animate)return wait(ms);
  const animation=el.animate(frames,{duration:ms,easing:'ease-in-out',fill:'forwards'});
  return animation.finished.catch(()=>{}).then(()=>animation.cancel());
 }
 function capture(state,side,action){
  const records={};for(const owner of ['p','e'])for(const c of [{id:'hq'},...state[owner].support,...state[owner].front]){
   const el=node(owner,c.id);if(el)records[key(owner,c.id)]={rect:rect(el),clone:el.cloneNode(true),card:c};
  }
  for(const owner of ['p','e'])for(const c of state[owner].hand){const el=handNode(owner,c.id);if(el)records[key(owner,c.id)]={rect:rect(el),clone:el.cloneNode(true),card:c};}
  const source=action.type==='play'?(side==='p'?doc.querySelector('#hand [data-card="'+action.id+'"]'):doc.querySelector('#enemyHand .card-back:last-child')):node(side,action.id);
  return {records,source,sourceRect:rect(source)};
 }
 function ghost(element,r){
  element.removeAttribute('id');element.removeAttribute('style');element.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  element.classList.remove('selected','unaffordable','drag-source','exhausted','targetable','guard-blocked','intercept-blocked');element.classList.add('fx-card');
  element.setAttribute('aria-hidden','true');element.tabIndex=-1;
  Object.assign(element.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});layer.appendChild(element);return element;
 }
 function label(text){caption.textContent=text;caption.hidden=!text;}
 function screenCard(maxWidth=152){const width=Math.max(96,Math.min(maxWidth,root.innerWidth*.28,root.innerHeight*.24)),height=width*1.44;return {left:(root.innerWidth-width)/2,top:(root.innerHeight-height)/2,width,height};}
 async function fly(el,from,to,ms){
  Object.assign(el.style,{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'});
  if(reduced())return animate(el,[{opacity:.4},{opacity:1}],Math.min(ms,300));
  return animate(el,[{transform:'translate('+(from.left-to.left)+'px,'+(from.top-to.top)+'px) scale('+(from.width/to.width)+','+(from.height/to.height)+')',opacity:.85},{transform:'none',opacity:1}],ms);
 }
 async function arrow(from,to,side,ms=640){
  if(!from||!to)return wait(ms);
  const bounded=r=>{const p=center(r);return {x:Math.max(22,Math.min(root.innerWidth-22,p.x)),y:Math.max(22,Math.min(root.innerHeight-22,p.y))};};
  const a=bounded(from),b=bounded(to),ns='http://www.w3.org/2000/svg';
  const svg=doc.createElementNS(ns,'svg');svg.classList.add('fx-arrow');svg.setAttribute('viewBox','0 0 '+root.innerWidth+' '+root.innerHeight);
  svg.setAttribute('preserveAspectRatio','none');
  const color=side==='e'?'#ff8b72':'#f1f5f7';
  svg.innerHTML='<defs><marker id="fxArrowHead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9Z" fill="'+color+'"/></marker></defs>';
  const line=doc.createElementNS(ns,'line');for(const [k,v] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:color,'stroke-width':4,'marker-end':'url(#fxArrowHead)'}))line.setAttribute(k,v);
  svg.appendChild(line);layer.appendChild(svg);const distance=Math.hypot(a.x-b.x,a.y-b.y);line.style.strokeDasharray=distance;
  if(!reduced())await animate(line,[{strokeDashoffset:distance},{strokeDashoffset:0}],220);
  await wait(ms);svg.remove();
 }
 const handNode=(side,id)=>doc.querySelector(side==='p'?'#hand [data-card="'+id+'"]':'#enemyHand [data-hand-id="'+id+'"]');
 const deckNode=side=>doc.getElementById(side==='p'?'playerDeck':'enemyDeck');
 function prepareDraws(events,destination=handNode){
  const arrivals=events.filter(e=>e.kind==='draw'||e.kind==='burn'&&e.fromDeck).map(event=>({event,element:event.kind==='draw'?destination(event.side,event.id):null}));
  arrivals.forEach(({element})=>hide(element));return arrivals;
 }
 async function drawCards(events,state,destination=handNode,prepared=null){
  const arrivals=prepared||prepareDraws(events,destination);
  await Promise.all(['p','e'].map(async side=>{
   for(const {event,element} of arrivals.filter(x=>x.event.side===side)){
    const from=rect(deckNode(side));if(!from)continue;
    const to=rect(element)||{...from,left:from.left-from.width*1.5,top:from.top+from.height*.3};
    const c=state[side].hand.find(c=>c.id===event.id),copy=ghost(c&&side==='p'?options.card(c):doc.createElement('div'),from);
    copy.classList.add('fx-face-down','fx-draw');copy.dataset.drawSide=side;copy.dataset.drawId=event.id;
    if(side==='p'&&c&&!reduced()){
     const mid={left:(from.left+to.left)/2,top:Math.min(from.top,to.top)-to.height*.22,width:to.width,height:to.height};
     await fly(copy,from,mid,220);
     await animate(copy,[{transform:'scaleX(1)'},{transform:'scaleX(0)'}],90);copy.classList.remove('fx-face-down');
     await animate(copy,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],100);
     await fly(copy,mid,to,250);
    }else await fly(copy,from,to,reduced()?160:520);
    if(event.kind==='burn')await animate(copy,[{opacity:1,filter:'brightness(1)'},{opacity:0,filter:'brightness(.2)',transform:'translateY(24px)'}],280);
    copy.remove();if(element)element.style.visibility='';
   }
  }));
 }
 async function returnCards(items){
  await Promise.all(items.map(async({side,element})=>{
   if(!element)return;const from=rect(element),to=rect(deckNode(side)),copy=ghost(element.cloneNode(true),from);hide(element);
   copy.classList.add('fx-face-down','fx-draw');await fly(copy,from,to,reduced()?160:420);copy.remove();
  }));
 }
 async function openingToHand(state){
  const destinations=state.p.hand.map(c=>handNode('p',c.id));destinations.forEach(hide);
  await Promise.all(state.p.hand.map(async(c,i)=>{
   const source=doc.querySelector('[data-opening-id="'+c.id+'"] .opening-face'),destination=destinations[i];if(!source||!destination)return;
   const from=rect(source),copy=ghost(options.card(c),from);hide(source);await wait(i*65);await fly(copy,from,rect(destination),reduced()?120:420);copy.remove();destination.style.visibility='';
  }));
 }
 async function before(ctx){
  label(options.describe(ctx));
  if(ctx.action.type==='play'){
   const from=ctx.sourceRect||screenCard(),order=ctx.card.t==='order';
   const to=screenCard(order?220:152);ctx.reveal=ghost(options.card(ctx.card),to);hide(ctx.source);
   ctx.reveal.dataset.presentation=order?'order':'unit';ctx.reveal.dataset.phase='reveal';
   if(ctx.side==='e')ctx.reveal.classList.add('fx-face-down');
   await fly(ctx.reveal,from,to,400);
   ctx.reveal.classList.remove('fx-face-down');options.sound(ctx.card);
   await wait(ctx.side==='e'?900:order?550:350);ctx.reveal.dataset.phase='target';
   for(const id of ctx.action.targets||[])await arrow(rect(ctx.reveal),rect(id==='hq'?node(ctx.side==='p'?'e':'p',id):node(ctx.side,id)||node(ctx.side==='p'?'e':'p',id)||handNode(ctx.side,id)),ctx.side,350);
   if(ctx.action.target)await arrow(rect(ctx.reveal),rect(node(ctx.side==='p'?'e':'p',ctx.action.target)),ctx.side,500);
  }else if(ctx.action.type==='attack'){
   const target=node(ctx.side==='p'?'e':'p',ctx.action.target),source=node(ctx.side,ctx.action.id);
   await arrow(rect(source),rect(target),ctx.side);
   if(source&&target&&!reduced()){
    const a=center(rect(source)),b=center(rect(target)),length=Math.hypot(b.x-a.x,b.y-a.y)||1;
    await animate(source,[{transform:'translate(0,0)'},{transform:'translate('+((b.x-a.x)/length*24)+'px,'+((b.y-a.y)/length*24)+'px)'},{transform:'translate(0,0)'}],240);
   }
  }else await wait(180);
 }
 async function after(ctx){
  const action=ctx.action;
  const draws=prepareDraws(ctx.result.events);
  const promotions=ctx.result.events.filter(e=>e.transition==='veteran');

  for(const event of promotions)hide(node(event.side,event.id));
  for(const event of promotions){
   const old=ctx.records[key(event.side,event.id)],destination=node(event.side,event.id);
   const card=[...ctx.next[event.side].support,...ctx.next[event.side].front].find(c=>c.id===event.id);
   if(!old||!destination||!card)continue;
   const copy=ghost(doc.createElement('div'),old.rect),to=screenCard(240);
   copy.classList.add('fx-transform');copy.dataset.transformId=event.id;copy.dataset.phase='lift';
   options.face(copy,old.card);
   await fly(copy,old.rect,to,340);
   copy.dataset.phase='turn';copy.style.transformOrigin='center center';
   await animate(copy,reduced()?[{opacity:1},{opacity:0}]:[{transform:'perspective(800px) rotateY(0deg)'},{transform:'perspective(800px) rotateY(90deg)'}],180);
   options.face(copy,card);copy.dataset.phase='upgraded';
   await animate(copy,reduced()?[{opacity:0},{opacity:1}]:[{transform:'perspective(800px) rotateY(-90deg)'},{transform:'perspective(800px) rotateY(0deg)'}],220);
   await wait(reduced()?120:400);copy.dataset.phase='return';copy.style.transformOrigin='top left';
   await fly(copy,to,rect(destination),340);copy.remove();destination.style.visibility='';
  }
  if(ctx.reveal){
   if(ctx.card.t!=='order'){
    const destination=node(ctx.side,action.id);if(destination){hide(destination);await fly(ctx.reveal,rect(ctx.reveal),rect(destination),540);destination.style.visibility='';}
   }else{
    ctx.reveal.dataset.phase='discard';const r=rect(ctx.reveal),dx=root.innerWidth-r.left+r.width;
    await animate(ctx.reveal,reduced()?[{opacity:1},{opacity:0}]:[{opacity:1,transform:'none'},{opacity:.8,offset:.6},{opacity:0,transform:'translate('+dx+'px,'+(root.innerHeight*.15)+'px) rotate(24deg) scale(.7)'}],reduced()?180:460);
   }
   ctx.reveal.remove();
  }

  for(const event of ctx.result.events.filter(e=>e.kind==='move'||e.kind==='retreat')){


   if(ctx.result.events.some(e=>e.transition==='veteran'&&e.side===event.side&&e.id===event.id))continue;
   const old=ctx.records[key(event.side,event.id)],destination=node(event.side,event.id);
   if(old&&destination){hide(destination);const copy=ghost(old.clone.cloneNode(true),old.rect);await fly(copy,old.rect,rect(destination),620);destination.style.visibility='';copy.remove();}
  }
  for(const event of ctx.result.events.filter(e=>e.kind==='battle')){
   const from=rect(node(event.side,event.id))||ctx.records[key(event.side,event.id)]?.rect,to=rect(node(event.targetSide,event.target))||ctx.records[key(event.targetSide,event.target)]?.rect;
   if(from&&to)await arrow(from,to,event.side,400);
  }
  const effects=[];
  for(const event of ctx.result.events){
   const current=node(event.side,event.id),record=ctx.records[key(event.side,event.id)],r=rect(current)||record?.rect;
   if(!r)continue;
   if(event.kind==='discard'&&record){const card=ghost(record.clone.cloneNode(true),record.rect);effects.push(animate(card,[{opacity:1},{opacity:0,transform:reduced()?'none':'translateY(80px) rotate(15deg)'}],350).then(()=>card.remove()));}
   if(event.kind==='spawn'&&current)effects.push(animate(current,[{opacity:0,transform:'scale(.7)'},{opacity:1,transform:'scale(1)'}],450));
   if(['damage','heal','buff'].includes(event.kind)){
    const number=doc.createElement('div');number.className='fx-number '+(event.kind==='damage'?'damage':'healing');number.textContent=(event.kind==='damage'?'−':'+')+event.amount+(event.kind==='buff'&&!event.defenseOnly?'+'+event.amount:event.defenseOnly?' DEF':'');
    const p=center(r);Object.assign(number.style,{left:p.x+'px',top:p.y+'px'});layer.appendChild(number);
    effects.push(animate(number,[{opacity:0,transform:'translate(-50%,0)'},{opacity:1,offset:.2,transform:'translate(-50%,-12px)'},{opacity:0,transform:'translate(-50%,-38px)'}],750).then(()=>number.remove()));
    if(current)effects.push(animate(current,[{filter:'brightness(1)'},{filter:'brightness(1.65)',offset:.3},{filter:'brightness(1)'}],400));
   }
   if(event.kind==='destroy'&&record){
    const copy=ghost(record.clone.cloneNode(true),record.rect);
    effects.push(animate(copy,[{opacity:1},{opacity:0,transform:reduced()?'none':'scale(.8) rotate(8deg)'}],650).then(()=>copy.remove()));
   }
  }
  await Promise.all(effects);
  await drawCards(ctx.result.events,ctx.next,handNode,draws);
  if(!effects.length)await wait(200);
 }
 async function explode(side){
  const hq=node(side,'hq'),r=rect(hq);if(!hq)return;
  hide(hq);options.blastSound?.();
  if(reduced()){
   const copy=ghost(hq.cloneNode(true),r);await animate(copy,[{opacity:1,filter:'brightness(1)'},{opacity:.6,filter:'brightness(.25) grayscale(1)',offset:.4},{opacity:0,filter:'brightness(.1) grayscale(1)'}],950);copy.remove();
  }else{
   const pieces=[root.LongTelegramBlast.play(root,layer,r)],copy=ghost(hq.cloneNode(true),r);copy.style.transformOrigin='center center';
   pieces.push(animate(copy,[{opacity:1,transform:'none',filter:'brightness(1.25)'},{opacity:.6,offset:.2,transform:'translateY(4px) scale(.96)',filter:'brightness(.3) sepia(.6)'},{opacity:0,transform:'translateY(14px) scale(.8)',filter:'brightness(.1) grayscale(1)'}],650).then(()=>copy.remove()));
   const stage=doc.getElementById('game');if(stage)pieces.push(animate(stage,[{translate:'0 0'},{translate:'-4px 2px',offset:.12},{translate:'5px -3px',offset:.24},{translate:'-3px 1px',offset:.42},{translate:'2px 0',offset:.6},{translate:'0 0'}],420));
   await Promise.all(pieces);
  }
  await wait(150);
 }
 async function prepareFinale(ctx){options.beginFinale?.(ctx);await wait(1000);}
 async function finale(ctx){
  label(options.destroyedLabel(ctx));
  await Promise.all(['p','e'].filter(side=>ctx.next[side].hp<=0).map(explode));
 }
 function cleanup(){for(const [el,value] of hidden)el.style.visibility=value;hidden=[];layer.replaceChildren();label('');}
 return {capture,before,after,prepareFinale,finale,cleanup,drawCards,returnCards,openingToHand};
}
return {createSequencer,create};
});
