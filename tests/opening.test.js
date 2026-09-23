const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine');
const opening=()=>E.createGame(()=>.37,'usa',null,null,{mulligan:true});
test('Both sides choose among five opening cards before any game action is allowed',()=>{
 const s=opening();for(const side of ['p','e']){assert.equal(s[side].hand.length,5);assert.equal(s[side].deck.length,34);assert.equal(s[side].k,0);}
 const before=JSON.stringify(s);assert.equal(E.act(s,'p',{type:'end'}).ok,false);assert.equal(E.act(s,'p',{type:'play',id:s.p.hand[0].id}).ok,false);assert.equal(JSON.stringify(s),before);
 assert.equal(E.mulligan(s,'p',[]).ok,true);assert.equal(E.act(s,'p',{type:'end'}).ok,false);
 assert.equal(E.mulligan(s,'e',[]).ok,true);assert.equal(s.opening,null);assert.equal(s.p.hand.length,5);assert.equal(s.p.k,1);assert.equal(s.p.turns,1);assert.equal(s.e.turns,0);
 assert.equal(E.act(s,'p',{type:'end'}).ok,true);assert.equal(s.e.hand.length,6);
});
test('Replacing zero, some or all opening cards conserves cards and draws before returns are shuffled',()=>{
 for(const count of [0,2,5]){
  const s=opening(),original=s.p.hand.map(c=>c.id),pool=[...s.p.hand,...s.p.deck].map(c=>c.id).sort(),top=s.p.deck.slice(0,count).map(c=>c.id);
  const result=E.mulligan(s,'p',original.slice(0,count));assert.equal(result.ok,true);assert.deepEqual(s.p.hand.map(c=>c.id),[...top,...original.slice(count)]);
  assert.deepEqual(result.events.map(e=>e.id),top);assert.ok(original.slice(0,count).every(id=>s.p.deck.some(c=>c.id===id)));
  assert.deepEqual([...s.p.hand,...s.p.deck].map(c=>c.id).sort(),pool);assert.equal(s.p.deck.length,34);assert.equal(s.p.hand.length,5);
 }
});
test('Invalid or repeated replacement requests do not change state',()=>{
 const s=opening();for(const ids of [[s.p.hand[0].id,s.p.hand[0].id],['missing'],[s.e.hand[0].id],null]){const before=JSON.stringify(s);assert.equal(E.mulligan(s,'p',ids).ok,false);assert.equal(JSON.stringify(s),before);}
 E.mulligan(s,'p',[]);const before=JSON.stringify(s);assert.equal(E.mulligan(s,'p',[]).ok,false);assert.equal(JSON.stringify(s),before);
 E.mulligan(s,'e',[]);assert.equal(E.mulligan(s,'p',[]).ok,false);
});
test('AI keeps early units and replaces expensive cards without seeing the deck',()=>{
 const s=opening(),pool=E.LIB.p;
 s.e.hand=['marines9','blackhorse','b52','thunderchief'].map(key=>E.card(pool.find(c=>c.key===key)));s.e.hand.push(E.card(E.LIB.p.find(c=>c.key==='m60')));
 const before=JSON.stringify(s),ids=E.chooseMulligan(s,'e');assert.deepEqual(ids.sort(),s.e.hand.slice(2).map(c=>c.id).sort());assert.equal(JSON.stringify(s),before);
 s.e.deck.reverse();assert.deepEqual(E.chooseMulligan(s,'e').sort(),ids.sort());
});
test('Draw events identify exact arrivals on both sides, and distinguish overdraw from generated cards',()=>{
 const s=E.createGame(()=>.4);
 for(const side of ['p','e']){const top=s[side].deck.slice(0,2).map(c=>c.id),events=[];E.draw(s,side,2,false,events);assert.deepEqual(events.map(e=>e.id),top);assert.ok(events.every(e=>e.kind==='draw'&&e.side===side));}
 s.p.hand=Array.from({length:9},()=>E.card(E.LIB.p[0]));const id=s.p.deck[0].id,events=[];E.draw(s,'p',1,false,events);assert.deepEqual(events,[{kind:'burn',side:'p',id,fromDeck:true}]);
});
