'use strict';
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');

function fresh(){
  const s=E.createGame(()=>0.37);
  for(const side of ['p','e']){
    Object.assign(s[side],{hp:20,k:20,maxK:20,deck:[],hand:[],support:[],front:[],hqIndex:0,fatigue:0});
  }
  s.turn='p';s.over=false;s.winner=null;
  return s;
}
function putHand(s,side,index){const c=E.card((side==='p'&&[1,4].includes(index)?E.LIB.e[index]:E.LIB[side][index]));s[side].hand.push(c);return c}
function put(s,side,zone,index,extra={}){const c=Object.assign(E.card((side==='p'&&[1,4].includes(index)?E.LIB.e[index]:E.LIB[side][index])),extra);s[side][zone].push(c);return c}
function ok(result){assert.equal(result.ok,true,result.error)}

{
  const s=E.createGame(()=>0.4);
  assert.equal(s.p.hand.length,5);assert.equal(s.e.hand.length,5);
  assert.equal(s.p.deck.length,34);assert.equal(s.e.deck.length,34);
  assert.equal(s.p.k,1);assert.equal(s.p.maxK,1);
}

{
  const s=fresh();
  const a=putHand(s,'p',0),b=putHand(s,'p',2),c=putHand(s,'p',1),d=putHand(s,'p',4);
  ok(E.act(s,'p',{type:'play',id:a.id,gap:0}));
  ok(E.act(s,'p',{type:'play',id:b.id,gap:1,targets:[a.id]}));
  ok(E.act(s,'p',{type:'play',id:c.id,gap:2}));
  ok(E.act(s,'p',{type:'play',id:d.id,gap:4}));
  assert.deepEqual(E.row(s,'p','support').map(x=>x.id),[a.id,b.id,c.id,'hq',d.id]);
}

{
  const s=fresh(),guard=put(s,'e','support',0),left=put(s,'e','support',2),far=put(s,'e','support',3);
  s.e.support=[left,guard,far];s.e.hqIndex=0;
  assert.deepEqual(E.guardSources(s,'e','support',left.id).map(x=>x.id),[guard.id]);
  assert.deepEqual(E.guardSources(s,'e','support',far.id).map(x=>x.id),[guard.id]);
  assert.equal(E.guardSources(s,'e','support','hq').length,0);
}

{
  const s=fresh(),blitz=putHand(s,'p',1),enemy=put(s,'e','front',2);
  ok(E.act(s,'p',{type:'play',id:blitz.id,gap:0}));
  assert.equal(E.attackError(s,'p',blitz.id,enemy.id),'');
  ok(E.act(s,'p',{type:'attack',id:blitz.id,target:enemy.id}));
  assert.equal(blitz.attacked,true);
}

{
  const s=fresh(),ordinary=putHand(s,'p',2),enemy=put(s,'e','front',2);
  ok(E.act(s,'p',{type:'play',id:ordinary.id,gap:0}));
  assert.match(E.attackError(s,'p',ordinary.id,enemy.id),/等待下一回合/);
}

{
  const s=fresh(),tank=put(s,'p','support',2),enemy=put(s,'e','support',2);
  ok(E.act(s,'p',{type:'move',id:tank.id}));
  assert.equal(E.attackError(s,'p',tank.id,enemy.id),'');
  ok(E.act(s,'p',{type:'attack',id:tank.id,target:enemy.id}));
  assert.equal(tank.attacked,true);
}

{
  const s=fresh(),gun=put(s,'p','support',4),enemy=put(s,'e','support',2);
  const gunHp=gun.h;
  ok(E.act(s,'p',{type:'attack',id:gun.id,target:enemy.id}));
  assert.equal(gun.h,gunHp,'炮兵攻击不受反击');
  gun.attacked=false;s.p.k=20;
  ok(E.act(s,'p',{type:'attack',id:gun.id,target:'hq'}));
  assert.equal(s.e.hp,16,'炮兵可直接打击总部');
}

{
  const s=fresh(),guard=put(s,'e','support',0),hqNeighbor=put(s,'e','support',2);
  s.e.support=[guard,hqNeighbor];s.e.hqIndex=0;
  const infantry=put(s,'p','front',2),gun=put(s,'p','support',4);
  assert.match(E.attackError(s,'p',infantry.id,'hq'),/守卫/);
  assert.equal(E.attackError(s,'p',gun.id,'hq'),'','炮兵无视守卫');
}

{
  const s=fresh();s.p.deck=[E.card(E.LIB.p[2])];s.e.deck=[E.card(E.LIB.e[2])];
  ok(E.act(s,'p',{type:'end'}));assert.equal(s.turn,'e');assert.equal(s.e.hand.length,1);
  ok(E.act(s,'e',{type:'end'}));assert.equal(s.turn,'p');assert.equal(s.p.hand.length,1);
}

