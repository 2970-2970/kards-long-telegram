const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),I=require('../dist/i18n');
const get=key=>E.LIB.p.find(c=>c.key===key)||[...E.LIB.soviet,...require('./fixtures/legacy-soviet.json')].find(c=>c.key===key)||E.GENERATED_CARDS[key];
function game(){const s=E.createGame(()=>.4);for(const side of ['p','e'])Object.assign(s[side],{hand:[],deck:[],support:[],front:[],hqIndex:0,k:12,maxK:12,graveyard:[]});return s;}
function add(s,key,side='p',zone='support',patch={}){const u=Object.assign(E.card(get(key)),patch);s[side][zone].push(u);return u;}
function play(s,key,targets=[],side='p'){const c=add(s,key,side,'hand'),r=E.act(s,side,{type:'play',id:c.id,targets,...(key==='marshall'?{choice:'draw'}:{})});assert.ok(r.ok,r.error);return r;}

test('NATO repairs every friendly line to its current maximum then permanently grants +2 defense',()=>{
 const s=game(),a=add(s,'marines9','p','front',{h:1,max:7}),b=add(s,'sabre','p','support',{h:2}),enemy=add(s,'m48','e','support',{h:1});
 play(s,'nato');assert.deepEqual([a.a,a.h,a.max,b.a,b.h,b.max],[2,9,9,3,5,5]);assert.equal(enemy.h,1);assert.equal(s.p.hp,20);assert.equal(s.p.k,7);
});
test('Marshall loses a slot and draws exactly three, respecting hand size and future turn growth',()=>{
 const s=game();s.p.k=4;s.p.maxK=4;s.p.deck=[E.card(get('m48')),E.card(get('sabre')),E.card(get('cia'))];
 play(s,'marshall');assert.deepEqual([s.p.k,s.p.maxK,s.p.hand.length,s.p.deck.length],[2,3,3,0]);
 E.act(s,'p',{type:'end'});E.act(s,'e',{type:'end'});assert.equal(s.p.maxK,4);assert.equal(s.p.k,4);
 const full=game();for(let i=0;i<8;i++)add(full,'m48','p','hand');full.p.deck=[E.card(get('sabre')),E.card(get('sabre'))];
 const r=play(full,'marshall');assert.equal(full.p.hand.length,9);assert.equal(r.events.filter(e=>e.kind==='burn').length,1);
});
test('CIA retreats only a friendly frontline target and deals 2 or 4 order damage by combat keyword',()=>{
 for(const kw of [[],['veteran'],['guard'],['heavyArmor'],['ambush'],['blitz'],['fury'],['shock'],['smokescreen']]){
  const s=game(),friend=add(s,'m48','p','front',{h:2,attacked:true}),victim=add(s,'m48','e','support',{h:8,max:8,kw,armor:2}),rear=add(s,'sabre'),order=add(s,'cia','p','hand');
  assert.deepEqual(E.targetCandidates(s,'p',order),[friend.id]);const before=JSON.stringify(s);
  assert.equal(E.act(s,'p',{type:'play',id:order.id,targets:[rear.id]}).ok,false);assert.equal(JSON.stringify(s),before);
  assert.ok(E.act(s,'p',{type:'play',id:order.id,targets:[friend.id]}).ok);assert.equal(s.p.front.length,0);assert.ok(s.p.support.includes(friend));assert.equal(friend.h,2);assert.ok(friend.attacked);
  assert.equal(victim.h,kw.length&&kw[0]!=='veteran'?4:6);
 }
 assert.ok(E.hasCombatKeyword({kw:[],tempBlitz:true}));assert.ok(E.hasCombatKeyword({kw:[],fury:true}));assert.ok(!E.hasCombatKeyword({kw:[],destruction:'drawTank',deployDamage:2}));
 assert.equal(E.hasCombatKeyword({kw:['ambush'],ambushUsed:true}),false);assert.equal(E.hasCombatKeyword({kw:['ambush','guard'],ambushUsed:true}),true);
});
test('CIA handles empty enemy support, full friendly support and Destruction on a random victim',()=>{
 const s=game(),friend=add(s,'bobcats5','p','front');for(let i=0;i<4;i++)add(s,'m48');s.p.deck=[E.card(get('m60'))];
 play(s,'cia',[friend.id]);assert.equal(s.p.front.length,0);assert.equal(s.p.support.length,4);assert.equal(s.p.hand[0].key,'m60');
 const killed=game(),retreat=add(killed,'m48','p','front');add(killed,'thunderchief','e','support',{h:2});play(killed,'cia',[retreat.id]);assert.equal(killed.e.support.length,0);assert.equal(killed.p.hp,18);
 const seen=new Set();for(let seed=1;seed<50;seed++){const g=game();g.randomState=seed*100003;const f=add(g,'m48','p','front');add(g,'m48','e');add(g,'sabre','e');const r=play(g,'cia',[f.id]);seen.add(g.e.support.find(u=>u.id===r.events.find(e=>e.kind==='damage').id).key);}assert.equal(seen.size,2);
});
test('Interdiction loses slots with a zero floor and distributes one permanent attack per friendly aircraft',()=>{
 const s=game(),tank=add(s,'m48','p','front'),inf=add(s,'infantry28');add(s,'sabre');add(s,'b52');add(s,'sabre','e');s.e.maxK=1;s.e.k=1;
 const c=add(s,'interdiction','p','hand');assert.equal(E.targetSteps(s,'p',c).length,2);
 const before=JSON.stringify(s);assert.equal(E.act(s,'p',{type:'play',id:c.id,targets:[tank.id]}).ok,false);assert.equal(JSON.stringify(s),before);
 assert.ok(E.act(s,'p',{type:'play',id:c.id,targets:[tank.id,tank.id]}).ok);assert.deepEqual([tank.a,inf.a,s.e.k,s.e.maxK],[7,3,0,0]);
 const empty=game();play(empty,'interdiction');assert.deepEqual([empty.e.k,empty.e.maxK],[11,11]);
 const airOnly=game();add(airOnly,'sabre');play(airOnly,'interdiction');assert.equal(airOnly.e.maxK,11);
});
test('Search and Destroy selects up to three distinct ground cards without deployment effects or individual costs',()=>{
 for(const count of [0,1,2,3]){
  const s=game(),inf=add(s,'marines9','p','front',{h:1}),hand=['m48','m60','pion'].map(key=>add(s,key,'p','hand'));add(s,'b52','p','hand');
  play(s,'searchAndDestroy',hand.slice(0,count).map(u=>u.id));assert.equal(s.p.k,4);assert.equal(s.p.support.length,count);assert.equal(inf.h,1);
  assert.equal(s.p.hand.length,4-count);for(const u of s.p.support){assert.ok(u.kw.includes('blitz'));assert.equal(u.sleeping,false);assert.equal(E.operationCost(s,'p',u,'attack'),Math.max(0,u.o-1));}
 }
});
test('Search selection rejects duplicate, air, board, enemy and overflowing targets atomically',()=>{
 const s=game(),ground=add(s,'m60','p','hand'),air=add(s,'sabre','p','hand'),board=add(s,'m48'),enemy=add(s,'m48','e','hand'),order=add(s,'searchAndDestroy','p','hand');
 for(const targets of [[ground.id,ground.id],[air.id],[board.id],[enemy.id]]){const before=JSON.stringify(s);assert.equal(E.act(s,'p',{type:'play',id:order.id,targets}).ok,false);assert.equal(JSON.stringify(s),before);}
 add(s,'m48');add(s,'m48');const second=add(s,'m48','p','hand');assert.equal(E.targetSteps(s,'p',order).length,1);
 assert.equal(E.act(s,'p',{type:'play',id:order.id,targets:[ground.id,second.id]}).ok,false);
 add(s,'m48');assert.equal(E.targetSteps(s,'p',order).length,0);assert.ok(E.act(s,'p',{type:'play',id:order.id,targets:[]}).ok);
});
test('Search discounts movement and attack throughout the turn, then restores the operation cost',()=>{
 const s=game(),tank=add(s,'m60','p','hand');s.p.k=10;play(s,'searchAndDestroy',[tank.id]);assert.equal(s.p.k,2);
 assert.ok(E.act(s,'p',{type:'move',id:tank.id}).ok);assert.ok(E.act(s,'p',{type:'attack',id:tank.id,target:'hq'}).ok);assert.equal(s.e.hp,14);assert.equal(s.p.k,0);
 E.act(s,'p',{type:'end'});assert.equal(tank.freeOperations,undefined);assert.equal(E.operationCost(s,'p',tank,'attack'),2);assert.ok(tank.kw.includes('blitz'));
});
test('AI enumerates all optional hand combinations without permutations and uses Search for lethal',()=>{
 const s=game();s.turn='e';s.e.k=10;s.p.hp=4;const tank=add(s,'m60','e','hand'),order=add(s,'searchAndDestroy','e','hand');
 const before=JSON.stringify(s),action=E.chooseAI(s,'e');assert.equal(JSON.stringify(s),before);assert.equal(action.id,order.id);assert.deepEqual(action.targets,[tank.id]);
 for(let i=0;i<3&&!s.over;i++){const a=E.chooseAI(s,'e');assert.ok(E.act(s,'e',a).ok);}assert.equal(s.winner,'e');
 const choices=game();for(let i=0;i<4;i++)add(choices,'m48','p','hand');const c=add(choices,'searchAndDestroy','p','hand');assert.equal(E.playActions(choices,'p',c).length,15);
});
test('Version-three decks preserve unrelated selections and cap new rarities while refilling complete plans',()=>{
 const saved=E.presetDeck('usa');saved.rulesVersion=3;saved.counts['usa:11']=2;saved.counts['usa:15']=3;saved.counts['usa:16']=0;
 let total=Object.values(saved.counts).reduce((a,b)=>a+b,0);for(const id of Object.keys(saved.counts)){while(total>45&&saved.counts[id]>1){saved.counts[id]--;total--;}}
 const next=E.migrateDeck(saved);assert.equal(E.deckIssue(next),'');assert.equal(next.rulesVersion,9);assert.equal(next.counts['usa:11'],2);assert.equal(next.counts['usa:15'],2);
 const partial=E.migrateDeck({main:'usa',ally:null,rulesVersion:3,counts:{'usa:1':3,'usa:4':2,'usa:11':2}});assert.deepEqual(partial.counts,{'usa:1':3,'usa:4':2,'usa:11':2});
});
test('Updated costs, names, rarities and bilingual text stay synchronized, with no obsolete friendly pronoun',()=>{
 assert.equal(get('rollingThunder').c,3);assert.equal(get('rollingThunder').n,'OPERATION ROLLING THUNDER');assert.ok(get('thunderchief').text.includes('OPERATION ROLLING THUNDER'));
 for(const [key,rarity] of Object.entries({marshall:'standard',cia:'limited',nato:'special',interdiction:'special',searchAndDestroy:'elite'}))assert.equal(get(key).rarity,rarity);
 for(const lang of ['zh','en']){I.setLanguage(lang);for(const key of ['marshall','cia','nato','interdiction','searchAndDestroy','rollingThunder'])assert.equal(I.skillText(get(key)),lang==='zh'?get(key).zhText:get(key).text);}
 const fs=require('node:fs'),path=require('node:path');for(const name of fs.readdirSync(path.join(__dirname,'../dist')).filter(n=>/\.(js|html)$/.test(n)))assert.equal(fs.readFileSync(path.join(__dirname,'../dist',name),'utf8').includes('\u5df1\u65b9'),false,name);
});
