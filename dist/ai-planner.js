
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramAI=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const units=q=>[...q.support,...q.front];
const copyCard=c=>({...c,kw:[...(c.kw||[])],...(c.suppressedIcons?{suppressedIcons:[...c.suppressedIcons]}:{})});
function clone(s){
 const out={...s,history:[]};
 for(const side of ['p','e']){
  const q=s[side];out[side]={...q,hand:q.hand.map(copyCard),support:q.support.map(copyCard),front:q.front.map(copyCard),deck:q.deck.slice(),graveyard:q.graveyard.slice()};
 }
 return out;
}
function visibleState(s,side,E){
 const out=clone(s);

 out.randomState=0x6d2b79f5;
 for(const who of ['p','e']){
  const q=out[who];delete q.deckPlan;


  const orders=who===side?q.deck.filter(c=>c.t==='order').length:0,tanks=who===side?q.deck.filter(c=>c.t==='tank').length:0,air=who===side?q.deck.filter(c=>['fighter','bomber'].includes(c.t)).length:0;
  q.deck=Array.from({length:q.deck.length},(_,i)=>({id:'unknown-deck-'+who+i,unknown:true,t:i<orders?'order':i<orders+tanks?'tank':i<orders+tanks+air?'fighter':'unknown',c:99,kw:[]}));
  if(who!==side)q.hand=q.hand.map((_,i)=>({id:'unknown-hand-'+i,unknown:true,t:'unknown',c:99,kw:[]}));
 }
 return out;
}
function material(u,E,s){
 return 2+(u.a+E.bomberBonus(s,u))*1.65+Math.min(u.h,12)*.95+Math.min(u.c,8)*.45+
  (u.pinned?-4:0)+(E.longRange(u)?3:0)+(u.kw.includes('guard')?2:0)+
  (u.enemyAirOperationDamage?3:0)+(u.combatDiscardOrder?3:0)+(u.fighterDeployCopy?5:0)+(u.friendlyTankFight?4:0)+(u.combatOperationDiscount?3:0)+(u.retreatGrowth?3:0)+(u.kw.includes('fury')?3:0)+(u.tankArmor?3:0)+(u.noCounter?1:0)+(u.kw.includes('shock')?2:0)+(u.kw.includes('smokescreen')?2:0)+
  (u.kw.includes('ambush')&&!u.ambushUsed?3:0)+(u.veteranForm&&!u.veteran?2:0)+
  E.armorValue(u,s)*2.5+(u.destruction==='destroyKiller'?4:u.destruction==='drawTank'||u.destruction==='generate'?2:0);
}
function incoming(s,side,E){
 s={...s,groundAttackPenalty:0};
 const enemy=E.other(side),q=s[enemy],defender=s[side];
 const protectedHq=E.guardSources(s,side,'support','hq').length>0;
 const intercepted=defender.support.some(u=>u.t==='fighter');
 const shots=[];
 for(const u of units(q)){
  if(u.pinned)continue;
  if(protectedHq&&!E.ignoresGuard(u)||intercepted&&u.t==='bomber')continue;
  const inFront=q.front.includes(u);let cost=E.operationCost(s,enemy,{...u,combatTurnOpBonus:0},'attack');
  if(!E.longRange(u)&&!inFront){
   if(u.t!=='tank'||defender.front.length||q.front.length>=5)continue;
   cost+=E.operationCost(s,enemy,{...u,combatTurnOpBonus:0},'move');
  }
  shots.push({damage:E.attackValue(u,null,{},s),cost:Math.max(0,cost)});
  if(u.kw.includes('fury'))shots.push({damage:E.attackValue(u,null,{},s),cost:Math.max(0,E.operationCost(s,enemy,{...u,combatTurnOpBonus:0},'attack'))});
 }
 shots.sort((a,b)=>b.damage/Math.max(.5,b.cost)-a.damage/Math.max(.5,a.cost));
 let budget=Math.min(12,q.maxK+1)+(q.pendingKredits||0),damage=0;
 for(const shot of shots)if(shot.cost<=budget){budget-=shot.cost;damage+=shot.damage;}
 return damage;
}
function evaluate(s,side,E){
 if(s.over)return s.winner===side?1e6:s.winner===E.other(side)?-1e6:0;
 const q=s[side],op=s[E.other(side)];let score=0;
 const hpValue=hp=>Math.min(25,hp)*1.65+Math.max(0,hp-25)*.2;
 score+=hpValue(q.hp)-hpValue(op.hp)*1.1;
 for(const who of [side,E.other(side)]){
  const owner=s[who],sign=who===side?1:-1;
  for(const u of units(owner)){
   let value=material(u,E,s);
   if(owner.front.includes(u))value+=u.t==='tank'?5:u.t==='infantry'?3.5:.5;
   else if(E.longRange(u))value+=1;
   if(who===side&&!E.activityError(s,side,u,'attack'))value+=.45*(u.tempAttack||0)+.8;
   value+=E.guardSources(s,who,owner.front.includes(u)?'front':'support',u.id).length?1.25:0;
   score+=sign*value;
  }
  score+=sign*owner.hand.length*3.8;
  score+=sign*E.guardSources(s,who,'support','hq').length*3;
 }
 score+=((q.pendingKredits||0)-(op.pendingKredits||0))*.9+q.k*.18+(q.maxK-op.maxK)*2.6;
 const threat=incoming(s,side,E);
 score-=threat*2.2;
 if(threat>=q.hp)score-=50000;
 else if(q.hp-threat<5)score-=(5-q.hp+threat)*7;
 return score;
}
function candidates(s,side,E){
 const options=[],q=s[side],enemy=s[E.other(side)];
 for(const u of units(q)){
  for(const target of E.legalAttacks(s,side,u.id))for(const boost of u.key==='t54a'?[false,true]:[false]){
   const action={type:'attack',id:u.id,target,boost};if(E.attackError(s,side,u.id,target,action))continue;
   const d=E.loc(s,E.other(side),target)?.u,damage=E.combatDamage(E.attackValue(u,d,action,s),d,s);
   const priority=target==='hq'?(damage>=enemy.hp?1e6:35+damage):25+Math.min(d.h,damage)*2+(damage>=d.h?material(d,E,s):0)-(E.combatDamage(E.retaliation(u,d,s),u,s)>=u.h?material(u,E,s)*.6:0);
   options.push({action,priority,family:'attack:'+u.id+':'+target});
  }
  if(!E.moveError(s,side,u.id))for(let gap=0;gap<=q.front.length;gap++)options.push({action:{type:'move',id:u.id,gap},priority:u.t==='tank'?31:q.support.length===4?28:18,family:'move:'+u.id});
 }
 for(const c of q.hand){
  if(c.unknown)continue;
  for(const base of E.playActions(s,side,c)){
   if(['buff','nato'].includes(c.fx)&&!units(q).length||c.fx==='airbuff'&&!units(q).some(u=>['fighter','bomber'].includes(u.t)))continue;
   if(c.fx==='assault'&&!units(q).some(u=>u.t!=='fighter'&&u.t!=='bomber'&&!E.activityError(s,side,u,'attack')))continue;
   if(['draw','marshall'].includes(c.fx)&&E.handCount(q)>7)continue;
   const handValue=c.fx==='searchAndDestroy'?(base.targets||[]).reduce((sum,id)=>sum+material(q.hand.find(u=>u.id===id),E),0):0;
   const priority=c.fx==='searchAndDestroy'?30+handValue:c.fx==='strike'?45:c.t!=='order'?27+c.c:30;
   const gaps=c.t==='order'?[null]:Array.from({length:q.support.length+2},(_,i)=>i);
   for(const gap of gaps)options.push({action:gap===null?base:{...base,gap},priority,family:'play:'+c.id+':'+(base.target||'')+':'+(base.targets||[]).join(',')+':'+(base.choice||'')});
  }
 }
 options.sort((a,b)=>b.priority-a.priority);

 const seen=new Set(),first=[],rest=[];
 for(const item of options){if(seen.has(item.family))rest.push(item);else{seen.add(item.family);first.push(item);}}
 return [...first,...rest];
}
function simulate(s,side,action,E){const next=clone(s);return E.act(next,side,action,{record:false}).ok?next:null;}
function replyRisk(s,side,E){
 if(s.over)return s.winner===side?0:50000;
 const reply=clone(s),enemy=E.other(side);reply.turn=enemy;
 for(const who of ['p','e'])for(const u of units(reply[who]))delete u.combatTurnOpBonus;
 delete reply.groundAttackPenalty;const q=reply[enemy];q.k=Math.min(12,q.maxK+1)+(q.pendingKredits||0);q.pendingKredits=0;q.hand=[];
  E.readyUnits(reply,enemy);
 for(const u of units(reply[side]))for(const key of ['tempAttack','opBonus','extraActions','fury','locked','freeAction','freeOperations','freeMove','stavka','tempBlitz'])delete u[key];
 let state=reply;

 for(let step=0;step<7&&!state.over;step++){
  let best=null;
  for(const {action} of candidates(state,enemy,E).slice(0,32)){
   const next=simulate(state,enemy,action,E);if(!next)continue;
   const target=action.target&&E.loc(state,side,action.target)?.u;
   const protects=target&&(E.guardSources(state,side,'support','hq').some(u=>u.id===target.id)||target.t==='fighter'&&state[side].support.includes(target));
   let value=(state[side].hp-next[side].hp)*8;
   if(target&&!E.loc(next,side,target.id))value+=material(target,E,state)+(protects?32:0);
   if(action.type==='move')value+=E.loc(state,enemy,action.id).u.t==='tank'?12:1;
   if(next.over&&next.winner===enemy)value=1e6;
   if(!best||value>best.value)best={state:next,value};
  }
  if(!best||best.value<=0)break;state=best.state;
 }
 if(state.over&&state.winner===enemy)return 60000;
 return Math.max(0,s[side].hp-state[side].hp)*1.2;
}
function choose(s,side,E,{width=8,depth=6,nodeBudget=1000}={}){
 if(s.over||s.turn!==side)return null;
 const root=visibleState(s,side,E),baseline=evaluate(root,side,E);
 let beam=[{state:root,score:baseline,first:{type:'end'},depth:0}],finalists=[beam[0]],visited=0;
 for(let level=0;level<depth&&beam.length&&visited<nodeBudget;level++){
  const nextBeam=[];
  for(const node of beam){
   const actions=candidates(node.state,side,E);
   const limit=level===0?72:20;
   for(const {action} of actions.slice(0,limit)){
    if(visited++>=nodeBudget)break;
    const next=simulate(node.state,side,action,E);if(!next)continue;
    const first=level===0?action:node.first;
    if(next.over&&next.winner===side)return first;
    const entry={state:next,first,score:evaluate(next,side,E)-.08*(level+1),depth:level+1};
    nextBeam.push(entry);
   }
  }
  nextBeam.sort((a,b)=>b.score-a.score);


  const counts=new Map();beam=[];
  for(const node of nextBeam){const key=JSON.stringify(node.first),n=counts.get(key)||0;if(n>=3)continue;counts.set(key,n+1);beam.push(node);if(beam.length===width)break;}
  finalists.push(...beam);
 }
 finalists.sort((a,b)=>b.score-a.score);
 const seen=new Set(),choices=[];
 for(const node of finalists){const key=JSON.stringify(node.first);if(seen.has(key))continue;seen.add(key);choices.push(node);if(choices.length===8)break;}
 for(const node of choices)node.score-=replyRisk(node.state,side,E);
 choices.sort((a,b)=>b.score-a.score);
 return choices[0]?.first||{type:'end'};
}
return {choose};
});
