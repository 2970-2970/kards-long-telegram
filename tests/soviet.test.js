const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const templates=Object.fromEntries([...E.LIB.soviet,...require('./fixtures/legacy-soviet.json')].filter(c=>c.key).map(c=>[c.key,c]));
function game(){const s=E.createGame(()=>.42);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:[],support:[],front:[],hqIndex:0,k:30,maxK:12,graveyard:[]});return s;}
function hand(s,key){const c=E.card(templates[key]);s.p.hand.push(c);return c;}
function unit(s,key,zone='support',side='p',patch={}){const c=Object.assign(E.card(templates[key]||E.LIB.p[key]),patch);s[side][zone].push(c);return c;}
function ok(s,a,side='p'){const r=E.act(s,side,a);assert.equal(r.ok,true,r.error);return r;}
function play(s,c,options={}){return ok(s,{type:'play',id:c.id,...options});}
function test(name,fn){fn();console.log('PASS '+name);}
test('PT-76 draw and operation surcharge last only this turn',()=>{
  const s=game(),c=hand(s,'pt76');s.p.deck=[E.card(templates.ammo)];play(s,c);ok(s,{type:'move',id:c.id});
  assert.equal(s.p.hand.length,1);assert.equal(E.operationCost(s,'p',c,'attack'),2);ok(s,{type:'end'});assert.equal(c.opBonus,undefined);
});
test('T-54A optional firepower charges 1 K and deals +2',()=>{
  const s=game(),t=unit(s,'t54a','front'),enemy=unit(s,0,'support','e',{a:0,h:7});s.p.k=2;
  assert.equal(E.act(s,'p',{type:'attack',id:t.id,target:enemy.id,boost:true}).ok,false);assert.equal(enemy.h,7);
  s.p.k=3;ok(s,{type:'attack',id:t.id,target:enemy.id,boost:true});assert.equal(s.p.k,0);assert.equal(s.e.support.length,0);assert.equal(s.history.at(-1).cost,3);
});
test('T-62 anti-tank bonus and post-combat repair',()=>{
  const s=game(),t=unit(s,'t62','front','p',{h:4}),enemy=unit(s,'t54a','support','e',{a:1,h:8});
  ok(s,{type:'attack',id:t.id,target:enemy.id});assert.equal(s.e.support.length,0);assert.equal(t.h,4);
});
test('T-72 first stationary attack discount',()=>{
  const s=game(),t=unit(s,'t72','front');assert.equal(E.operationCost(s,'p',t,'attack'),1);
  ok(s,{type:'attack',id:t.id,target:'hq'});assert.equal(s.p.k,29);assert.equal(E.operationCost(s,'p',t,'attack'),2);
  t.attacked=false;t.moved=true;assert.equal(E.operationCost(s,'p',t,'attack'),2);
});
test('T-80U optional Fury permits two attacks and expires',()=>{
  const s=game(),c=hand(s,'t80');s.p.k=20;s.e.hp=40;play(s,c,{boost:true});assert.equal(s.p.k,10);assert.equal(c.fury,true);
  ok(s,{type:'move',id:c.id});ok(s,{type:'attack',id:c.id,target:'hq'});ok(s,{type:'attack',id:c.id,target:'hq'});
  assert.equal(s.e.hp,22);assert.equal(s.p.k,1);assert.ok(E.attackError(s,'p',c.id,'hq'));ok(s,{type:'end'});assert.equal(c.fury,undefined);
});
test('Reserve Ammunition adds exactly one action with a surcharge',()=>{
  const s=game(),t=unit(s,'t54a','front');ok(s,{type:'attack',id:t.id,target:'hq'});const c=hand(s,'ammo');play(s,c,{targets:[t.id]});
  assert.equal(E.operationCost(s,'p',t,'attack'),3);const before=s.p.k;
  ok(s,{type:'attack',id:t.id,target:'hq'});assert.equal(s.p.k,before-3);assert.equal(t.extraActions,0);assert.ok(E.attackError(s,'p',t.id,'hq'));
});
test('Recovery skips Elite tanks and creates a clean +1-cost copy',()=>{
  const s=game(),t=unit(s,'t54a','front','p',{a:12,h:1});unit(s,0,'support','e',{a:2,h:20});
  ok(s,{type:'attack',id:t.id,target:s.e.support[0].id});assert.equal(s.p.graveyard[0].key,'t54a');
  s.p.graveyard.push({...templates.t80});const c=hand(s,'repair');play(s,c);const r=s.p.hand[0];
  assert.equal(r.key,'t54a');assert.equal(r.c,5);assert.equal(r.a,5);assert.equal(r.h,5);assert.notEqual(r.id,t.id);
});
test('Concentrated Support has ordered distinct targets and one-shot protection',()=>{
  const s=game(),a=unit(s,'pt76'),b=unit(s,'t54a','front'),enemy=unit(s,0,'support','e',{h:20,a:10}),c=hand(s,'support');
  assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[a.id,a.id]}).ok,false);
  play(s,c,{targets:[a.id,b.id]});assert.ok(E.moveError(s,'p',a.id));
  ok(s,{type:'attack',id:b.id,target:enemy.id});assert.equal(b.h,5);assert.equal(b.noCounter,false);
  ok(s,{type:'end'});assert.equal(a.locked,undefined);
});
test('Second Echelon withdraws and grants Blitz plus a free move',()=>{
  const s=game(),a=unit(s,'t62','front'),b=unit(s,'rifles17','support','p',{sleeping:true}),c=hand(s,'echelon');
  play(s,c,{targets:[a.id,b.id]});assert.equal(E.loc(s,'p',a.id).zone,'support');assert.equal(b.sleeping,false);
  assert.equal(E.operationCost(s,'p',b,'move'),0);const k=s.p.k;ok(s,{type:'move',id:b.id});assert.equal(s.p.k,k);assert.equal(b.freeMove,false);
});
test('Second Echelon fails atomically when support is full',()=>{
  const s=game(),a=unit(s,'t62','front');for(let i=0;i<4;i++)unit(s,'pt76');const c=hand(s,'echelon'),before=JSON.stringify(s);
  assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[a.id,s.p.support[0].id]}).ok,false);assert.equal(JSON.stringify(s),before);
});
test('Stavka restores, pays for one action and draws on kill',()=>{
  const s=game(),t=unit(s,'t72','front','p',{h:2}),c=hand(s,'stavka');s.p.deck=[E.card(templates.ammo)];
  const enemy=unit(s,0,'support','e',{a:0,h:3});play(s,c,{targets:[t.id]});assert.equal(t.h,7);assert.equal(E.operationCost(s,'p',t,'attack'),0);
  const before=s.p.k;ok(s,{type:'attack',id:t.id,target:enemy.id});assert.equal(s.p.k,before);assert.equal(s.p.hand.length,1);assert.equal(t.freeAction,false);
});
test('Grad splashes only neighbors of frontline targets',()=>{
  const s=game(),gun=unit(s,'grad'),left=unit(s,0,'front','e',{h:1}),middle=unit(s,0,'front','e',{h:4}),right=unit(s,0,'front','e',{h:1});
  ok(s,{type:'attack',id:gun.id,target:middle.id});assert.deepEqual(s.e.front.map(x=>x.id),[middle.id]);assert.equal(middle.h,1);assert.equal(gun.h,5);
});
test('Pion uses supplied stats and normal artillery rules',()=>{
  const s=game(),gun=unit(s,'pion');ok(s,{type:'attack',id:gun.id,target:'hq'});assert.equal(s.e.hp,15);assert.equal(s.p.k,26);assert.equal(gun.h,7);
});
test('AI completes games legally with both faction assignments',()=>{
  for(const faction of E.MAIN_NATIONS.filter(E.mainReady)){
    const s=E.createGame(()=>.43,faction);
    for(let i=0;i<650&&!s.over;i++){
      const side=s.turn,a=E.chooseAI(s,side);ok(s,a,side);assert.ok(s[side].k>=0);
      assert.ok(s[side].support.length<=4);assert.ok(s[side].front.length<=5);
    }
    assert.equal(s.over,true);
  }
});
test('Turn-limited tokens expire while unused no-retaliation protection persists',()=>{
  const s=game(),a=unit(s,'t72','front'),b=unit(s,'t62');a.attacked=true;a.attacks=1;
  play(s,hand(s,'ammo'),{targets:[a.id]});play(s,hand(s,'support'),{targets:[b.id,a.id]});
  play(s,hand(s,'stavka'),{targets:[a.id]});assert.equal(E.operationCost(s,'p',a,'attack'),0);
  ok(s,{type:'end'});assert.equal(a.extraActions,undefined);assert.equal(a.freeAction,undefined);assert.equal(a.stavka,undefined);assert.equal(a.noCounter,true);assert.equal(b.locked,undefined);
});
test('Simultaneous combat cannot revive a dead T-62 through its repair trigger',()=>{
  const s=game(),t=unit(s,'t62','front','p',{h:1}),enemy=unit(s,'t54a','support','e',{a:1,h:8});
  ok(s,{type:'attack',id:t.id,target:enemy.id});assert.equal(s.p.front.length,0);assert.equal(s.e.support.length,0);
});
test('Fury and Reserve Ammunition consume the extra token only after normal attacks',()=>{
  const s=game(),t=unit(s,'t80','front','p',{fury:true});s.e.hp=60;
  ok(s,{type:'attack',id:t.id,target:'hq'});play(s,hand(s,'ammo'),{targets:[t.id]});
  assert.equal(E.operationCost(s,'p',t,'attack'),3);ok(s,{type:'attack',id:t.id,target:'hq'});assert.equal(t.extraActions,1);
  assert.equal(E.operationCost(s,'p',t,'attack'),4);ok(s,{type:'attack',id:t.id,target:'hq'});assert.equal(t.extraActions,0);assert.ok(E.attackError(s,'p',t.id,'hq'));
});
