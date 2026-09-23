const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),Face=require('../dist/card-face');
const get=key=>E.LIB.p.find(c=>c.key===key)||E.GENERATED_CARDS[key]||[...E.LIB.soviet,...require('./fixtures/legacy-soviet.json')].find(c=>c.key===key);
function game(){const s=E.createGame(()=>.4);for(const who of ['p','e'])Object.assign(s[who],{hand:[],support:[],front:[],hqIndex:0,k:30,maxK:12,deck:[],graveyard:[]});return s;}
function add(s,key,side='p',zone='support',patch={}){const u=Object.assign(E.card(get(key)),patch);s[side][zone].push(u);return u;}
function play(s,key,targets=[],side='p'){const c=add(s,key,side,'hand'),r=E.act(s,side,{type:'play',id:c.id,targets:key==='b52'&&!targets.length?['hq']:targets});assert.ok(r.ok,r.error);return {c,r};}

test('B52 aura excludes its source, stacks across both lines, and never changes printed or enemy stats',()=>{
 const s=game(),b=add(s,'b52'),other=add(s,'b52','p','front'),bomber=add(s,'canberra'),fighter=add(s,'sabre'),enemy=add(s,'canberra','e');
 assert.equal(E.attackValue(b,null,{},s),9);assert.equal(E.attackValue(other,null,{},s),9);assert.equal(E.attackValue(bomber,null,{},s),5);assert.equal(E.attackValue(fighter,null,{},s),3);assert.equal(E.attackValue(enemy,null,{},s),3);
 assert.equal(Face.defaultForm(b).a,8);assert.equal(b.a,8);assert.deepEqual(Face.relatedCards(b),[]);
 other.h=0;assert.equal(E.attackValue(b,null,{},s),8);assert.equal(E.attackValue(bomber,null,{},s),4);E.retreat(s,'p',b.id);assert.equal(E.attackValue(bomber,null,{},s),3);
 assert.equal(E.publicSnapshot(s).p.support.find(u=>u.id===bomber.id).a,3);
});
test('A lone B52 deals its printed eight attack in combat and in the board snapshot',()=>{
 const s=game(),b=add(s,'b52');assert.equal(E.attackValue(b,null,{},s),8);
 assert.equal(E.publicSnapshot(s).p.support.find(u=>u.id===b.id).a,8);
 assert.ok(E.act(s,'p',{type:'attack',id:b.id,target:'hq'}).ok);assert.equal(s.e.hp,12);
});
test('B52 aura changes real damage and expires on destruction, alongside deployment damage and no death effect',()=>{
 const s=game(),bomb=add(s,'canberra');const {c}=play(s,'b52');assert.equal(s.p.hand.length,0);
 E.act(s,'p',{type:'attack',id:bomb.id,target:'hq'});assert.equal(s.e.hp,12);
 s.turn='e';c.h=4;const strike=add(s,'airStrike','e','hand');assert.ok(E.act(s,'e',{type:'play',id:strike.id,target:c.id}).ok);
 assert.equal(s.e.hp,12);assert.equal(E.attackValue(bomb,null,{},s),3);
});
test('Marines grows once per successful retreat by either side, including its own retreat to support',()=>{
 const s=game(),m=add(s,'marines9','p','front'),enemyWatcher=add(s,'marines9','e'),enemy=add(s,'infantry28','e','front');
 E.retreat(s,'e',enemy.id);assert.deepEqual([m.a,m.h,m.max,enemyWatcher.a],[4,6,6,4]);
 E.retreat(s,'p',m.id);assert.deepEqual([m.a,m.h,m.max],[6,8,8]);
 E.retreat(s,'e',enemy.id);assert.deepEqual([m.a,m.h,enemyWatcher.a],[8,10,8]);assert.equal(s.e.hand[0].key,'infantry28');
 E.retreat(s,'p',m.id);assert.equal(s.p.support.length,0);assert.deepEqual([s.p.hand[0].a,s.p.hand[0].h],[2,4]);assert.equal(enemyWatcher.a,10);
 E.retreat(s,'e',enemyWatcher.id);assert.equal(s.p.hand[0].a,2);
});
test('A retreat into a full destination still grants growth once, and dead watchers never revive',()=>{
 const s=game(),m=add(s,'marines9'),dead=add(s,'marines9','p','front',{h:0}),target=add(s,'infantry28','e','front');for(let i=0;i<4;i++)add(s,'m48','e');
 const events=[];E.retreat(s,'e',target.id,events);assert.equal(target.h,0);assert.deepEqual([m.a,m.h,m.max],[4,6,6]);assert.equal(dead.h,0);
 assert.equal(events.filter(e=>e.kind==='buff'&&e.id===m.id).length,1);
});
test('CIA retreat grows every Marine on both sides once, including when support is full',()=>{
 for(const full of [false,true]){
  const s=game(),m=add(s,'marines9'),other=add(s,'marines9','e'),target=add(s,'infantry28','p','front');
  if(full)for(let i=0;i<3;i++)add(s,'m48');
  const {r}=play(s,'cia',[target.id]);
  assert.deepEqual([m.a,m.h,m.max],[4,6,6]);assert.equal(other.a,4);
  assert.equal(r.events.filter(e=>e.kind==='buff'&&e.id===m.id&&e.triggerId===target.id).length,1);
  assert.equal(E.publicSnapshot(s).p.support.find(c=>c.id===m.id).a,4);
 }
});
test('Retreat into a full hand and repeated retreats each grow the on-board Marines exactly once',()=>{
 const s=game(),m=add(s,'marines9'),target=add(s,'infantry28','e'),events=[];
 for(let i=0;i<9;i++)add(s,'infantry28','e','hand');
 E.retreat(s,'e',target.id,events);E.retreat(s,'e',target.id,events);
 assert.deepEqual([m.a,m.h,m.max],[4,6,6]);assert.equal(events.filter(e=>e.kind==='buff').length,1);
});
test('Mass retreat and Second Echelon use the same growth trigger',()=>{
 const s=game(),m=add(s,'marines9');add(s,'infantry28','p','front');add(s,'m48','p','front');add(s,'infantry28','e','front');
 play(s,'citation');assert.deepEqual([m.a,m.h],[8,10]);
 const next=game(),watcher=add(next,'marines9'),front=add(next,'infantry28','p','front'),tank=add(next,'m48');play(next,'echelon',[front.id,tank.id]);assert.deepEqual([watcher.a,watcher.h],[4,6]);
});
test('Blackhorse gains Guard and +1+1 once on Deployment only if a friendly tank exists',()=>{
 for(const zone of ['front','support']){
  const s=game(),tank=add(s,'m48','p',zone),{c}=play(s,'blackhorse');assert.deepEqual([c.a,c.h,c.max],[4,5,5]);assert.ok(c.kw.includes('guard'));
  tank.h=0;E.readyUnits(s,'p');assert.deepEqual([c.a,c.h],[4,5]);assert.deepEqual(Face.defaultForm(c).kw||[],[]);
 }
 const s=game();add(s,'m48','e');const {c}=play(s,'blackhorse');assert.deepEqual([c.a,c.h,c.kw.length],[3,4,0]);
 const added=game();add(added,'m48');const b=add(added,'blackhorse','p','hand');play(added,'searchAndDestroy',[b.id]);assert.deepEqual([b.a,b.h,b.kw.includes('guard')],[3,4,false]);
});
test('Iroquois targets infantry from either line and side, respecting retreat capacity and no-target deployment',()=>{
 for(const side of ['p','e'])for(const zone of ['support','front']){
  const s=game(),inf=add(s,'infantry28',side,zone),tank=add(s,'m48','e'),c=add(s,'iroquois','p','hand');assert.deepEqual(E.targetCandidates(s,'p',c),[inf.id]);
  const before=JSON.stringify(s);assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[tank.id]}).ok,false);assert.equal(JSON.stringify(s),before);
  assert.ok(E.act(s,'p',{type:'play',id:c.id,targets:[inf.id]}).ok);assert.ok(s[side][zone==='front'?'support':'hand'].some(u=>u.id===inf.id));assert.ok(s.p.support.includes(c));
 }
 const empty=game();play(empty,'iroquois');assert.equal(empty.p.support.length,1);
 const full=game(),inf=add(full,'infantry28','p','front');for(let i=0;i<3;i++)add(full,'m48');play(full,'iroquois',[inf.id]);assert.equal(full.p.front.length,0);assert.equal(full.p.support.length,4);
});
test('Iroquois retreat and Marines growth resolve together, including returned card default stats',()=>{
 const s=game(),m=add(s,'marines9'),target=add(s,'infantry28','e','support',{a:9,h:1});play(s,'iroquois',[target.id]);assert.deepEqual([m.a,m.h],[4,6]);assert.deepEqual([s.e.hand[0].a,s.e.hand[0].h],[3,2]);
});
test('AI uses the B52 aura for immediate lethal without looking at hidden cards',()=>{
 const s=game();s.turn='e';s.e.k=12;s.p.hp=8;add(s,'canberra','e');const b=add(s,'b52','e','hand');const before=JSON.stringify(s),a=E.chooseAI(s,'e');
 assert.equal(JSON.stringify(s),before);assert.equal(a.id,b.id);assert.ok(E.act(s,'e',a).ok);assert.ok(E.act(s,'e',E.chooseAI(s,'e')).ok);assert.equal(s.winner,'e');
});
