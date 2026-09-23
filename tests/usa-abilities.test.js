const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),F=require('../dist/card-face');
const get=key=>E.LIB.p.find(c=>c.key===key)||E.GENERATED_CARDS[key];
function game(){const s=E.createGame(()=>.4);for(const who of ['p','e'])Object.assign(s[who],{hand:[],deck:[],front:[],support:[],hqIndex:0,k:30,maxK:12,graveyard:[],hp:20});return s;}
function add(s,key,side='p',zone='support',patch={}){const u=Object.assign(E.card(get(key)),patch);s[side][zone].push(u);return u;}
function play(s,key,targets=[],side='p'){const c=add(s,key,side,'hand');const r=E.act(s,side,{type:'play',id:c.id,targets});assert.equal(r.ok,true,r.error);return {c,r};}
test('M48 repairs only friendly infantry and grants Shock without reducing operation cost',()=>{
 const s=game(),inf=add(s,'marines9','p','front',{h:1,max:7}),tank=add(s,'m48'),enemy=add(s,'infantry28','e'),c=add(s,'m48','p','hand');
 assert.deepEqual(E.targetCandidates(s,'p',c),[inf.id]);
 for(const id of [tank.id,enemy.id,'hq']){const before=JSON.stringify(s);assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[id]}).ok,false);assert.equal(JSON.stringify(s),before);}
 assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[inf.id]}).ok,true);assert.equal(inf.h,7);assert.equal(inf.o,3);assert.ok(inf.kw.includes('shock'));assert.equal(F.defaultForm(inf).h,4);
 s.p.support=[];inf.o=0;play(s,'m48',[inf.id]);assert.equal(inf.o,0);
 const empty=game();play(empty,'m48');assert.equal(empty.p.support.length,1);
});
test('M60 adds a sleeping fresh M48 without triggering its Deployment and respects support capacity',()=>{
 const s=game(),inf=add(s,'marines9','p','support',{h:1});play(s,'m60');const tank=s.p.support.find(c=>c.key==='m48');
 assert.ok(tank);assert.equal(tank.sleeping,true);assert.equal(tank.h,6);assert.equal(inf.h,1);assert.equal(s.p.k,22);assert.deepEqual(F.relatedCards(get('m60')),[get('m48')]);
 const full=game();for(let i=0;i<3;i++)add(full,'sabre');play(full,'m60');assert.equal(full.p.support.length,4);assert.equal(full.p.support.some(c=>c.key==='m48'),false);
});
test('Phantom Deployment targets an enemy unit or HQ, bypasses armor and triggers Destruction',()=>{
 const s=game(),enemy=add(s,'phantom','e','support',{h:4}),c=add(s,'phantom','p','hand');
 assert.deepEqual(E.targetCandidates(s,'p',c),[enemy.id,'hq']);assert.equal(E.act(s,'p',{type:'play',id:c.id}).ok,false);
 assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[enemy.id]}).ok,true);assert.equal(enemy.h,2);
 play(s,'phantom',['hq']);assert.equal(s.e.hp,18);
 const reactive=game(),wolf=add(reactive,'wolfhounds','e','support',{h:2});play(reactive,'phantom',[wolf.id]);assert.equal(reactive.p.support.length,1);assert.equal(reactive.e.support.length,0);
});
test('Canberra draws only on a unit kill; it neither draws on HQ attacks nor on nonlethal hits',()=>{
 for(const kind of ['kill','survive','hq','full']){
  const s=game(),u=add(s,'canberra'),victim=add(s,'m48','e','support',{h:kind==='survive'?8:3});s.p.deck=[E.card(get('cia'))];
  if(kind==='full')for(let i=0;i<9;i++)add(s,'cia','p','hand');
  const r=E.act(s,'p',{type:'attack',id:u.id,target:kind==='hq'?'hq':victim.id});assert.equal(r.ok,true,r.error);
  assert.equal(s.p.deck.length,['kill','full'].includes(kind)?0:1);assert.equal(s.p.hand.length,kind==='full'?9:kind==='kill'?1:0);
  if(kind==='full')assert.equal(r.events.filter(e=>e.kind==='burn').length,1);
 }
});
test('F105 generates hidden Rolling Thunder and deals HQ damage on death, including simultaneous loss',()=>{
 const s=game();play(s,'thunderchief');assert.equal(s.p.hand[0].key,'rollingThunder');assert.deepEqual(F.relatedCards(get('thunderchief')),[get('rollingThunder')]);
 assert.equal(E.copyLimit(get('rollingThunder')),0);assert.equal(E.catalog('usa').some(c=>c.key==='rollingThunder'),false);
 s.turn='e';const b=s.p.support[0];const strike=add(s,'airStrike','e','hand');assert.equal(E.act(s,'e',{type:'play',id:strike.id,target:b.id}).ok,true);assert.equal(s.e.hp,18);
 const both=game();both.p.hp=2;both.e.hp=2;add(both,'thunderchief');add(both,'thunderchief','e');both.randomState=12345;play(both,'rollingThunder');assert.equal(both.p.support.length+both.e.support.length,0);assert.equal(both.over,true);assert.equal(both.p.hp,0);assert.equal(both.e.hp,0);
 const full=game();for(let i=0;i<9;i++)add(full,'cia','p','hand');const {r}=play(full,'thunderchief');assert.equal(full.p.hand.length,9);assert.equal(r.events.filter(e=>e.kind==='burn').length,1);
});
test('AI uses Phantom Deployment to win and cannot inspect the real random seed',()=>{
 const s=game();s.turn='e';s.p.hp=2;s.e.k=5;const c=add(s,'phantom','e','hand');const a=E.chooseAI(s,'e');assert.equal(a.id,c.id);assert.deepEqual(a.targets,['hq']);
 const random=game();random.turn='e';add(random,'rollingThunder','e','hand');add(random,'b52','p');add(random,'m48');add(random,'m48','e');
 const before=JSON.stringify(random);const first=E.chooseAI(random,'e');assert.equal(JSON.stringify(random),before);random.randomState=12345;assert.deepEqual(E.chooseAI(random,'e'),first);
});
test('Rolling Thunder chooses 1–3 distinct units TOTAL, never frontline/HQ, with both sides eligible',()=>{
 const counts=new Set(),sides=new Set();
 for(let seed=1;seed<160;seed++){
  const s=game();s.randomState=seed*100003;for(const who of ['p','e']){for(let i=0;i<4;i++)add(s,'m48',who);add(s,'m48',who,'front');}
  const {r}=play(s,'rollingThunder'),dead=r.events.filter(e=>e.kind==='destroy');counts.add(dead.length);dead.forEach(e=>sides.add(e.side));
  assert.ok(dead.length>=1&&dead.length<=3);assert.equal(new Set(dead.map(e=>e.id)).size,dead.length);assert.equal(s.p.front.length+s.e.front.length,2);assert.equal(s.p.hp+s.e.hp,40);assert.equal(s.p.k,27);
 }
 assert.deepEqual([...counts].sort(),[1,2,3]);assert.equal(sides.size,2);
 const empty=game();play(empty,'rollingThunder');assert.equal(empty.p.hp,20);
 const one=game();add(one,'m48');play(one,'rollingThunder');assert.equal(one.p.support.length,0);
});
