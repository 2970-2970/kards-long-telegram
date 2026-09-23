const assert=require('node:assert/strict');
const E=require('../dist/engine');
const costs={rifles16:3,guards68:5,rifles17:3,rifles92:1,cavalry11:2,rifles276:1,guards6:5};
const infantry=E.LIB.soviet.filter(c=>c.t==='infantry');
assert.equal(infantry.length,6);
for(const c of infantry)assert.equal(c.c,costs[c.key]);
assert.deepEqual(E.LIB.p.filter(c=>c.t==='infantry').map(c=>c.c),[1,1,2,3,5,3]);
for(const faction of E.MAIN_NATIONS.filter(E.mainReady)){
  const s=E.createGame(()=>.4,faction);
  for(const side of ['p','e']){
    assert.equal(s[side].deck.length+s[side].hand.length,39);
    if(s[side].faction==='ussr')for(const c of [...s[side].deck,...s[side].hand].filter(c=>c.t==='infantry'))assert.equal(c.c,costs[c.key]);
  }
}
function unit(key){return E.card(E.LIB.soviet.find(c=>c.key===key))}
const s=E.createGame(()=>.4);s.p.k=0;s.p.support=[];
const tank=unit('rifles92');s.p.front=[tank];
assert.equal(E.operationCost(s,'p',tank,'attack'),0);
assert.equal(E.act(s,'p',{type:'attack',id:tank.id,target:'hq'}).ok,true);
assert.equal(s.p.k,0);assert.equal(s.e.hp,18);
assert.ok(E.attackError(s,'p',tank.id,'hq'),'Zero-cost attack must still consume its attack');
const healer=E.createGame(()=>.4);healer.p.k=10;healer.p.hp=19;
for(const expected of [23,27,31]){
  const c=E.card(E.LIB.e.find(c=>c.fx==='heal'));healer.p.hand=[c];
  assert.equal(E.act(healer,'p',{type:'play',id:c.id}).ok,true);
  assert.equal(healer.p.hp,expected);
  assert.equal(healer.history.at(-1).events.find(e=>e.kind==='heal').amount,4);
  assert.equal(healer.history.at(-1).after.p.hp,expected);
}
console.log('PASS Soviet infantry costs, zero-cost actions and uncapped HQ healing');
