'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine');
const templates=[...E.LIB.p,...E.LIB.soviet,...require('./fixtures/legacy-soviet.json'),...E.LIB.france,...E.LIB.drv];
function game(k=6){const s=E.createGame(()=>.4);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:[],support:[],front:[],hqIndex:0,k,maxK:k,hp:20,graveyard:[]});s.turn='e';return s;}
function add(s,side,zone,template,patch={}){const c=Object.assign(E.card(typeof template==='string'?templates.find(c=>c.key===template):template),patch);s[side][zone].push(c);return c;}
function step(s){const a=E.chooseAI(s,'e');assert.equal(E.act(s,'e',a).ok,true);return a;}
function finishTurn(s,limit=12){for(let i=0;i<limit&&!s.over&&s.turn==='e';i++)step(s);}
test('AI takes lethal immediately instead of spending on unaffordable units',()=>{
 const s=game();s.p.hp=4;const gun=add(s,'e','support',E.LIB.e[4]);add(s,'e','hand',E.LIB.p.find(c=>c.key==='m60'));
 assert.deepEqual(step(s),{type:'attack',id:gun.id,target:'hq',boost:false});assert.equal(s.winner,'e');
});
test('AI combines a temporary attack buff with both tank attacks for lethal',()=>{
 const s=game(5);s.p.hp=10;for(let i=0;i<2;i++)add(s,'e','front',E.LIB.p[2],{a:3,o:1});const buff=add(s,'e','hand','vn_assault');
 assert.equal(step(s).id,buff.id);finishTurn(s);assert.equal(s.winner,'e');
});
test('AI gives a sleeping tank Blitz and a free move before attacking HQ',()=>{
 const s=game(3);s.p.hp=5;add(s,'e','support',E.LIB.p[2],{a:5,o:1,sleeping:true});const rapid=add(s,'e','hand','fr_rapid');
 assert.equal(step(s).id,rapid.id);finishTurn(s);assert.equal(s.winner,'e');
});
test('AI uses ammunition to reopen an exhausted tank attack and pays its surcharge',()=>{
 const s=game(5);s.p.hp=5;add(s,'e','front',E.LIB.p[2],{a:5,o:1,attacked:true,attacks:1});const ammo=add(s,'e','hand','ammo');
 assert.equal(step(s).id,ammo.id);finishTurn(s);assert.equal(s.winner,'e');assert.equal(s.e.k,0);
});
test('AI removes a Guard with its smaller attacker before the larger lethal attack',()=>{
 const s=game(2);s.p.hp=6;add(s,'p','support',E.LIB.p[0],{h:3});const small=add(s,'e','support',E.LIB.p[5]),large=add(s,'e','support',E.LIB.p[5],{a:6});
 assert.equal(step(s).id,small.id);finishTurn(s);assert.equal(s.winner,'e');assert.equal(large.attacked,true);
});
test('AI spends on removing a lethal artillery threat instead of a costly unit',()=>{
 const s=game();s.e.hp=4;const gun=add(s,'p','support',E.LIB.e[4],{a:5,h:4});add(s,'e','hand',E.LIB.p.find(c=>c.key==='m60'));const strike=add(s,'e','hand',E.LIB.p[10]);
 const action=step(s);assert.equal(action.id,strike.id);assert.equal(action.target,gun.id);assert.equal(s.p.support.length,0);
});
test('AI chooses an exhausted ally to lock while protecting a fragile attacker from retaliation',()=>{
 const s=game(4);s.e.hp=5;const idle=add(s,'e','support','pt76',{attacked:true,attacks:1}),tank=add(s,'e','front','t54a',{a:6,h:2});
 add(s,'p','front','t62',{a:6,h:6});const support=add(s,'e','hand','support');
 const action=step(s);assert.equal(action.id,support.id);assert.deepEqual(action.targets,[idle.id,tank.id]);
 finishTurn(s);assert.equal(s.p.front.length,0);assert.ok(s.e.front.some(c=>c.id===tank.id&&c.h===2));
});
test('AI places a defensive Guard next to HQ when facing lethal ground damage',()=>{
 const s=game(2);s.e.hp=3;add(s,'p','front',E.LIB.p[2],{a:5});add(s,'e','support',E.LIB.p[2],{attacked:true});s.e.hqIndex=1;
 const guard=add(s,'e','hand',E.LIB.p[0]);assert.equal(step(s).id,guard.id);
 assert.ok(E.guardSources(s,'e','support','hq').some(c=>c.id===guard.id));
});
test('AI does not play buffs with no recipients',()=>{
 const s=game();add(s,'e','hand',E.LIB.p[11]);add(s,'e','hand','fr_air');add(s,'e','hand','vn_assault');assert.equal(E.chooseAI(s,'e').type,'end');
});
test('Planning preserves live state and ignores opponent secrets and future draw order',()=>{
 const s=game(6);add(s,'e','front','t54a');add(s,'e','hand','ammo');add(s,'e','hand',E.LIB.p[9]);add(s,'p','support',E.LIB.p[0]);
 s.e.deck=[E.card(E.LIB.p[0]),E.card(E.LIB.e[4]),E.card(E.LIB.p[10])];s.p.hand=[E.card(E.LIB.p.find(c=>c.key==='m60'))];s.p.deck=[E.card(E.LIB.p[0])];
 const before=JSON.stringify(s),first=E.chooseAI(s,'e');assert.equal(JSON.stringify(s),before);
 s.p.hand=[E.card(E.LIB.p[10])];s.p.deck=[E.card(E.LIB.p.find(c=>c.key==='m60'))];s.e.deck.reverse();
 assert.deepEqual(E.chooseAI(s,'e'),first);
});