{
  const s=fresh();s.turn='e';s.e.k=12;s.e.maxK=12;
  for(let i=0;i<9;i++)putHand(s,'e',i%8);
  for(let n=0;n<80&&s.turn==='e'&&!s.over;n++){
    const action=E.chooseAI(s,'e');assert.ok(action,'AI must choose an action');
    const result=E.act(s,'e',action);ok(result);assert.ok(s.e.k>=0,'AI cannot overspend');
  }
  assert.equal(s.turn,'p','AI eventually ends its turn');
}


for(const faction of E.MAIN_NATIONS.filter(E.mainReady)){
  const s=E.createGame(()=>0.4,faction);
  assert.equal(s.p.faction,faction);
  assert.equal(s.e.faction,E.opponentDeck(s.p.deckPlan).main);
  for(const side of ['p','e']){
    assert.equal(s[side].hand.length+s[side].deck.length,39);
    assert.equal(s[side].deckSize,40);
    const pool=E.catalog(s[side].faction,s[side].ally).map(c=>c.n);
    for(const c of [...s[side].deck,...s[side].hand]){
      assert.ok([s[side].faction,s[side].ally].includes(c.faction));assert.ok(pool.includes(c.n));
    }
  }
  assert.equal(s.turn,'p');assert.equal(s.p.k,1);
}


{
  const s=fresh(),bomber=put(s,'p','support',7),fighter=put(s,'e','support',5,{sleeping:true}),guard=put(s,'e','support',0);
  assert.match(E.attackError(s,'p',bomber.id,'hq'),/战斗机拦截/);
  assert.match(E.attackError(s,'p',bomber.id,guard.id),/战斗机拦截/);
  assert.equal(E.attackError(s,'p',bomber.id,fighter.id),'');
  const before=s.p.k,defense=bomber.h;
  assert.equal(E.act(s,'p',{type:'attack',id:bomber.id,target:'hq'}).ok,false);
  assert.equal(s.p.k,before);assert.equal(bomber.attacked,false);
  ok(E.act(s,'p',{type:'attack',id:bomber.id,target:fighter.id}));
  assert.equal(bomber.h,defense-E.combatDamage(fighter.a,bomber,s),'fighter retaliates against a bomber');
  bomber.attacked=false;
  assert.equal(E.attackError(s,'p',bomber.id,'hq'),'','interception ends when fighter is destroyed; bomber ignores guard');
}


{
  const s=fresh(),bomber=put(s,'p','support',7),fighter=put(s,'p','support',5),gun=put(s,'p','support',4);
  put(s,'e','support',5);const front=put(s,'e','front',2);
  assert.equal(E.attackError(s,'p',bomber.id,front.id),'');
  assert.equal(E.attackError(s,'p',fighter.id,'hq'),'');
  assert.equal(E.attackError(s,'p',gun.id,'hq'),'');
}


for(const index of [0,2,4,5,7]){
  const s=fresh(),attacker=put(s,'p','front',index),bomber=put(s,'e','support',7),before=attacker.h;
  ok(E.act(s,'p',{type:'attack',id:attacker.id,target:bomber.id}));
  assert.equal(attacker.h,before);
}

console.log('KARDS: Long Telegram engine regression tests passed (deployment, combat, factions, interception)');


{
  const s=fresh(),unit=putHand(s,'p',1),enemy=put(s,'e','front',2);
  const beforeCount=s.history.length;
  assert.equal(E.act(s,'p',{type:'attack',id:'missing',target:'hq'}).ok,false);
  assert.equal(s.history.length,beforeCount,'rejected actions must not be recorded');
  ok(E.act(s,'p',{type:'play',id:unit.id,gap:0}));
  const first=s.history[0],copy=JSON.stringify(first);
  assert.equal(first.cost,3);assert.equal(first.before.p.support.length,1);
  assert.equal(first.after.p.support[0].n,unit.n);assert.equal(first.after.p.k,17);
  assert.equal(first.before.p.hand,undefined);assert.equal(first.before.e.deck,undefined);
  ok(E.act(s,'p',{type:'attack',id:unit.id,target:enemy.id}));
  const second=s.history[1];assert.ok(second.summary.includes(unit.n));
  assert.ok(second.events.some(e=>e.kind==='damage'));
  assert.ok(second.events.some(e=>e.kind==='destroy'&&e.id===unit.id));
  assert.equal(JSON.stringify(first),copy,'later actions cannot change past snapshots');
  ok(E.act(s,'p',{type:'end'}));
  assert.equal(s.history[2].side,'p');assert.equal(s.history[2].before.turn,'p');
  assert.equal(s.history[2].after.turn,'e');assert.equal(s.history[2].cost,0);
}
{
  const s=fresh();s.turn='e';const order=putHand(s,'e',9);
  s.e.deck=[E.card(E.LIB.e[7]),E.card(E.LIB.e[3])];
  ok(E.act(s,'e',{type:'play',id:order.id}));
  assert.equal(s.history[0].events.filter(e=>e.kind==='draw').length,2);
  const log=JSON.stringify(s.history);
  assert.ok(!log.includes('TU-95'));assert.ok(!log.includes('T-62'));
}
console.log('45-card decks and public action history tests passed');
